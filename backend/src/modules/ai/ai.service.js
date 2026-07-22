const mongoose = require('mongoose');
const AiConversation = require('./aiConversation.model');

const AI_MODEL  = 'claude-haiku-4-5-20251001';
const MAX_TOKENS = 1500;
const MAX_CTX_MESSAGES = 20; // keep last N messages as context

function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw Object.assign(
      new Error('AI features require ANTHROPIC_API_KEY to be set in environment variables.'),
      { status: 503 }
    );
  }
  // Require lazily so the app doesn't crash when API key is missing
  const Anthropic = require('@anthropic-ai/sdk');
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

// ── School context builder ────────────────────────────────────────────────────

async function buildSystemPrompt(schoolId) {
  let contextLines = [];

  try {
    const sId = new mongoose.Types.ObjectId(String(schoolId));

    const Student    = (() => { try { return mongoose.model('Student');    } catch { return null; } })();
    const Staff      = (() => { try { return mongoose.model('Staff');      } catch { return null; } })();
    const FeeInvoice = (() => { try { return mongoose.model('FeeInvoice'); } catch { return null; } })();
    const School     = (() => { try { return mongoose.model('School');     } catch { return null; } })();

    const [school, students, staff, feeStats] = await Promise.all([
      School   ? School.findById(schoolId).select('name address').lean() : null,
      Student  ? Student.countDocuments({ schoolId, isDeleted: false }) : 0,
      Staff    ? Staff.countDocuments({ schoolId, isDeleted: false }) : 0,
      FeeInvoice ? FeeInvoice.aggregate([
        { $match: { schoolId: sId, isDeleted: false } },
        { $group: { _id: null, totalInvoiced: { $sum: '$totalAmount' }, totalCollected: { $sum: '$paidAmount' } } },
      ]) : [],
    ]);

    const fee = feeStats[0] || { totalInvoiced: 0, totalCollected: 0 };
    const collPct = fee.totalInvoiced ? Math.round((fee.totalCollected / fee.totalInvoiced) * 100) : 0;

    if (school?.name) contextLines.push(`School Name: ${school.name}`);
    contextLines.push(`Total Students: ${students}`);
    contextLines.push(`Total Staff: ${staff}`);
    contextLines.push(`Fee Collection: ₹${Math.round(fee.totalCollected).toLocaleString()} collected (${collPct}% of ₹${Math.round(fee.totalInvoiced).toLocaleString()} invoiced)`);
  } catch {
    contextLines.push('School data unavailable at this time.');
  }

  return `You are an AI assistant embedded in EduCore ERP — a school management system.

Current School Data:
${contextLines.map(l => `• ${l}`).join('\n')}

Your capabilities:
- Answer questions about school operations, students, staff, fees, attendance, and academics
- Analyze data trends and provide actionable recommendations
- Help draft announcements, notices, circulars, letters, and communications
- Suggest improvements for school management

Guidelines:
- Be professional, concise, and helpful
- When asked for reports or analyses, structure your response clearly
- For sensitive student data, remind users to follow privacy policies
- Always tailor advice to the school context provided above`;
}

// ── Chat (streaming) ──────────────────────────────────────────────────────────

async function streamChat(schoolId, userId, { conversationId, message }, res) {
  const client = getClient();

  // Load or create conversation
  let conv;
  if (conversationId) {
    conv = await AiConversation.findOne({ _id: conversationId, schoolId, isDeleted: false });
    if (!conv) throw Object.assign(new Error('Conversation not found'), { status: 404 });
  } else {
    conv = new AiConversation({
      schoolId, userId,
      title: message.substring(0, 70) + (message.length > 70 ? '…' : ''),
      messages: [],
    });
  }

  conv.messages.push({ role: 'user', content: message, createdAt: new Date() });

  const systemPrompt    = await buildSystemPrompt(schoolId);
  const contextMessages = conv.messages.slice(-MAX_CTX_MESSAGES).map(m => ({ role: m.role, content: m.content }));

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send conversation ID immediately so the client can update URL/state
  res.write(`data: ${JSON.stringify({ conversationId: conv._id })}\n\n`);

  let fullResponse = '';

  try {
    const stream = await client.messages.create({
      model:      AI_MODEL,
      max_tokens: MAX_TOKENS,
      system:     systemPrompt,
      messages:   contextMessages,
      stream:     true,
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
        const text = event.delta.text;
        fullResponse += text;
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }
  } catch (apiErr) {
    res.write(`data: ${JSON.stringify({ error: apiErr.message })}\n\n`);
  }

  res.write('data: [DONE]\n\n');
  res.end();

  // Persist conversation with AI response
  if (fullResponse) {
    conv.messages.push({ role: 'assistant', content: fullResponse, createdAt: new Date() });
  }
  await conv.save();
}

// ── Conversations ─────────────────────────────────────────────────────────────

async function listConversations(schoolId, userId, { page = 1, limit = 20 } = {}) {
  const [data, total] = await Promise.all([
    AiConversation.find({ schoolId, userId, isDeleted: false })
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('title updatedAt messages')
      .lean(),
    AiConversation.countDocuments({ schoolId, userId, isDeleted: false }),
  ]);
  // Strip message bodies from list (just keep count)
  return {
    data: data.map(c => ({ ...c, messageCount: c.messages?.length ?? 0, messages: undefined })),
    total, page: Number(page), pages: Math.ceil(total / limit),
  };
}

async function getConversation(schoolId, userId, convId) {
  return AiConversation.findOne({ _id: convId, schoolId, userId, isDeleted: false }).lean();
}

async function deleteConversation(schoolId, userId, convId) {
  const conv = await AiConversation.findOneAndUpdate(
    { _id: convId, schoolId, userId, isDeleted: false },
    { $set: { isDeleted: true, deletedAt: new Date() } },
    { new: true },
  );
  if (!conv) throw Object.assign(new Error('Conversation not found'), { status: 404 });
}

// ── AI Insights ───────────────────────────────────────────────────────────────

async function generateInsights(schoolId) {
  const client = getClient();

  const sId = new mongoose.Types.ObjectId(String(schoolId));
  const Student    = (() => { try { return mongoose.model('Student');    } catch { return null; } })();
  const Staff      = (() => { try { return mongoose.model('Staff');      } catch { return null; } })();
  const FeeInvoice = (() => { try { return mongoose.model('FeeInvoice'); } catch { return null; } })();
  const Attendance = (() => { try { return mongoose.model('Attendance'); } catch { return null; } })();
  const MedicalVisit = (() => { try { return mongoose.model('MedicalVisit'); } catch { return null; } })();

  const [students, staff, feeStats, attendanceStats, healthStats] = await Promise.all([
    Student  ? Student.countDocuments({ schoolId, isDeleted: false }) : 0,
    Staff    ? Staff.countDocuments({ schoolId, isDeleted: false }) : 0,
    FeeInvoice ? FeeInvoice.aggregate([
      { $match: { schoolId: sId, isDeleted: false } },
      { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$totalAmount' } } },
    ]) : [],
    Attendance ? Attendance.aggregate([
      { $match: { schoolId: sId, date: { $gte: new Date(Date.now() - 30 * 24 * 3600000) } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]).catch(() => []) : [],
    MedicalVisit ? MedicalVisit.countDocuments({ schoolId, isDeleted: false, visitDate: { $gte: new Date(Date.now() - 30 * 24 * 3600000) } }) : 0,
  ]);

  const feeMap   = Object.fromEntries(feeStats.map(f => [f._id, f]));
  const attendMap= Object.fromEntries(attendanceStats.map(a => [a._id, a.count]));

  const dataContext = {
    totalStudents:    students,
    totalStaff:       staff,
    feesPaid:         feeMap.paid?.count    ?? 0,
    feesUnpaid:       feeMap.unpaid?.count  ?? 0,
    feesOverdue:      feeMap.overdue?.count ?? 0,
    attendance30Days: attendMap,
    healthVisits30Days: healthStats,
  };

  const prompt = `You are analyzing school management data for EduCore ERP. Based on the following school metrics, generate exactly 6 specific, actionable insights.

Data:
${JSON.stringify(dataContext, null, 2)}

Respond ONLY with valid JSON in this exact format (no markdown, no explanation):
{
  "insights": [
    {
      "category": "Fees | Attendance | Health | Operations | Academic | HR",
      "title": "Short insight title (max 8 words)",
      "description": "Specific insight with data reference and clear recommendation (2-3 sentences)",
      "priority": "high | medium | low",
      "action": "Short recommended action (max 10 words)"
    }
  ]
}`;

  const response = await client.messages.create({
    model:      AI_MODEL,
    max_tokens: 1200,
    messages:   [{ role: 'user', content: prompt }],
  });

  const text = response.content[0]?.text ?? '';
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch { /* fall through */ }
  }
  return { insights: [{ category: 'Operations', title: 'Data analysis complete', description: text, priority: 'medium', action: 'Review full report' }] };
}

// ── Content Generator ─────────────────────────────────────────────────────────

const CONTENT_PROMPTS = {
  announcement: (d) => `Write a formal school announcement with the following details:
Title: ${d.title || 'School Announcement'}
Audience: ${d.audience || 'All Students and Parents'}
Date: ${d.date || 'Immediately'}
Key Points: ${d.keyPoints || d.details || ''}
Tone: ${d.tone || 'Professional and clear'}

Format: Start with "ANNOUNCEMENT", include date, recipient line, body paragraphs, and school signature block.`,

  notice: (d) => `Write a formal school notice:
Subject: ${d.subject || d.title || 'Important Notice'}
To: ${d.audience || 'All Students'}
From: The Principal
Date: ${d.date || 'Today'}
Details: ${d.details || ''}

Format: Brief, formal notice. Use numbered points if listing multiple items. End with appropriate closing.`,

  circular: (d) => `Write a formal school circular:
Subject: ${d.subject || d.title || ''}
Reference No: ${d.refNo || 'CIRC/2025/001'}
Date: ${d.date || 'Today'}
To: ${d.audience || 'All Staff and Students'}
Content: ${d.details || ''}

Format: Formal circular format with reference number, proper salutation, numbered clauses, and authorized signatory.`,

  parent_letter: (d) => `Write a letter from school to parents:
Subject: ${d.subject || d.title || ''}
Regarding: ${d.details || ''}
Student Name: ${d.studentName || '[Student Name]'}
Class: ${d.class || '[Class]'}
Action Required: ${d.action || 'None'}

Format: Formal letter format. Address parents respectfully. Be clear about any required action.`,

  exam_notice: (d) => `Write a formal examination notice:
Exam Name: ${d.examName || d.title || ''}
Classes: ${d.classes || 'All Classes'}
Start Date: ${d.startDate || ''}
End Date: ${d.endDate || ''}
Special Instructions: ${d.details || ''}

Format: Clear exam schedule notice with important instructions, do's and don'ts, and contact for queries.`,

  achievement: (d) => `Write a congratulatory announcement for a school achievement:
Achievement: ${d.achievement || d.title || ''}
Recipient(s): ${d.recipients || ''}
Event/Competition: ${d.event || ''}
Details: ${d.details || ''}

Format: Celebratory announcement acknowledging the achievement, encouraging the school community.`,

  holiday_notice: (d) => `Write a school holiday notice:
Holiday Name: ${d.holidayName || d.title || ''}
Date(s): ${d.dates || ''}
Reason: ${d.reason || ''}
Return Date: ${d.returnDate || ''}
Additional Info: ${d.details || ''}

Format: Clear holiday notice with dates, any pre-holiday instructions, and return schedule.`,

  meeting_notice: (d) => `Write a notice for a school meeting:
Meeting Type: ${d.meetingType || d.title || ''}
Date & Time: ${d.datetime || ''}
Venue: ${d.venue || ''}
Agenda: ${d.agenda || d.details || ''}
Attendees: ${d.attendees || ''}

Format: Formal meeting notice with agenda points and RSVP if needed.`,
};

async function generateContent(schoolId, { template, details }) {
  const client = getClient();

  const promptFn = CONTENT_PROMPTS[template];
  if (!promptFn) throw Object.assign(new Error(`Unknown template: ${template}`), { status: 400 });

  const School = (() => { try { return mongoose.model('School'); } catch { return null; } })();
  const school = School ? await School.findById(schoolId).select('name address').lean() : null;

  const system = `You are a professional school administrator at ${school?.name || 'our school'}.
Write clear, formal school communications. Use proper formatting.
Do not include placeholders in brackets unless the information was not provided.
Keep language appropriate for an educational institution.`;

  const response = await client.messages.create({
    model:      AI_MODEL,
    max_tokens: 800,
    system,
    messages: [{ role: 'user', content: promptFn(details) }],
  });

  return { content: response.content[0]?.text ?? '' };
}

module.exports = {
  streamChat,
  listConversations, getConversation, deleteConversation,
  generateInsights,
  generateContent,
};
