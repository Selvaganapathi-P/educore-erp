const mongoose = require('mongoose');
const dayjs = require('dayjs');

// Lazy model loader — safe if some models aren't registered in a given boot path
function m(name) {
  try { return mongoose.model(name); } catch { return null; }
}

// ── School Summary ────────────────────────────────────────────────────────────

async function getSchoolSummary(schoolId) {
  const sId = new mongoose.Types.ObjectId(String(schoolId));
  const monthStart = dayjs().startOf('month').toDate();

  const Student      = m('Student');
  const Staff        = m('Staff');
  const FeeInvoice   = m('FeeInvoice');
  const Book         = m('Book');
  const BookIssue    = m('BookIssue');
  const Room         = m('Room');
  const Item         = m('Item');
  const MedicalVisit = m('MedicalVisit');
  const Event        = m('Event');

  const [
    totalStudents, totalStaff,
    feeStats, libraryStats, hostelStats,
    lowStockCount, visitsThisMonth, upcomingEvents,
  ] = await Promise.all([
    Student ? Student.countDocuments({ schoolId, isDeleted: false }) : 0,
    Staff   ? Staff.countDocuments({ schoolId, isDeleted: false }) : 0,

    FeeInvoice ? FeeInvoice.aggregate([
      { $match: { schoolId: sId, isDeleted: false } },
      { $group: { _id: null,
        totalInvoiced:  { $sum: '$totalAmount' },
        totalCollected: { $sum: '$paidAmount'  },
        paid:           { $sum: { $cond: [{ $eq: ['$status','paid']  }, 1, 0] } },
        unpaid:         { $sum: { $cond: [{ $in:  ['$status',['unpaid','overdue']] }, 1, 0] } },
      }},
    ]) : [],

    Book ? Book.aggregate([
      { $match: { schoolId: sId, isDeleted: false } },
      { $group: { _id: null, totalBooks: { $sum: '$totalCopies' }, available: { $sum: '$availableCopies' } } },
    ]) : [],

    Room ? Room.aggregate([
      { $match: { schoolId: sId, isDeleted: false } },
      { $group: { _id: null, totalBeds: { $sum: '$capacity' }, occupiedBeds: { $sum: '$occupiedBeds' } } },
    ]) : [],

    Item ? Item.countDocuments({ schoolId, isDeleted: false, $expr: { $lte: ['$currentStock','$minStock'] } }) : 0,

    MedicalVisit ? MedicalVisit.countDocuments({ schoolId, isDeleted: false, visitDate: { $gte: monthStart } }) : 0,

    Event ? Event.countDocuments({ schoolId, isDeleted: false, startDate: { $gte: new Date() }, isPublished: true }) : 0,
  ]);

  const fee     = feeStats[0]     || { totalInvoiced: 0, totalCollected: 0, paid: 0, unpaid: 0 };
  const lib     = libraryStats[0] || { totalBooks: 0, available: 0 };
  const hostel  = hostelStats[0]  || { totalBeds: 0, occupiedBeds: 0 };

  return {
    totalStudents, totalStaff,
    totalInvoiced:   fee.totalInvoiced,
    totalCollected:  fee.totalCollected,
    totalOutstanding:fee.totalInvoiced - fee.totalCollected,
    paidInvoices:    fee.paid,
    unpaidInvoices:  fee.unpaid,
    totalBooks:      lib.totalBooks,
    availableBooks:  lib.available,
    totalBeds:       hostel.totalBeds,
    occupiedBeds:    hostel.occupiedBeds,
    hostelOccupancyPct: hostel.totalBeds ? Math.round((hostel.occupiedBeds / hostel.totalBeds) * 100) : 0,
    lowStockItems:   lowStockCount,
    medicalVisitsThisMonth: visitsThisMonth,
    upcomingEvents,
  };
}

// ── Attendance Report ────────────────────────────────────────────────────────

async function getAttendanceReport(schoolId, { classId, from, to, academicYearId } = {}) {
  const Attendance = m('Attendance');
  if (!Attendance) return { summary: {}, byClass: [], byDate: [] };

  const sId = new mongoose.Types.ObjectId(String(schoolId));
  const match = { schoolId: sId };
  if (academicYearId) match.academicYearId = new mongoose.Types.ObjectId(String(academicYearId));
  if (classId) match.classId = new mongoose.Types.ObjectId(String(classId));
  if (from || to) {
    match.date = {};
    if (from) match.date.$gte = new Date(from);
    if (to)   match.date.$lte = dayjs(to).endOf('day').toDate();
  }

  // Support both flat and embedded-records attendance models
  const hasRecords = (await Attendance.findOne(sId ? { schoolId: sId } : {}).lean())?.records;

  let pipeline;
  if (hasRecords) {
    pipeline = [
      { $match: match },
      { $unwind: '$records' },
      { $group: { _id: null,
        total:   { $sum: 1 },
        present: { $sum: { $cond: [{ $eq: ['$records.status','present'] }, 1, 0] } },
        absent:  { $sum: { $cond: [{ $eq: ['$records.status','absent']  }, 1, 0] } },
        late:    { $sum: { $cond: [{ $eq: ['$records.status','late']    }, 1, 0] } },
      }},
    ];
  } else {
    pipeline = [
      { $match: match },
      { $group: { _id: null,
        total:   { $sum: 1 },
        present: { $sum: { $cond: [{ $eq: ['$status','present'] }, 1, 0] } },
        absent:  { $sum: { $cond: [{ $eq: ['$status','absent']  }, 1, 0] } },
        late:    { $sum: { $cond: [{ $eq: ['$status','late']    }, 1, 0] } },
      }},
    ];
  }

  // By class aggregation
  const byClassPipeline = hasRecords ? [
    { $match: match },
    { $unwind: '$records' },
    { $group: { _id: '$classId',
      total: { $sum: 1 },
      present: { $sum: { $cond: [{ $eq: ['$records.status','present'] }, 1, 0] } },
      absent:  { $sum: { $cond: [{ $eq: ['$records.status','absent'] }, 1, 0] } },
    }},
    { $lookup: { from: 'classes', localField: '_id', foreignField: '_id', as: 'classInfo' } },
    { $unwind: { path: '$classInfo', preserveNullAndEmptyArrays: true } },
    { $project: { className: '$classInfo.name', total: 1, present: 1, absent: 1,
        pct: { $cond: ['$total', { $round: [{ $multiply: [{ $divide: ['$present','$total'] }, 100] }, 1] }, 0] } } },
    { $sort: { className: 1 } },
  ] : [
    { $match: match },
    { $group: { _id: '$classId',
      total: { $sum: 1 },
      present: { $sum: { $cond: [{ $eq: ['$status','present'] }, 1, 0] } },
      absent:  { $sum: { $cond: [{ $eq: ['$status','absent'] }, 1, 0] } },
    }},
    { $lookup: { from: 'classes', localField: '_id', foreignField: '_id', as: 'classInfo' } },
    { $unwind: { path: '$classInfo', preserveNullAndEmptyArrays: true } },
    { $project: { className: '$classInfo.name', total: 1, present: 1, absent: 1,
        pct: { $cond: ['$total', { $round: [{ $multiply: [{ $divide: ['$present','$total'] }, 100] }, 1] }, 0] } } },
    { $sort: { className: 1 } },
  ];

  // Daily trend
  const byDatePipeline = hasRecords ? [
    { $match: { ...match, date: match.date || { $gte: dayjs().subtract(30,'day').toDate() } } },
    { $unwind: '$records' },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
      present: { $sum: { $cond: [{ $eq: ['$records.status','present'] }, 1, 0] } },
      absent:  { $sum: { $cond: [{ $eq: ['$records.status','absent'] }, 1, 0] } },
      total:   { $sum: 1 },
    }},
    { $sort: { _id: 1 } },
  ] : [
    { $match: { ...match, date: match.date || { $gte: dayjs().subtract(30,'day').toDate() } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
      present: { $sum: { $cond: [{ $eq: ['$status','present'] }, 1, 0] } },
      absent:  { $sum: { $cond: [{ $eq: ['$status','absent'] }, 1, 0] } },
      total:   { $sum: 1 },
    }},
    { $sort: { _id: 1 } },
  ];

  const [summaryArr, byClass, byDate] = await Promise.all([
    Attendance.aggregate(pipeline),
    Attendance.aggregate(byClassPipeline),
    Attendance.aggregate(byDatePipeline),
  ]);

  const summary = summaryArr[0] || { total: 0, present: 0, absent: 0, late: 0 };
  summary.presentPct = summary.total ? Math.round((summary.present / summary.total) * 100) : 0;
  summary.absentPct  = summary.total ? Math.round((summary.absent  / summary.total) * 100) : 0;

  return { summary, byClass, byDate };
}

// ── Fee Report ───────────────────────────────────────────────────────────────

async function getFeeReport(schoolId, { academicYearId, classId, from, to } = {}) {
  const FeeInvoice = m('FeeInvoice');
  if (!FeeInvoice) return { summary: {}, byClass: [], byMonth: [], topDefaulters: [] };

  const sId = new mongoose.Types.ObjectId(String(schoolId));
  const match = { schoolId: sId, isDeleted: false };
  if (academicYearId) match.academicYearId = new mongoose.Types.ObjectId(String(academicYearId));
  if (classId) match.classId = new mongoose.Types.ObjectId(String(classId));
  if (from || to) {
    match.createdAt = {};
    if (from) match.createdAt.$gte = new Date(from);
    if (to)   match.createdAt.$lte = dayjs(to).endOf('day').toDate();
  }

  const [summaryArr, byMonth, byStatus, topDefaulters] = await Promise.all([
    FeeInvoice.aggregate([
      { $match: match },
      { $group: { _id: null,
        totalInvoiced:   { $sum: '$totalAmount'  },
        totalCollected:  { $sum: '$paidAmount'   },
        totalOutstanding:{ $sum: { $subtract: ['$totalAmount','$paidAmount'] } },
        invoiceCount:    { $sum: 1 },
        paidCount:       { $sum: { $cond: [{ $eq: ['$status','paid'] }, 1, 0] } },
        overdueCount:    { $sum: { $cond: [{ $eq: ['$status','overdue'] }, 1, 0] } },
      }},
    ]),

    FeeInvoice.aggregate([
      { $match: match },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        collected: { $sum: '$paidAmount' },
        invoiced:  { $sum: '$totalAmount' },
        count:     { $sum: 1 },
      }},
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]),

    FeeInvoice.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$totalAmount' } } },
    ]),

    FeeInvoice.find({ ...match, status: { $in: ['unpaid','overdue'] } })
      .sort({ totalAmount: -1 })
      .limit(10)
      .populate({ path: 'studentId', select: 'rollNumber userId class section', populate: [{ path: 'userId', select: 'profile' }, { path: 'class', select: 'name' }] })
      .lean(),
  ]);

  return {
    summary: summaryArr[0] || { totalInvoiced: 0, totalCollected: 0, totalOutstanding: 0, invoiceCount: 0, paidCount: 0, overdueCount: 0 },
    byMonth,
    byStatus,
    topDefaulters,
  };
}

// ── Academic Report ──────────────────────────────────────────────────────────

async function getAcademicReport(schoolId, { examId, classId, academicYearId } = {}) {
  const ExamResult = m('ExamResult');
  const Exam       = m('Exam');
  if (!ExamResult) return { summary: {}, bySubject: [], topStudents: [], exams: [] };

  const sId = new mongoose.Types.ObjectId(String(schoolId));

  const exams = Exam ? await Exam.find({
    schoolId, isDeleted: false,
    ...(academicYearId ? { academicYearId } : {}),
    ...(classId        ? { classId        } : {}),
  }).select('_id title startDate classId').populate('classId','name').sort({ startDate: -1 }).limit(20).lean() : [];

  const match = { schoolId: sId };
  if (examId)  match.examId  = new mongoose.Types.ObjectId(String(examId));
  if (classId) match.classId = new mongoose.Types.ObjectId(String(classId));

  const [summaryArr, bySubject, topStudents] = await Promise.all([
    ExamResult.aggregate([
      { $match: match },
      { $group: { _id: null,
        total:      { $sum: 1 },
        passed:     { $sum: { $cond: ['$isPassed', 1, 0] } },
        avgMarks:   { $avg: '$marksObtained' },
        avgPercent: { $avg: { $multiply: [{ $divide: ['$marksObtained','$totalMarks'] }, 100] } },
        absent:     { $sum: { $cond: ['$isAbsent', 1, 0] } },
      }},
    ]),

    ExamResult.aggregate([
      { $match: match },
      { $group: { _id: '$subjectId',
        avgMarks:   { $avg: '$marksObtained' },
        maxMarks:   { $first: '$totalMarks' },
        passed:     { $sum: { $cond: ['$isPassed', 1, 0] } },
        total:      { $sum: 1 },
        avgPercent: { $avg: { $multiply: [{ $divide: ['$marksObtained','$totalMarks'] }, 100] } },
      }},
      { $lookup: { from: 'subjects', localField: '_id', foreignField: '_id', as: 'subjectInfo' } },
      { $unwind: { path: '$subjectInfo', preserveNullAndEmptyArrays: true } },
      { $project: { subjectName: '$subjectInfo.name', avgMarks: { $round: ['$avgMarks', 1] }, maxMarks: 1, passed: 1, total: 1, avgPercent: { $round: ['$avgPercent', 1] } } },
      { $sort: { avgPercent: -1 } },
    ]),

    ExamResult.aggregate([
      { $match: { ...match, isAbsent: { $ne: true } } },
      { $group: { _id: '$studentId',
        totalObtained: { $sum: '$marksObtained' },
        totalMax:      { $sum: '$totalMarks' },
        subjectCount:  { $sum: 1 },
      }},
      { $addFields: { pct: { $round: [{ $multiply: [{ $divide: ['$totalObtained','$totalMax'] }, 100] }, 1] } } },
      { $sort: { pct: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'students', localField: '_id', foreignField: '_id', as: 'student' } },
      { $unwind: { path: '$student', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'users', localField: 'student.userId', foreignField: '_id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $project: { rollNumber: '$student.rollNumber', name: { $concat: [{ $ifNull: ['$user.profile.firstName',''] }, ' ', { $ifNull: ['$user.profile.lastName',''] }] }, totalObtained: 1, totalMax: 1, pct: 1, subjectCount: 1 } },
    ]),
  ]);

  const summary = summaryArr[0] || { total: 0, passed: 0, avgMarks: 0, avgPercent: 0, absent: 0 };
  summary.passPct    = summary.total ? Math.round((summary.passed / summary.total) * 100) : 0;
  summary.avgPercent = summary.avgPercent ? Math.round(summary.avgPercent) : 0;

  return { summary, bySubject, topStudents, exams };
}

// ── Student Distribution ────────────────────────────────────────────────────

async function getStudentReport(schoolId, { academicYearId } = {}) {
  const Student = m('Student');
  if (!Student) return { byClass: [], byGender: [], total: 0 };

  const sId   = new mongoose.Types.ObjectId(String(schoolId));
  const match = { schoolId: sId, isDeleted: false };
  if (academicYearId) match.academicYearId = new mongoose.Types.ObjectId(String(academicYearId));

  const [byClass, byGender, total] = await Promise.all([
    Student.aggregate([
      { $match: match },
      { $group: { _id: '$class', count: { $sum: 1 } } },
      { $lookup: { from: 'classes', localField: '_id', foreignField: '_id', as: 'classInfo' } },
      { $unwind: { path: '$classInfo', preserveNullAndEmptyArrays: true } },
      { $project: { className: '$classInfo.name', count: 1 } },
      { $sort: { className: 1 } },
    ]),

    Student.aggregate([
      { $match: match },
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$user.profile.gender', count: { $sum: 1 } } },
    ]),

    Student.countDocuments(match),
  ]);

  return { byClass, byGender, total };
}

module.exports = { getSchoolSummary, getAttendanceReport, getFeeReport, getAcademicReport, getStudentReport };
