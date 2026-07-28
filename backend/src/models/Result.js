const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  marks:     { type: Number, required: true, min: 0 },
  maxMarks:  { type: Number, default: 100 },
}, { _id: false });

const resultSchema = new mongoose.Schema({
  studentId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  examType:     { type: String, enum: ['unit_test', 'quarterly', 'half_yearly', 'annual'], required: true },
  academicYear: { type: String, required: true },
  subjects:     [subjectSchema],
  total:        { type: Number, default: 0 },
  maxTotal:     { type: Number, default: 0 },
  percentage:   { type: Number, default: 0 },
  grade:        { type: String, default: '' },
  result:       { type: String, enum: ['pass', 'fail'], default: 'pass' },
  publishedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

resultSchema.pre('save', function (next) {
  if (this.subjects?.length) {
    this.total    = this.subjects.reduce((s, sub) => s + sub.marks, 0);
    this.maxTotal = this.subjects.reduce((s, sub) => s + sub.maxMarks, 0);
    this.percentage = this.maxTotal > 0 ? parseFloat(((this.total / this.maxTotal) * 100).toFixed(2)) : 0;

    const p = this.percentage;
    if (p >= 90) this.grade = 'A+';
    else if (p >= 80) this.grade = 'A';
    else if (p >= 70) this.grade = 'B+';
    else if (p >= 60) this.grade = 'B';
    else if (p >= 50) this.grade = 'C';
    else if (p >= 35) this.grade = 'D';
    else this.grade = 'F';

    this.result = p >= 35 ? 'pass' : 'fail';
  }
  next();
});

module.exports = mongoose.model('Result', resultSchema);
