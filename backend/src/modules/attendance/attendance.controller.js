const svc = require('./attendance.service');
const { asyncHandler }  = require('../../utils/asyncHandler');
const { createAuditLog } = require('../../utils/auditLog');

const h = asyncHandler;

const markStudent = h(async (req, res) => {
  const data = await svc.markStudentAttendance(req.schoolId, req.body, req.user._id);
  await createAuditLog({
    schoolId: req.schoolId,
    userId:   req.user._id,
    action:   'ATTENDANCE_MARKED',
    entity:   'Attendance',
    entityId: data._id,
    details:  `Marked for ${data.entries.length} students on ${req.body.date}`,
  });
  res.json({ success: true, data });
});

const getStudentAttendance = h(async (req, res) => {
  const { classId, sectionId, date } = req.query;
  const data = await svc.getStudentAttendance(req.schoolId, classId, sectionId, date);
  res.json({ success: true, data });
});

const studentReport = h(async (req, res) => {
  const { studentId, startDate, endDate } = req.query;
  const data = await svc.getStudentReport(req.schoolId, studentId, startDate, endDate);
  res.json({ success: true, data });
});

const classMonthlyReport = h(async (req, res) => {
  const { classId, sectionId, year, month } = req.query;
  const data = await svc.getClassMonthlyReport(req.schoolId, classId, sectionId, year, month);
  res.json({ success: true, data });
});

const studentsForClass = h(async (req, res) => {
  const { classId, sectionId } = req.query;
  const data = await svc.getStudentsForClass(req.schoolId, classId, sectionId);
  res.json({ success: true, data });
});

const markStaff = h(async (req, res) => {
  const data = await svc.markStaffAttendance(req.schoolId, req.body, req.user._id);
  await createAuditLog({
    schoolId: req.schoolId,
    userId:   req.user._id,
    action:   'STAFF_ATTENDANCE_MARKED',
    entity:   'StaffAttendance',
    details:  `Marked staff attendance on ${req.body.date}`,
  });
  res.json({ success: true, data });
});

const getStaffAttendance = h(async (req, res) => {
  const { date } = req.query;
  const data = await svc.getStaffAttendance(req.schoolId, date || new Date().toISOString().slice(0, 10));
  res.json({ success: true, data });
});

const staffReport = h(async (req, res) => {
  const { staffId, year, month } = req.query;
  const data = await svc.getStaffReport(req.schoolId, staffId, year, month);
  res.json({ success: true, data });
});

const autoAbsent = h(async (req, res) => {
  const { date } = req.body;
  const data = await svc.autoMarkAbsent(req.schoolId, date || new Date().toISOString().slice(0, 10), req.user._id);
  await createAuditLog({
    schoolId: req.schoolId,
    userId:   req.user._id,
    action:   'AUTO_ABSENT_RUN',
    entity:   'Attendance',
    details:  `Auto-absent for ${date}, processed ${data.groupsProcessed} groups`,
  });
  res.json({ success: true, data });
});

module.exports = { markStudent, getStudentAttendance, studentReport, classMonthlyReport, studentsForClass, markStaff, getStaffAttendance, staffReport, autoAbsent };
