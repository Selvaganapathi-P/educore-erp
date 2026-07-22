const roleService = require('./role.service');
const { sendSuccess } = require('../../utils/apiResponse');
const { AuditLog } = require('../auth/auditLog.model');

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const listRoles = asyncHandler(async (req, res) => {
  const schoolId = req.user.role === 'super_admin' ? null : req.schoolId;
  const roles = await roleService.listRoles(schoolId);
  sendSuccess(res, roles, 'Roles fetched');
});

const getRole = asyncHandler(async (req, res) => {
  const schoolId = req.user.role === 'super_admin' ? null : req.schoolId;
  const role = await roleService.getRole(req.params.name, schoolId);
  sendSuccess(res, role, 'Role fetched');
});

const updatePermissions = asyncHandler(async (req, res) => {
  const schoolId = req.user.role === 'super_admin' ? null : req.schoolId;
  const role = await roleService.updatePermissions(req.params.name, req.body.permissions, schoolId);
  await AuditLog.create({
    userId: req.user._id, action: 'UPDATE', module: 'ROLE',
    description: `Updated permissions for role '${req.params.name}'`,
    ip: req.ip, userAgent: req.get('user-agent'), status: 'success',
  });
  sendSuccess(res, role, 'Permissions updated');
});

const assignRole = asyncHandler(async (req, res) => {
  const schoolId = req.user.role === 'super_admin' ? null : req.schoolId;
  const user = await roleService.assignRole(req.body.userId, req.body.role, req.user.role, schoolId);
  await AuditLog.create({
    userId: req.user._id, action: 'UPDATE', module: 'ROLE',
    description: `Assigned role '${req.body.role}' to user ${req.body.userId}`,
    ip: req.ip, userAgent: req.get('user-agent'), status: 'success',
  });
  sendSuccess(res, user, 'Role assigned');
});

const getRoleStats = asyncHandler(async (req, res) => {
  const schoolId = req.user.role === 'super_admin' ? null : req.schoolId;
  const stats = await roleService.getRoleStats(schoolId);
  sendSuccess(res, stats, 'Role stats');
});

const listPermissions = asyncHandler(async (req, res) => {
  const perms = roleService.listPermissions();
  sendSuccess(res, perms, 'Permission catalogue');
});

module.exports = { listRoles, getRole, updatePermissions, assignRole, getRoleStats, listPermissions };
