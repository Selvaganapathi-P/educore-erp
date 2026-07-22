const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema(
  {
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    schoolId:  { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    admissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admission', default: null },

    rollNumber:    { type: String },
    admissionNo:   { type: String },
    class:         { type: String, required: true },
    section:       { type: String, default: 'A' },
    academicYear:  { type: String, required: true },
    house:         String,  // school house (Red, Blue, etc.)
    feeCategory:   { type: String, enum: ['general','scholarship','staff_ward','ews','other'], default: 'general' },

    // Medical
    medical: {
      allergies:      [String],
      conditions:     [String],
      medications:    [String],
      doctorName:     String,
      doctorPhone:    String,
      insuranceNo:    String,
      height:         Number, // cm
      weight:         Number, // kg
      lastCheckup:    Date,
    },

    // Transport
    transport: {
      enrolled:    { type: Boolean, default: false },
      routeNo:     String,
      vehicleNo:   String,
      pickupPoint: String,
      busPassNo:   String,
      pickupTime:  String,
      dropTime:    String,
    },

    // Hostel
    hostel: {
      enrolled:    { type: Boolean, default: false },
      hostelName:  String,
      roomNo:      String,
      bedNo:       String,
      warden:      String,
    },

    // Extracurricular
    extracurricular: {
      sports:      [String],
      clubs:       [String],
      activities:  [String],
    },

    achievements: [{
      title:      String,
      description:String,
      date:       Date,
      level:      { type: String, enum: ['school','district','state','national','international'] },
    }],

    // Siblings at same school
    siblings: [{
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile' },
      name:      String,
      class:     String,
    }],

    // Previous academic performance
    previousResults: [{
      academicYear: String,
      class:        String,
      percentage:   Number,
      grade:        String,
      result:       { type: String, enum: ['pass','fail','promoted'] },
    }],

    status:         { type: String, enum: ['active','transferred','left','alumni','deceased'], default: 'active' },
    leftOn:         Date,
    leftReason:     String,
    transferredTo:  String,
    tcIssued:       { type: Boolean, default: false },
    tcDate:         Date,
    tcNumber:       String,

    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
  },
  { timestamps: true }
);

// Auto-increment roll number per class/section/year
studentProfileSchema.pre('save', async function (next) {
  if (!this.rollNumber && this.isNew) {
    const count = await mongoose.model('StudentProfile').countDocuments({
      schoolId: this.schoolId, class: this.class, section: this.section, academicYear: this.academicYear,
    });
    this.rollNumber = String(count + 1).padStart(3, '0');
  }
  next();
});

studentProfileSchema.index({ schoolId: 1, class: 1, section: 1, academicYear: 1 });
studentProfileSchema.index({ userId: 1 });
studentProfileSchema.index({ rollNumber: 1, schoolId: 1 });

const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);
module.exports = { StudentProfile };
