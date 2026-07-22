const { AcademicYear } = require('./academicYear.model');
const { Class }        = require('./class.model');
const { Subject }      = require('./subject.model');
const { Timetable }    = require('./timetable.model');
const { NotFoundError, ConflictError } = require('../../utils/appError');

// ─── Academic Years ────────────────────────────────────────────────────────────

async function createYear(data, schoolId) {
  const exists = await AcademicYear.findOne({ schoolId, name: data.name, isDeleted: false });
  if (exists) throw new ConflictError(`Academic year '${data.name}' already exists`);
  if (data.isCurrent) await AcademicYear.updateMany({ schoolId }, { isCurrent: false });
  return AcademicYear.create({ ...data, schoolId });
}

async function listYears(schoolId) {
  return AcademicYear.find({ schoolId, isDeleted: false }).sort({ startDate: -1 });
}

async function getYear(id, schoolId) {
  const y = await AcademicYear.findOne({ _id: id, schoolId, isDeleted: false });
  if (!y) throw new NotFoundError('Academic year not found');
  return y;
}

async function updateYear(id, data, schoolId) {
  const y = await getYear(id, schoolId);
  if (data.isCurrent) await AcademicYear.updateMany({ schoolId, _id: { $ne: id } }, { isCurrent: false });
  Object.assign(y, data);
  await y.save();
  return y;
}

async function addHoliday(id, holiday, schoolId) {
  const y = await getYear(id, schoolId);
  y.holidays.push(holiday);
  await y.save();
  return y;
}

async function removeHoliday(yearId, holidayId, schoolId) {
  const y = await getYear(yearId, schoolId);
  y.holidays = y.holidays.filter(h => h._id.toString() !== holidayId);
  await y.save();
  return y;
}

async function deleteYear(id, schoolId) {
  const y = await getYear(id, schoolId);
  y.isDeleted = true; y.deletedAt = new Date();
  await y.save();
}

// ─── Classes ──────────────────────────────────────────────────────────────────

async function createClass(data, schoolId) {
  const exists = await Class.findOne({ schoolId, academicYearId: data.academicYearId, name: data.name, isDeleted: false });
  if (exists) throw new ConflictError(`Class '${data.name}' already exists for this academic year`);
  return Class.create({ ...data, schoolId });
}

async function listClasses(schoolId, academicYearId) {
  const filter = { schoolId, isDeleted: false };
  if (academicYearId) filter.academicYearId = academicYearId;
  return Class.find(filter)
    .sort({ displayOrder: 1, name: 1 })
    .populate('sections.classTeacher', 'profile.firstName profile.lastName');
}

async function getClass(id, schoolId) {
  const c = await Class.findOne({ _id: id, schoolId, isDeleted: false })
    .populate('sections.classTeacher', 'profile.firstName profile.lastName');
  if (!c) throw new NotFoundError('Class not found');
  return c;
}

async function updateClass(id, data, schoolId) {
  const c = await getClass(id, schoolId);
  if (data.name) c.name = data.name;
  if (data.displayOrder !== undefined) c.displayOrder = data.displayOrder;
  await c.save();
  return c;
}

async function addSection(classId, sectionData, schoolId) {
  const c = await getClass(classId, schoolId);
  const dup = c.sections.find(s => s.name === sectionData.name && !s.isDeleted);
  if (dup) throw new ConflictError(`Section '${sectionData.name}' already exists`);
  c.sections.push(sectionData);
  await c.save();
  return c;
}

async function updateSection(classId, sectionId, data, schoolId) {
  const c = await getClass(classId, schoolId);
  const section = c.sections.id(sectionId);
  if (!section) throw new NotFoundError('Section not found');
  Object.assign(section, data);
  await c.save();
  return c;
}

async function deleteSection(classId, sectionId, schoolId) {
  const c = await getClass(classId, schoolId);
  const section = c.sections.id(sectionId);
  if (!section) throw new NotFoundError('Section not found');
  section.isDeleted = true;
  await c.save();
  return c;
}

async function deleteClass(id, schoolId) {
  const c = await getClass(id, schoolId);
  c.isDeleted = true; c.deletedAt = new Date();
  await c.save();
}

// ─── Subjects ─────────────────────────────────────────────────────────────────

async function createSubject(data, schoolId) {
  return Subject.create({ ...data, schoolId });
}

async function listSubjects(schoolId, academicYearId, classId) {
  const filter = { schoolId, isDeleted: false };
  if (academicYearId) filter.academicYearId = academicYearId;
  if (classId) filter['classes.classId'] = classId;
  return Subject.find(filter).sort({ name: 1 })
    .populate('classes.teacherId', 'profile.firstName profile.lastName');
}

async function getSubject(id, schoolId) {
  const s = await Subject.findOne({ _id: id, schoolId, isDeleted: false })
    .populate('classes.teacherId', 'profile.firstName profile.lastName');
  if (!s) throw new NotFoundError('Subject not found');
  return s;
}

async function updateSubject(id, data, schoolId) {
  const s = await getSubject(id, schoolId);
  const { classes, ...rest } = data;
  Object.assign(s, rest);
  if (classes !== undefined) { s.classes = classes; s.markModified('classes'); }
  await s.save();
  return s;
}

async function assignTeacher(subjectId, classId, teacherId, schoolId) {
  const s = await getSubject(subjectId, schoolId);
  const assignment = s.classes.find(c => c.classId.toString() === classId);
  if (!assignment) throw new NotFoundError('Class assignment not found');
  assignment.teacherId = teacherId;
  s.markModified('classes');
  await s.save();
  return s;
}

async function deleteSubject(id, schoolId) {
  const s = await getSubject(id, schoolId);
  s.isDeleted = true; s.deletedAt = new Date();
  await s.save();
}

// ─── Timetable ────────────────────────────────────────────────────────────────

async function saveTimetable(data, schoolId) {
  const existing = await Timetable.findOne({
    schoolId, classId: data.classId,
    sectionId: data.sectionId ?? null,
    isActive: true, isDeleted: false,
  });
  if (existing) {
    existing.schedule      = data.schedule;
    existing.effectiveFrom = data.effectiveFrom ?? new Date();
    await existing.save();
    return existing;
  }
  return Timetable.create({ ...data, schoolId, isActive: true });
}

async function getTimetable(classId, sectionId, schoolId) {
  const filter = { schoolId, classId, isActive: true, isDeleted: false };
  if (sectionId) filter.sectionId = sectionId;
  const tt = await Timetable.findOne(filter)
    .populate('schedule.periods.subjectId', 'name code color')
    .populate('schedule.periods.teacherId', 'profile.firstName profile.lastName');
  return tt;
}

async function getTeacherTimetable(teacherId, schoolId) {
  // Find all periods across all timetables where this teacher is assigned
  const timetables = await Timetable.find({ schoolId, isActive: true, isDeleted: false })
    .populate('classId', 'name')
    .populate('schedule.periods.subjectId', 'name code color');
  const result = [];
  for (const tt of timetables) {
    for (const day of tt.schedule) {
      for (const period of day.periods) {
        if (period.teacherId?.toString() === teacherId.toString()) {
          result.push({ day: day.day, period, class: tt.classId, section: tt.sectionName });
        }
      }
    }
  }
  return result;
}

module.exports = {
  createYear, listYears, getYear, updateYear, addHoliday, removeHoliday, deleteYear,
  createClass, listClasses, getClass, updateClass, addSection, updateSection, deleteSection, deleteClass,
  createSubject, listSubjects, getSubject, updateSubject, assignTeacher, deleteSubject,
  saveTimetable, getTimetable, getTeacherTimetable,
};
