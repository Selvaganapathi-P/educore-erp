const express = require('express');
const router  = express.Router();
const ctrl    = require('./library.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { requireTenant }           = require('../../middleware/tenant.middleware');
const { validate }                = require('../../middleware/validate.middleware');
const { createBookSchema, issueBookSchema, returnBookSchema } = require('./library.schema');

const ADMIN = ['super_admin','school_admin','principal'];
const LIB   = [...ADMIN, 'librarian'];
const ALL   = [...LIB, 'teacher','student','parent'];

router.use(authenticate, requireTenant);

// Dashboard & search
router.get('/dashboard',       authorize(...LIB),  ctrl.dashboard);
router.get('/members/search',  authorize(...LIB),  ctrl.searchMembers);
router.get('/categories',      authorize(...ALL),   ctrl.listCategories);

// Books
router.post  ('/books',     authorize(...LIB), validate(createBookSchema), ctrl.createBook);
router.get   ('/books',     authorize(...ALL), ctrl.listBooks);
router.get   ('/books/:id', authorize(...ALL), ctrl.getBook);
router.put   ('/books/:id', authorize(...LIB), ctrl.updateBook);
router.delete('/books/:id', authorize(...LIB), ctrl.deleteBook);

// Issues
router.post  ('/issues',           authorize(...LIB), validate(issueBookSchema), ctrl.issueBook);
router.get   ('/issues',           authorize(...LIB), ctrl.listIssues);
router.get   ('/issues/overdue',   authorize(...LIB), ctrl.getOverdue);
router.patch ('/issues/:id/return',authorize(...LIB), validate(returnBookSchema), ctrl.returnBook);
router.patch ('/issues/:id/renew', authorize(...LIB), ctrl.renewBook);

module.exports = router;
