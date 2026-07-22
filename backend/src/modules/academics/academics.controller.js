const svc = require('./academics.service');
const { sendSuccess, sendCreated, sendNoContent } = require('../../utils/apiResponse');

const h = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ─── Academic Years ────────────────────────────────────────────────────────────
exports.createYear    = h(async (req,res) => { const y = await svc.createYear(req.body, req.schoolId); sendCreated(res, y, 'Academic year created'); });
exports.listYears     = h(async (req,res) => { const y = await svc.listYears(req.schoolId); sendSuccess(res, y, 'Academic years'); });
exports.getYear       = h(async (req,res) => { const y = await svc.getYear(req.params.id, req.schoolId); sendSuccess(res, y, 'Academic year'); });
exports.updateYear    = h(async (req,res) => { const y = await svc.updateYear(req.params.id, req.body, req.schoolId); sendSuccess(res, y, 'Updated'); });
exports.deleteYear    = h(async (req,res) => { await svc.deleteYear(req.params.id, req.schoolId); sendNoContent(res); });
exports.addHoliday    = h(async (req,res) => { const y = await svc.addHoliday(req.params.id, req.body, req.schoolId); sendSuccess(res, y, 'Holiday added'); });
exports.removeHoliday = h(async (req,res) => { const y = await svc.removeHoliday(req.params.id, req.params.hid, req.schoolId); sendSuccess(res, y, 'Holiday removed'); });

// ─── Classes ──────────────────────────────────────────────────────────────────
exports.createClass   = h(async (req,res) => { const c = await svc.createClass(req.body, req.schoolId); sendCreated(res, c, 'Class created'); });
exports.listClasses   = h(async (req,res) => { const c = await svc.listClasses(req.schoolId, req.query.academicYearId); sendSuccess(res, c, 'Classes'); });
exports.getClass      = h(async (req,res) => { const c = await svc.getClass(req.params.id, req.schoolId); sendSuccess(res, c, 'Class'); });
exports.updateClass   = h(async (req,res) => { const c = await svc.updateClass(req.params.id, req.body, req.schoolId); sendSuccess(res, c, 'Updated'); });
exports.deleteClass   = h(async (req,res) => { await svc.deleteClass(req.params.id, req.schoolId); sendNoContent(res); });
exports.addSection    = h(async (req,res) => { const c = await svc.addSection(req.params.id, req.body, req.schoolId); sendSuccess(res, c, 'Section added'); });
exports.updateSection = h(async (req,res) => { const c = await svc.updateSection(req.params.id, req.params.sid, req.body, req.schoolId); sendSuccess(res, c, 'Section updated'); });
exports.deleteSection = h(async (req,res) => { const c = await svc.deleteSection(req.params.id, req.params.sid, req.schoolId); sendSuccess(res, c, 'Section removed'); });

// ─── Subjects ─────────────────────────────────────────────────────────────────
exports.createSubject  = h(async (req,res) => { const s = await svc.createSubject(req.body, req.schoolId); sendCreated(res, s, 'Subject created'); });
exports.listSubjects   = h(async (req,res) => { const s = await svc.listSubjects(req.schoolId, req.query.academicYearId, req.query.classId); sendSuccess(res, s, 'Subjects'); });
exports.getSubject     = h(async (req,res) => { const s = await svc.getSubject(req.params.id, req.schoolId); sendSuccess(res, s, 'Subject'); });
exports.updateSubject  = h(async (req,res) => { const s = await svc.updateSubject(req.params.id, req.body, req.schoolId); sendSuccess(res, s, 'Updated'); });
exports.assignTeacher  = h(async (req,res) => { const s = await svc.assignTeacher(req.params.id, req.body.classId, req.body.teacherId, req.schoolId); sendSuccess(res, s, 'Teacher assigned'); });
exports.deleteSubject  = h(async (req,res) => { await svc.deleteSubject(req.params.id, req.schoolId); sendNoContent(res); });

// ─── Timetable ────────────────────────────────────────────────────────────────
exports.saveTimetable         = h(async (req,res) => { const t = await svc.saveTimetable(req.body, req.schoolId); sendSuccess(res, t, 'Timetable saved'); });
exports.getTimetable          = h(async (req,res) => { const t = await svc.getTimetable(req.query.classId, req.query.sectionId, req.schoolId); sendSuccess(res, t ?? {}, 'Timetable'); });
exports.getTeacherTimetable   = h(async (req,res) => { const t = await svc.getTeacherTimetable(req.params.teacherId, req.schoolId); sendSuccess(res, t, 'Teacher timetable'); });
