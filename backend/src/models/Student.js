const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  admissionNumber: { type: String, required: true, unique: true, trim: true },
  name:            { type: String, required: true, trim: true },
  fatherName:      { type: String, default: '' },
  motherName:      { type: String, default: '' },
  dateOfBirth:     { type: Date },
  gender:          { type: String, enum: ['male', 'female', 'other'], default: 'male' },
  bloodGroup:      { type: String, default: '' },
  phone:           { type: String, default: '' },
  email:           { type: String, default: '' },
  address:         { type: String, default: '' },
  photo:           { type: String, default: '' },
  class:           { type: String, required: true },
  section:         { type: String, default: 'A' },
  rollNumber:      { type: String, default: '' },
  academicYear:    { type: String, required: true },
  status:          { type: String, enum: ['active', 'inactive', 'transferred'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
