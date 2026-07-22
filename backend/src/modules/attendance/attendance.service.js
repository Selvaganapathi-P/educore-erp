const dayjs = require('dayjs');
const Attendance      = require('./attendance.model');
const StaffAttendance = require('./staffAttendance.model');
const Student         = require('../students/student.model');

async function markStudentAttendance(schoolId, body, userId) {
  const { classId, sectionId, academicYearId, date, entries } = body;
  const dateObj = dayjs(date).startOf('day').toDate();

  const record = await Attendance.findOneAndUpdate(
    { schoolId, classId, sectionId, date: dateObj },
    {
      $set: {
        academicYearId,
        entries: entries.map(e => ({
          studentId:    e.studentId,
          userId:       e.userId,
          rollNumber:   e.rollNumber || '',
          status:       e.status,
          lateMinutes:  Number(e.lateMinutes) || 0,
          leaveType:    e.leaveType || '',
          remark:       e.remark || '',
          isAutoAbsent: false,
        })),
        markedBy: userId,
        markedAt: new Date(),
      },
    },
    { upsert: true, new: true }
  );
  return record;
}

async function getStudentAttendance(schoolId, classId, sectionId, date) {
  const dateObj = dayjs(date).startOf('day').toDate();
  return Attendance.findOne({ schoolId, classId, sectionId, date: dateObj })
    .populate('markedBy', 'profile.firstName profile.lastName');
}

async function getStudentReport(schoolId, studentId, startDate, endDate) {
  const start = dayjs(startDate).startOf('day').toDate();
  const end   = dayjs(endDate).endOf('day').toDate();

  const records = await Attendance.find({
    schoolId,
    date: { $gte: start, $lte: end },
    'entries.studentId': studentId,
  }).select('date entries').sort({ date: 1 });

  const entries = records.map(r => {
    const entry = r.entries.find(e => String(e.studentId) === String(studentId));
    return { date: r.date, status: entry?.status ?? 'absent', remark: entry?.remark, lateMinutes: entry?.lateMinutes ?? 0 };
  });

  const summary = { present: 0, absent: 0, late: 0, leave: 0, half_day: 0 };
  for (const e of entries) summary[e.status] = (summary[e.status] || 0) + 1;

  const totalDays = entries.length;
  const effective = summary.present + summary.late + (summary.half_day * 0.5);
  const attendancePct = totalDays ? Math.round((effective / totalDays) * 100) : 0;

  return { entries, summary, totalDays, attendancePct };
}

async function getClassMonthlyReport(schoolId, classId, sectionId, year, month) {
  const start = dayjs(`${year}-${String(month).padStart(2,'0')}-01`).startOf('month').toDate();
  const end   = dayjs(`${year}-${String(month).padStart(2,'0')}-01`).endOf('month').toDate();

  return Attendance.find({ schoolId, classId, sectionId, date: { $gte: start, $lte: end } })
    .sort({ date: 1 });
}

async function getStudentsForClass(schoolId, classId, sectionId) {
  return Student.find({
    schoolId,
    currentClass:   classId,
    currentSection: sectionId,
    isDeleted: false,
  })
    .populate('userId', 'profile.firstName profile.lastName profile.photo')
    .select('userId rollNumber')
    .sort({ rollNumber: 1 });
}

async function markStaffAttendance(schoolId, body, userId) {
  const { date, entries } = body;
  const dateObj = dayjs(date).startOf('day').toDate();

  const ops = entries.map(e => ({
    updateOne: {
      filter: { schoolId, staffId: e.staffId, date: dateObj },
      update: {
        $set: {
          userId:      e.userId,
          status:      e.status,
          checkIn:     e.checkIn || '',
          checkOut:    e.checkOut || '',
          lateMinutes: Number(e.lateMinutes) || 0,
          leaveType:   e.leaveType || '',
          remark:      e.remark || '',
          markedBy:    userId,
          isAutoAbsent:false,
        },
      },
      upsert: true,
    },
  }));

  await StaffAttendance.bulkWrite(ops);
  return { marked: entries.length };
}

async function getStaffAttendance(schoolId, date) {
  const dateObj = dayjs(date).startOf('day').toDate();
  return StaffAttendance.find({ schoolId, date: dateObj })
    .populate('staffId', 'employeeId department designation')
    .populate('userId', 'profile.firstName profile.lastName');
}

async function getStaffReport(schoolId, staffId, year, month) {
  const start = dayjs(`${year}-${String(month).padStart(2,'0')}-01`).startOf('month').toDate();
  const end   = dayjs(`${year}-${String(month).padStart(2,'0')}-01`).endOf('month').toDate();

  const records = await StaffAttendance.find({ schoolId, staffId, date: { $gte: start, $lte: end } }).sort({ date: 1 });

  const summary = { present: 0, absent: 0, late: 0, leave: 0, half_day: 0, work_from_home: 0 };
  for (const r of records) summary[r.status] = (summary[r.status] || 0) + 1;

  return { records, summary, totalDays: records.length };
}

async function autoMarkAbsent(schoolId, date, userId) {
  const dateObj = dayjs(date).startOf('day').toDate();

  const students = await Student.find({ schoolId, status: 'active', isDeleted: false })
    .select('_id userId currentClass currentSection rollNumber');

  const groups = {};
  for (const s of students) {
    if (!s.currentClass || !s.currentSection) continue;
    const key = `${s.currentClass}__${s.currentSection}`;
    if (!groups[key]) groups[key] = { classId: s.currentClass, sectionId: s.currentSection, students: [] };
    groups[key].students.push(s);
  }

  let created = 0;
  for (const group of Object.values(groups)) {
    const existing = await Attendance.findOne({ schoolId, classId: group.classId, sectionId: group.sectionId, date: dateObj });
    if (existing) continue;

    await Attendance.create({
      schoolId,
      academicYearId: group.students[0]?.academicYearId,
      classId:   group.classId,
      sectionId: group.sectionId,
      date:      dateObj,
      entries:   group.students.map(s => ({
        studentId:    s._id,
        userId:       s.userId,
        rollNumber:   s.rollNumber || '',
        status:       'absent',
        isAutoAbsent: true,
      })),
      markedBy: userId,
      markedAt: new Date(),
      isLocked: true,
      lockedAt: new Date(),
    });
    created++;
  }

  return { groupsProcessed: created };
}

async function getAttendanceSummary(schoolId, classId, sectionId, startDate, endDate) {
  const start = dayjs(startDate).startOf('day').toDate();
  const end   = dayjs(endDate).endOf('day').toDate();

  const pipeline = [
    { $match: { schoolId: new (require('mongoose').Types.ObjectId)(schoolId), classId: new (require('mongoose').Types.ObjectId)(classId), sectionId: new (require('mongoose').Types.ObjectId)(sectionId), date: { $gte: start, $lte: end } } },
    { $unwind: '$entries' },
    { $group: { _id: { studentId: '$entries.studentId', status: '$entries.status' }, count: { $sum: 1 } } },
    { $group: { _id: '$_id.studentId', stats: { $push: { status: '$_id.status', count: '$count' } }, total: { $sum: '$count' } } },
  ];

  return Attendance.aggregate(pipeline);
}

module.exports = {
  markStudentAttendance,
  getStudentAttendance,
  getStudentReport,
  getClassMonthlyReport,
  getStudentsForClass,
  markStaffAttendance,
  getStaffAttendance,
  getStaffReport,
  autoMarkAbsent,
  getAttendanceSummary,
};
