const svc = require('./library.service');
const { asyncHandler }   = require('../../utils/asyncHandler');
const { createAuditLog } = require('../../utils/auditLog');

const h = asyncHandler;

// Books
const createBook    = h(async (req, res) => {
  const data = await svc.createBook(req.schoolId, req.body);
  await createAuditLog({ schoolId: req.schoolId, userId: req.user._id, action: 'BOOK_ADDED', entity: 'Book', entityId: data._id, details: data.title });
  res.status(201).json({ success: true, data });
});
const listBooks     = h(async (req, res) => { const r = await svc.listBooks(req.schoolId, req.query); res.json({ success: true, ...r }); });
const getBook       = h(async (req, res) => { const data = await svc.getBook(req.schoolId, req.params.id); res.json({ success: true, data }); });
const updateBook    = h(async (req, res) => { const data = await svc.updateBook(req.schoolId, req.params.id, req.body); res.json({ success: true, data }); });
const deleteBook    = h(async (req, res) => { await svc.deleteBook(req.schoolId, req.params.id); res.json({ success: true, message: 'Deleted' }); });
const listCategories= h(async (req, res) => { const data = await svc.listCategories(req.schoolId); res.json({ success: true, data }); });

// Issues
const issueBook  = h(async (req, res) => {
  const data = await svc.issueBook(req.schoolId, req.body, req.user._id);
  await createAuditLog({ schoolId: req.schoolId, userId: req.user._id, action: 'BOOK_ISSUED', entity: 'BookIssue', entityId: data._id, details: data.bookId?.title });
  res.status(201).json({ success: true, data });
});
const returnBook = h(async (req, res) => {
  const data = await svc.returnBook(req.schoolId, req.params.id, req.body, req.user._id);
  await createAuditLog({ schoolId: req.schoolId, userId: req.user._id, action: 'BOOK_RETURNED', entity: 'BookIssue', entityId: data._id });
  res.json({ success: true, data });
});
const renewBook  = h(async (req, res) => {
  const data = await svc.renewBook(req.schoolId, req.params.id, req.body.extraDays);
  res.json({ success: true, data });
});
const listIssues = h(async (req, res) => { const r = await svc.listIssues(req.schoolId, req.query); res.json({ success: true, ...r }); });
const getOverdue = h(async (req, res) => { const data = await svc.getOverdue(req.schoolId); res.json({ success: true, data }); });

// Dashboard & search
const dashboard     = h(async (req, res) => { const data = await svc.getDashboard(req.schoolId); res.json({ success: true, data }); });
const searchMembers = h(async (req, res) => {
  const data = await svc.searchMembers(req.schoolId, req.query.search || '', req.query.type);
  res.json({ success: true, data });
});

module.exports = { createBook, listBooks, getBook, updateBook, deleteBook, listCategories, issueBook, returnBook, renewBook, listIssues, getOverdue, dashboard, searchMembers };
