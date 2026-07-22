const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  schoolId:       { type: mongoose.Schema.Types.ObjectId, ref: 'School',   required: true },
  homeworkId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Homework', required: true },
  studentId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Student',  required: true },
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  submittedAt:    Date,
  status:         { type: String, enum: ['pending','submitted','late','graded','returned'], default: 'pending' },
  content:        { type: String, default: '' },
  attachments:    [{ name: String, url: String, type: String, _id: false }],
  grade:          { type: Number, default: null },
  feedback:       { type: String, default: '' },
  gradedBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  gradedAt:       Date,
  isLate:         { type: Boolean, default: false },
  penaltyApplied: { type: Number, default: 0 },
  finalGrade:     { type: Number, default: null },
}, { timestamps: true });

submissionSchema.index({ homeworkId: 1, studentId: 1 }, { unique: true });
submissionSchema.index({ schoolId: 1, studentId: 1, status: 1 });
submissionSchema.index({ schoolId: 1, homeworkId: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
