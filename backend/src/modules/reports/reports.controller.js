const svc = require('./reports.service');
const { asyncHandler } = require('../../utils/asyncHandler');

const getSchoolSummary    = asyncHandler(async (req, res) => { res.json({ success: true, data: await svc.getSchoolSummary(req.schoolId) }); });
const getAttendanceReport = asyncHandler(async (req, res) => { res.json({ success: true, data: await svc.getAttendanceReport(req.schoolId, req.query) }); });
const getFeeReport        = asyncHandler(async (req, res) => { res.json({ success: true, data: await svc.getFeeReport(req.schoolId, req.query) }); });
const getAcademicReport   = asyncHandler(async (req, res) => { res.json({ success: true, data: await svc.getAcademicReport(req.schoolId, req.query) }); });
const getStudentReport    = asyncHandler(async (req, res) => { res.json({ success: true, data: await svc.getStudentReport(req.schoolId, req.query) }); });

module.exports = { getSchoolSummary, getAttendanceReport, getFeeReport, getAcademicReport, getStudentReport };
