const { asyncHandler } = require('../../utils/asyncHandler');
const svc = require('./ai.service');

// POST /api/ai/chat  — streaming SSE
const streamChat = asyncHandler(async (req, res) => {
  const { conversationId, message } = req.body;
  if (!message?.trim()) {
    res.status(400).json({ success: false, message: 'Message is required' });
    return;
  }
  await svc.streamChat(req.schoolId, req.user._id, { conversationId, message: message.trim() }, res);
});

// GET /api/ai/conversations
const listConversations = asyncHandler(async (req, res) => {
  const result = await svc.listConversations(req.schoolId, req.user._id, req.query);
  res.json({ success: true, ...result });
});

// GET /api/ai/conversations/:id
const getConversation = asyncHandler(async (req, res) => {
  const conv = await svc.getConversation(req.schoolId, req.user._id, req.params.id);
  if (!conv) return res.status(404).json({ success: false, message: 'Conversation not found' });
  res.json({ success: true, data: conv });
});

// DELETE /api/ai/conversations/:id
const deleteConversation = asyncHandler(async (req, res) => {
  await svc.deleteConversation(req.schoolId, req.user._id, req.params.id);
  res.json({ success: true, message: 'Conversation deleted' });
});

// POST /api/ai/insights
const generateInsights = asyncHandler(async (req, res) => {
  const data = await svc.generateInsights(req.schoolId);
  res.json({ success: true, data });
});

// POST /api/ai/content
const generateContent = asyncHandler(async (req, res) => {
  const { template, details } = req.body;
  if (!template) return res.status(400).json({ success: false, message: 'Template is required' });
  const data = await svc.generateContent(req.schoolId, { template, details: details || {} });
  res.json({ success: true, data });
});

module.exports = { streamChat, listConversations, getConversation, deleteConversation, generateInsights, generateContent };
