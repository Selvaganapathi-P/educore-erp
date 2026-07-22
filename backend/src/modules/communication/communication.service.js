const mongoose  = require('mongoose');
const Announcement = require('./announcement.model');
const Message      = require('./message.model');

const ADMIN_ROLES = ['super_admin','school_admin','principal','vice_principal'];

// ── Announcements ─────────────────────────────────────────────────────────────

async function createAnnouncement(schoolId, userId, body) {
  const doc = await Announcement.create({
    schoolId,
    title:          body.title,
    content:        body.content,
    type:           body.type           || 'general',
    targetAudience: body.targetAudience || 'all',
    targetRoles:    body.targetRoles    || [],
    targetClasses:  body.targetClasses  || [],
    attachments:    body.attachments    || [],
    isPublished:    body.isPublished    ?? false,
    publishedAt:    body.isPublished ? new Date() : undefined,
    expiresAt:      body.expiresAt ? new Date(body.expiresAt) : undefined,
    createdBy:      userId,
  });
  return doc.populate('createdBy', 'profile.firstName profile.lastName');
}

async function listAnnouncements(schoolId, userRole, query) {
  const filter = { schoolId, isDeleted: false };

  const isAdmin = ADMIN_ROLES.includes(userRole);

  if (!isAdmin) {
    // Only published and not expired
    filter.isPublished = true;
    filter.$or = [{ expiresAt: null }, { expiresAt: { $exists: false } }, { expiresAt: { $gte: new Date() } }];

    // Audience filter
    filter.$and = [{
      $or: [
        { targetAudience: 'all' },
        { targetAudience: 'roles',   targetRoles:   userRole },
        { targetAudience: 'classes' },
      ],
    }];
  } else {
    // Admins can filter by publish status
    if (query.isPublished !== undefined) filter.isPublished = query.isPublished === 'true';
  }

  if (query.type) filter.type = query.type;

  const page  = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Number(query.limit) || 20, 100);

  const [data, total] = await Promise.all([
    Announcement.find(filter)
      .populate('createdBy', 'profile.firstName profile.lastName profile.photo')
      .populate('targetClasses', 'name')
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Announcement.countDocuments(filter),
  ]);

  return { data, total, page, pages: Math.ceil(total / limit) };
}

async function getAnnouncement(schoolId, id) {
  const doc = await Announcement.findOne({ _id: id, schoolId, isDeleted: false })
    .populate('createdBy', 'profile.firstName profile.lastName')
    .populate('targetClasses', 'name');
  if (!doc) throw Object.assign(new Error('Not found'), { status: 404 });
  return doc;
}

async function updateAnnouncement(schoolId, id, body) {
  const doc = await Announcement.findOne({ _id: id, schoolId, isDeleted: false });
  if (!doc) throw Object.assign(new Error('Not found'), { status: 404 });

  const allowed = ['title','content','type','targetAudience','targetRoles','targetClasses','attachments','expiresAt'];
  for (const k of allowed) if (body[k] !== undefined) doc[k] = body[k];

  if (body.isPublished !== undefined && !doc.isPublished && body.isPublished) {
    doc.isPublished = true;
    doc.publishedAt  = new Date();
  } else if (body.isPublished === false) {
    doc.isPublished = false;
  }

  return doc.save();
}

async function publishAnnouncement(schoolId, id) {
  const doc = await Announcement.findOne({ _id: id, schoolId, isDeleted: false });
  if (!doc) throw Object.assign(new Error('Not found'), { status: 404 });
  doc.isPublished = true;
  doc.publishedAt  = new Date();
  return doc.save();
}

async function deleteAnnouncement(schoolId, id) {
  const doc = await Announcement.findOne({ _id: id, schoolId, isDeleted: false });
  if (!doc) throw Object.assign(new Error('Not found'), { status: 404 });
  doc.isDeleted = true;
  doc.deletedAt  = new Date();
  return doc.save();
}

// ── Messages ──────────────────────────────────────────────────────────────────

async function sendMessage(schoolId, fromUserId, body) {
  const isReply = !!body.parentId;
  const threadId = isReply
    ? (body.threadId || body.parentId)
    : undefined;

  const msg = await Message.create({
    schoolId,
    fromUserId,
    toUserId:   body.toUserId,
    subject:    body.subject,
    body:       body.body,
    parentId:   body.parentId || null,
    threadId:   threadId      || null,
  });

  // If root message, set threadId = self
  if (!isReply) {
    msg.threadId = msg._id;
    await msg.save();
  }

  return msg.populate([
    { path: 'fromUserId', select: 'profile.firstName profile.lastName profile.photo' },
    { path: 'toUserId',   select: 'profile.firstName profile.lastName profile.photo' },
  ]);
}

async function getInbox(schoolId, userId, query) {
  const filter = {
    schoolId,
    toUserId:           new mongoose.Types.ObjectId(userId),
    deletedByRecipient: false,
    parentId:           null,
  };

  if (query.unread === 'true') filter.readByRecipient = false;

  const page  = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Number(query.limit) || 20, 100);

  const [data, total, unreadCount] = await Promise.all([
    Message.find(filter)
      .populate('fromUserId', 'profile.firstName profile.lastName profile.photo')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Message.countDocuments(filter),
    Message.countDocuments({ ...filter, readByRecipient: false }),
  ]);

  return { data, total, page, pages: Math.ceil(total / limit), unreadCount };
}

async function getSent(schoolId, userId, query) {
  const filter = {
    schoolId,
    fromUserId:      new mongoose.Types.ObjectId(userId),
    deletedBySender: false,
    parentId:        null,
  };

  const page  = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Number(query.limit) || 20, 100);

  const [data, total] = await Promise.all([
    Message.find(filter)
      .populate('toUserId', 'profile.firstName profile.lastName profile.photo')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Message.countDocuments(filter),
  ]);

  return { data, total, page, pages: Math.ceil(total / limit) };
}

async function getThread(schoolId, threadId, userId) {
  const oid = new mongoose.Types.ObjectId(userId);
  const msgs = await Message.find({
    schoolId,
    threadId,
    $or: [{ fromUserId: oid }, { toUserId: oid }],
  })
    .populate('fromUserId', 'profile.firstName profile.lastName profile.photo')
    .populate('toUserId',   'profile.firstName profile.lastName profile.photo')
    .sort({ createdAt: 1 });

  // Mark unread messages as read
  const unreadIds = msgs
    .filter(m => String(m.toUserId._id) === String(userId) && !m.readByRecipient)
    .map(m => m._id);

  if (unreadIds.length) {
    await Message.updateMany({ _id: { $in: unreadIds } }, { $set: { readByRecipient: true, readAt: new Date() } });
  }

  return msgs;
}

async function markRead(schoolId, messageId, userId) {
  const msg = await Message.findOne({ _id: messageId, schoolId, toUserId: userId });
  if (!msg) throw Object.assign(new Error('Not found'), { status: 404 });
  msg.readByRecipient = true;
  msg.readAt           = new Date();
  return msg.save();
}

async function deleteMessage(schoolId, messageId, userId) {
  const msg = await Message.findOne({ _id: messageId, schoolId });
  if (!msg) throw Object.assign(new Error('Not found'), { status: 404 });

  if (String(msg.fromUserId) === String(userId)) msg.deletedBySender    = true;
  if (String(msg.toUserId)   === String(userId)) msg.deletedByRecipient = true;
  return msg.save();
}

async function getUnreadCount(schoolId, userId) {
  const count = await Message.countDocuments({
    schoolId,
    toUserId:           new mongoose.Types.ObjectId(userId),
    readByRecipient:    false,
    deletedByRecipient: false,
  });
  return count;
}

// List all users in school for compose-to picker
async function listContacts(schoolId, query) {
  const User = require('../users/user.model');
  const filter = { schoolId, isActive: true };
  if (query.search) {
    const re = new RegExp(query.search, 'i');
    filter.$or = [
      { 'profile.firstName': re },
      { 'profile.lastName':  re },
    ];
  }
  return User.find(filter)
    .select('profile.firstName profile.lastName profile.photo role')
    .limit(30)
    .lean();
}

module.exports = {
  createAnnouncement, listAnnouncements, getAnnouncement, updateAnnouncement, publishAnnouncement, deleteAnnouncement,
  sendMessage, getInbox, getSent, getThread, markRead, deleteMessage, getUnreadCount, listContacts,
};
