const crypto = require('crypto');
const { User } = require('./user.model');
const { ConflictError, NotFoundError } = require('../../utils/appError');
const { paginate } = require('../../utils/apiResponse');

const create = async (data, creatorSchoolId = null) => {
  const exists = await User.findOne({ email: data.email });
  if (exists) throw new ConflictError(`Email '${data.email}' is already registered`);

  const schoolId = data.role === 'super_admin' ? null : (data.schoolId || creatorSchoolId || null);

  return User.create({ ...data, schoolId, status: 'active', isEmailVerified: true });
};

const findById = async (id, schoolId = null) => {
  const filter = { _id: id, isDeleted: false };
  if (schoolId) filter.schoolId = schoolId;
  const user = await User.findOne(filter);
  if (!user) throw new NotFoundError('User');
  return user;
};

const list = async (query, schoolId = null) => {
  const { page = 1, limit = 20, search, role, status, sortBy = 'createdAt', sortOrder = 'desc' } = query;
  const filter = { isDeleted: false };

  if (schoolId) filter.schoolId = schoolId;
  if (role)     filter.role     = role;
  if (status)   filter.status   = status;
  if (search) {
    filter.$or = [
      { email:               { $regex: search, $options: 'i' } },
      { 'profile.firstName': { $regex: search, $options: 'i' } },
      { 'profile.lastName':  { $regex: search, $options: 'i' } },
      { 'profile.phone':     { $regex: search, $options: 'i' } },
    ];
  }

  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    User.find(filter).sort(sort).skip(skip).limit(limit).select('-__v'),
    User.countDocuments(filter),
  ]);

  return { data, meta: paginate(Number(page), Number(limit), total) };
};

const update = async (id, data, schoolId = null) => {
  const user = await findById(id, schoolId);
  if (data.profile) Object.assign(user.profile, data.profile);
  if (data.status)  user.status = data.status;
  if (data.preferences) Object.assign(user.preferences, data.preferences);
  await user.save();
  return user;
};

const softDelete = async (id, schoolId = null) => {
  const user = await findById(id, schoolId);
  user.isDeleted = true;
  user.deletedAt = new Date();
  user.status    = 'inactive';
  await user.save();
};

const updateStatus = async (id, status, schoolId = null) => {
  const user = await findById(id, schoolId);
  user.status = status;
  await user.save();
  return user;
};

// Invite creates the user with a random temp password and sets a reset token
const invite = async (data, inviterSchoolId = null) => {
  const exists = await User.findOne({ email: data.email });
  if (exists) throw new ConflictError(`Email '${data.email}' is already registered`);

  const schoolId   = data.role === 'super_admin' ? null : (data.schoolId || inviterSchoolId || null);
  const tempPass   = crypto.randomBytes(12).toString('hex');
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashed     = crypto.createHash('sha256').update(resetToken).digest('hex');

  const user = await User.create({
    ...data,
    schoolId,
    password: tempPass,
    status: 'active',
    isEmailVerified: true,
    passwordResetToken:   hashed,
    passwordResetExpires: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 h
  });

  return { user, resetToken };
};

// Bulk import
const bulkCreate = async (rows, schoolId) => {
  const results = { created: [], failed: [] };
  for (const row of rows) {
    try {
      const u = await create(row, schoolId);
      results.created.push({ email: u.email, id: u._id });
    } catch (e) {
      results.failed.push({ email: row.email, reason: e.message });
    }
  }
  return results;
};

module.exports = { create, invite, bulkCreate, findById, list, update, softDelete, updateStatus };
