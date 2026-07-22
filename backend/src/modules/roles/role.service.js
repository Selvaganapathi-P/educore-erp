const { Role, Permission, USER_ROLES } = require('./role.model');
const { User } = require('../users/user.model');
const { NotFoundError, ForbiddenError } = require('../../utils/appError');

// All system roles (schoolId: null) + school-specific overrides
async function listRoles(schoolId = null) {
  const filter = schoolId
    ? { isDeleted: false, $or: [{ schoolId: null }, { schoolId }] }
    : { isDeleted: false, schoolId: null };
  return Role.find(filter).sort({ name: 1 });
}

async function getRole(name, schoolId = null) {
  const filter = { name, isDeleted: false };
  if (schoolId) filter.$or = [{ schoolId }, { schoolId: null }];
  else filter.schoolId = null;

  const role = await Role.findOne(filter).sort({ schoolId: -1 }); // school override first
  if (!role) throw new NotFoundError(`Role '${name}' not found`);
  return role;
}

async function updatePermissions(roleName, permissions, schoolId = null) {
  // Never allow editing the super_admin wildcard through this endpoint
  if (roleName === 'super_admin') throw new ForbiddenError('Cannot modify super_admin permissions');

  // Find school-specific override or create one
  let role = await Role.findOne({ name: roleName, schoolId: schoolId ?? null });
  if (!role) {
    // Clone from system role
    const system = await Role.findOne({ name: roleName, schoolId: null });
    if (!system) throw new NotFoundError(`Role '${roleName}' not found`);
    role = await Role.create({
      name:        system.name,
      displayName: system.displayName,
      description: system.description,
      permissions,
      schoolId:    schoolId ?? null,
      isSystem:    false,
    });
  } else {
    role.permissions = permissions;
    await role.save();
  }
  return role;
}

async function assignRole(userId, newRole, actorRole, schoolId = null) {
  // Only super_admin can assign super_admin
  if (newRole === 'super_admin' && actorRole !== 'super_admin') {
    throw new ForbiddenError('Only super_admin can assign super_admin role');
  }
  const filter = { _id: userId, isDeleted: false };
  if (schoolId) filter.schoolId = schoolId;
  const user = await User.findOne(filter);
  if (!user) throw new NotFoundError('User not found');
  user.role = newRole;
  await user.save();
  return user;
}

async function getRoleStats(schoolId = null) {
  const filter = { isDeleted: false };
  if (schoolId) filter.schoolId = schoolId;
  const counts = await User.aggregate([
    { $match: filter },
    { $group: { _id: '$role', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  return counts.map(c => ({ role: c._id, count: c.count }));
}

// Permissions catalogue — built from known module/action pairs
const PERMISSION_CATALOGUE = [
  // students
  { module: 'students', action: 'read'   }, { module: 'students', action: 'create' },
  { module: 'students', action: 'update' }, { module: 'students', action: 'delete' },
  // teachers
  { module: 'teachers', action: 'read'   }, { module: 'teachers', action: 'create' },
  { module: 'teachers', action: 'update' }, { module: 'teachers', action: 'delete' },
  // attendance
  { module: 'attendance', action: 'read'   }, { module: 'attendance', action: 'mark'   },
  { module: 'attendance', action: 'own'    }, { module: 'attendance', action: 'children'},
  // exams
  { module: 'exams', action: 'read' }, { module: 'exams', action: 'create' },
  { module: 'exams', action: 'marks'}, { module: 'exams', action: 'results'},
  // fees
  { module: 'fees', action: 'read' }, { module: 'fees', action: 'create' },
  { module: 'fees', action: 'own'  }, { module: 'fees', action: 'children'},
  // homework
  { module: 'homework', action: 'read' }, { module: 'homework', action: 'create' },
  { module: 'homework', action: 'update'}, { module: 'homework', action: 'delete' },
  // admissions
  { module: 'admissions', action: 'read' }, { module: 'admissions', action: 'create' },
  { module: 'admissions', action: 'update'}, { module: 'admissions', action: 'approve'},
  // employees/hr
  { module: 'employees', action: 'read' }, { module: 'employees', action: 'create' },
  { module: 'employees', action: 'update'}, { module: 'employees', action: 'delete' },
  { module: 'payroll',   action: 'read' }, { module: 'payroll',   action: 'create' },
  { module: 'leave',     action: 'read' }, { module: 'leave',     action: 'approve'},
  // library
  { module: 'library', action: 'read' }, { module: 'library', action: 'issue' },
  { module: 'library', action: 'return'}, { module: 'library', action: 'manage'},
  // transport
  { module: 'transport', action: 'read' }, { module: 'transport', action: 'manage'},
  // settings
  { module: 'settings', action: 'read' }, { module: 'settings', action: 'update'},
  // reports
  { module: 'reports', action: 'read' }, { module: 'reports', action: 'finance'},
  // users
  { module: 'users', action: 'read' }, { module: 'users', action: 'create' },
  { module: 'users', action: 'update'}, { module: 'users', action: 'delete' },
];

function listPermissions() {
  // Group by module
  const grouped = {};
  for (const p of PERMISSION_CATALOGUE) {
    if (!grouped[p.module]) grouped[p.module] = [];
    grouped[p.module].push(`${p.module}.${p.action}`);
  }
  return grouped;
}

module.exports = { listRoles, getRole, updatePermissions, assignRole, getRoleStats, listPermissions, USER_ROLES };
