const userService = require('./user.service');
const { sendSuccess, sendCreated, sendNoContent } = require('../../utils/apiResponse');

const isSuperAdmin = (req) => req.user?.role === 'super_admin';

const create = async (req, res, next) => {
  try {
    const user = await userService.create(req.body, req.schoolId);
    sendCreated(res, user, 'User created');
  } catch (err) { next(err); }
};

const list = async (req, res, next) => {
  try {
    const schoolId = isSuperAdmin(req) ? null : req.schoolId;
    const result = await userService.list(req.query, schoolId);
    sendSuccess(res, result.data, 'Users fetched', 200, result.meta);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const schoolId = isSuperAdmin(req) ? null : req.schoolId;
    const user = await userService.findById(req.params.id, schoolId);
    sendSuccess(res, user, 'User fetched');
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const schoolId = isSuperAdmin(req) ? null : req.schoolId;
    const user = await userService.update(req.params.id, req.body, schoolId);
    sendSuccess(res, user, 'User updated');
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const schoolId = isSuperAdmin(req) ? null : req.schoolId;
    await userService.softDelete(req.params.id, schoolId);
    sendNoContent(res);
  } catch (err) { next(err); }
};

const updateStatus = async (req, res, next) => {
  try {
    const schoolId = isSuperAdmin(req) ? null : req.schoolId;
    const user = await userService.updateStatus(req.params.id, req.body.status, schoolId);
    sendSuccess(res, user, 'Status updated');
  } catch (err) { next(err); }
};

const invite = async (req, res, next) => {
  try {
    const { user, resetToken } = await userService.invite(req.body, req.schoolId);
    // TODO: send invite email with resetToken link
    sendCreated(res, { user, inviteLink: `/reset-password?token=${resetToken}` }, 'Invite sent');
  } catch (err) { next(err); }
};

const bulkCreate = async (req, res, next) => {
  try {
    const schoolId = isSuperAdmin(req) ? null : req.schoolId;
    const results  = await userService.bulkCreate(req.body.users, schoolId);
    sendSuccess(res, results, 'Bulk import complete');
  } catch (err) { next(err); }
};

module.exports = { create, invite, bulkCreate, list, getById, update, remove, updateStatus };
