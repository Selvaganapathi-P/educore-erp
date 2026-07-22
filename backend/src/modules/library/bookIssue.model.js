const mongoose = require('mongoose');

const bookIssueSchema = new mongoose.Schema({
  schoolId:    { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
  bookId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Book',   required: true },

  // Member can be a student or staff
  memberId:    { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'memberModel' },
  memberModel: { type: String, required: true, enum: ['Student', 'Staff'] },
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // denormalized for display

  issueDate:   { type: Date, required: true, default: Date.now },
  dueDate:     { type: Date, required: true },
  returnDate:  { type: Date },

  finePerDay:  { type: Number, default: 1 },
  fineDays:    { type: Number, default: 0 },
  fineAmount:  { type: Number, default: 0 },
  finePaid:    { type: Boolean, default: false },

  issuedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  returnedTo:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  status:      { type: String, enum: ['issued','returned','overdue','lost','renewed'], default: 'issued' },
  notes:       { type: String },
  renewCount:  { type: Number, default: 0 },
}, { timestamps: true });

bookIssueSchema.index({ schoolId: 1, status: 1, dueDate: 1 });
bookIssueSchema.index({ schoolId: 1, memberId: 1, status: 1 });
bookIssueSchema.index({ schoolId: 1, bookId: 1 });

module.exports = mongoose.model('BookIssue', bookIssueSchema);
