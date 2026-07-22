const mongoose = require('mongoose');
const dayjs     = require('dayjs');
const Book      = require('./book.model');
const BookIssue = require('./bookIssue.model');

const DEFAULT_LOAN_DAYS = 14;
const DEFAULT_FINE_DAY  = 1;

// ── Books ─────────────────────────────────────────────────────────────────────

async function createBook(schoolId, body) {
  const book = await Book.create({
    schoolId,
    title:        body.title,
    author:       body.author,
    isbn:         body.isbn         || undefined,
    category:     body.category     || '',
    publisher:    body.publisher    || '',
    edition:      body.edition      || '',
    language:     body.language     || 'English',
    tags:         body.tags         || [],
    coverImage:   body.coverImage   || '',
    location:     body.location     || '',
    totalCopies:    Number(body.totalCopies) || 1,
    availableCopies: Number(body.totalCopies) || 1,
    description:  body.description  || '',
  });
  return book;
}

async function listBooks(schoolId, query) {
  const filter = { schoolId, isDeleted: false };

  if (query.search) {
    filter.$text = { $search: query.search };
  }
  if (query.category) filter.category = query.category;
  if (query.available === 'true') filter.availableCopies = { $gt: 0 };

  const page  = Math.max(Number(query.page)  || 1, 1);
  const limit = Math.min(Number(query.limit) || 25, 100);

  const [data, total] = await Promise.all([
    Book.find(filter)
      .sort(query.search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Book.countDocuments(filter),
  ]);

  return { data, total, page, pages: Math.ceil(total / limit) };
}

async function getBook(schoolId, id) {
  const book = await Book.findOne({ _id: id, schoolId, isDeleted: false }).lean();
  if (!book) throw Object.assign(new Error('Book not found'), { status: 404 });
  const issued = await BookIssue.countDocuments({ bookId: id, schoolId, status: { $in: ['issued','overdue'] } });
  return { ...book, issuedCopies: issued };
}

async function updateBook(schoolId, id, body) {
  const book = await Book.findOne({ _id: id, schoolId, isDeleted: false });
  if (!book) throw Object.assign(new Error('Book not found'), { status: 404 });

  const allowed = ['title','author','isbn','category','publisher','edition','language','tags','coverImage','location','description'];
  for (const k of allowed) if (body[k] !== undefined) book[k] = body[k];

  if (body.totalCopies !== undefined) {
    const delta = Number(body.totalCopies) - book.totalCopies;
    book.totalCopies     = Number(body.totalCopies);
    book.availableCopies = Math.max(0, book.availableCopies + delta);
  }

  return book.save();
}

async function deleteBook(schoolId, id) {
  const active = await BookIssue.countDocuments({ bookId: id, schoolId, status: { $in: ['issued','overdue'] } });
  if (active) throw Object.assign(new Error('Cannot delete — book has active issues'), { status: 400 });

  const book = await Book.findOne({ _id: id, schoolId, isDeleted: false });
  if (!book) throw Object.assign(new Error('Book not found'), { status: 404 });
  book.isDeleted = true;
  book.deletedAt  = new Date();
  return book.save();
}

async function listCategories(schoolId) {
  return Book.distinct('category', { schoolId, isDeleted: false });
}

// ── Issue / Return ────────────────────────────────────────────────────────────

async function issueBook(schoolId, body, issuedBy) {
  const book = await Book.findOne({ _id: body.bookId, schoolId, isDeleted: false });
  if (!book)                   throw Object.assign(new Error('Book not found'), { status: 404 });
  if (book.availableCopies < 1) throw Object.assign(new Error('No copies available'), { status: 400 });

  // Prevent duplicate active issue for the same member+book
  const existing = await BookIssue.findOne({ schoolId, bookId: book._id, memberId: body.memberId, status: { $in: ['issued','overdue'] } });
  if (existing) throw Object.assign(new Error('Member already has this book issued'), { status: 400 });

  const dueDate = body.dueDate
    ? new Date(body.dueDate)
    : dayjs().add(DEFAULT_LOAN_DAYS, 'day').toDate();

  // Resolve userId from member
  let userId;
  if (body.memberModel === 'Student') {
    const Student = require('../students/student.model');
    const s = await Student.findOne({ _id: body.memberId, schoolId }).select('userId').lean();
    userId = s?.userId;
  } else {
    const Staff = require('../staff/staff.model');
    const s = await Staff.findOne({ _id: body.memberId, schoolId }).select('userId').lean();
    userId = s?.userId;
  }

  const issue = await BookIssue.create({
    schoolId,
    bookId:      book._id,
    memberId:    body.memberId,
    memberModel: body.memberModel,
    userId,
    issueDate:   new Date(),
    dueDate,
    finePerDay:  body.finePerDay ?? DEFAULT_FINE_DAY,
    issuedBy,
    notes:       body.notes || '',
  });

  book.availableCopies -= 1;
  await book.save();

  return issue.populate([
    { path: 'bookId', select: 'title author isbn' },
    { path: 'issuedBy', select: 'profile.firstName profile.lastName' },
  ]);
}

async function returnBook(schoolId, issueId, body, returnedBy) {
  const issue = await BookIssue.findOne({ _id: issueId, schoolId });
  if (!issue)                         throw Object.assign(new Error('Issue record not found'), { status: 404 });
  if (issue.status === 'returned')    throw Object.assign(new Error('Already returned'), { status: 400 });

  const returnDate = new Date();
  const overdueDays = Math.max(0, dayjs(returnDate).diff(dayjs(issue.dueDate), 'day'));
  const fineAmount  = overdueDays * (issue.finePerDay || DEFAULT_FINE_DAY);

  issue.returnDate  = returnDate;
  issue.status      = 'returned';
  issue.fineDays    = overdueDays;
  issue.fineAmount  = fineAmount;
  issue.finePaid    = body.finePaid ?? (fineAmount === 0);
  issue.returnedTo  = returnedBy;
  issue.notes       = body.notes || issue.notes;
  await issue.save();

  const book = await Book.findById(issue.bookId);
  if (book) { book.availableCopies += 1; await book.save(); }

  return issue.populate([
    { path: 'bookId', select: 'title author isbn' },
    { path: 'userId', select: 'profile.firstName profile.lastName' },
  ]);
}

async function renewBook(schoolId, issueId, extraDays) {
  const issue = await BookIssue.findOne({ _id: issueId, schoolId, status: { $in: ['issued','overdue'] } });
  if (!issue) throw Object.assign(new Error('Active issue not found'), { status: 404 });
  if (issue.renewCount >= 2) throw Object.assign(new Error('Renewal limit reached (max 2)'), { status: 400 });

  const days    = extraDays || DEFAULT_LOAN_DAYS;
  issue.dueDate = dayjs(issue.dueDate).add(days, 'day').toDate();
  issue.status  = 'renewed';
  issue.renewCount += 1;
  return issue.save();
}

async function listIssues(schoolId, query) {
  const filter = { schoolId };
  if (query.status)   filter.status   = query.status.includes(',') ? { $in: query.status.split(',') } : query.status;
  if (query.memberId) filter.memberId = query.memberId;
  if (query.bookId)   filter.bookId   = query.bookId;

  const page  = Math.max(Number(query.page)  || 1, 1);
  const limit = Math.min(Number(query.limit) || 25, 100);

  const [data, total] = await Promise.all([
    BookIssue.find(filter)
      .populate('bookId',  'title author isbn')
      .populate('userId',  'profile.firstName profile.lastName')
      .sort({ issueDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    BookIssue.countDocuments(filter),
  ]);

  return { data, total, page, pages: Math.ceil(total / limit) };
}

async function getOverdue(schoolId) {
  const now = new Date();
  const issues = await BookIssue.find({
    schoolId,
    status: { $in: ['issued','renewed'] },
    dueDate: { $lt: now },
  })
    .populate('bookId', 'title author')
    .populate('userId', 'profile.firstName profile.lastName')
    .sort({ dueDate: 1 })
    .lean();

  return issues.map(i => ({
    ...i,
    overdueDays:    dayjs(now).diff(dayjs(i.dueDate), 'day'),
    accruedFine:    dayjs(now).diff(dayjs(i.dueDate), 'day') * (i.finePerDay || DEFAULT_FINE_DAY),
  }));
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

async function getDashboard(schoolId) {
  const sid = new mongoose.Types.ObjectId(schoolId);
  const now = new Date();

  const [bookStats, issueStats, overdueList, recentIssues] = await Promise.all([
    Book.aggregate([
      { $match: { schoolId: sid, isDeleted: false } },
      { $group: { _id: null, totalBooks: { $sum: '$totalCopies' }, totalTitles: { $sum: 1 }, available: { $sum: '$availableCopies' } } },
    ]),
    BookIssue.aggregate([
      { $match: { schoolId: sid } },
      { $group: { _id: '$status', count: { $sum: 1 }, totalFine: { $sum: '$fineAmount' } } },
    ]),
    BookIssue.countDocuments({ schoolId, status: { $in: ['issued','renewed'] }, dueDate: { $lt: now } }),
    BookIssue.find({ schoolId })
      .populate('bookId', 'title author')
      .populate('userId', 'profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .limit(6),
  ]);

  const bs = bookStats[0] ?? {};
  const byStatus = Object.fromEntries(issueStats.map(s => [s._id, { count: s.count, fine: s.totalFine }]));
  const fineCollected = issueStats.filter(s => s._id === 'returned').reduce((t, s) => t + s.totalFine, 0);

  return {
    totalTitles:    bs.totalTitles  ?? 0,
    totalCopies:    bs.totalBooks   ?? 0,
    availableCopies:bs.available    ?? 0,
    issuedCount:    (byStatus.issued?.count ?? 0) + (byStatus.renewed?.count ?? 0),
    overdueCount:   overdueList,
    fineCollected,
    byStatus,
    recentIssues,
  };
}

// Search members (students + staff) for issue picker
async function searchMembers(schoolId, search, type) {
  if (type === 'Staff' || !type) {
    const Staff   = require('../staff/staff.model');
    const re = new RegExp(search, 'i');
    const staff = await Staff.find({
      schoolId, isDeleted: false,
      $or: [{ employeeId: re }],
    })
      .populate('userId', 'profile.firstName profile.lastName profile.photo')
      .select('employeeId designation userId')
      .limit(10)
      .lean();

    if (type === 'Staff') return staff.map(s => ({ ...s, _memberModel: 'Staff' }));
  }

  if (type === 'Student' || !type) {
    const Student = require('../students/student.model');
    const re = new RegExp(search, 'i');
    const students = await Student.find({
      schoolId, isDeleted: false,
      $or: [{ rollNumber: re }],
    })
      .populate('userId', 'profile.firstName profile.lastName profile.photo')
      .populate('currentClass', 'name')
      .select('rollNumber admissionNo currentClass userId')
      .limit(10)
      .lean();

    return students.map(s => ({ ...s, _memberModel: 'Student' }));
  }

  return [];
}

module.exports = {
  createBook, listBooks, getBook, updateBook, deleteBook, listCategories,
  issueBook, returnBook, renewBook, listIssues, getOverdue,
  getDashboard, searchMembers,
};
