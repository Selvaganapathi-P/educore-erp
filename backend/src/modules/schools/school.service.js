const { School } = require('./school.model');
const { Settings } = require('../settings/settings.model');
const { Subscription } = require('../subscriptions/subscription.model');
const { ConflictError, NotFoundError } = require('../../utils/appError');
const { paginate } = require('../../utils/apiResponse');
const dayjs = require('dayjs');

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function ensureUniqueSlug(base, excludeId = null) {
  let slug = slugify(base);
  let counter = 0;
  while (true) {
    const candidate = counter === 0 ? slug : `${slug}-${counter}`;
    const filter = { slug: candidate };
    if (excludeId) filter._id = { $ne: excludeId };
    const exists = await School.findOne(filter);
    if (!exists) return candidate;
    counter++;
  }
}

async function create(data) {
  const existing = await School.findOne({ email: data.email.toLowerCase(), isDeleted: false });
  if (existing) throw new ConflictError('A school with this email already exists');

  const slug = await ensureUniqueSlug(data.name);
  const trialDays = data.trialDays ?? 14;
  const now = dayjs();

  const school = await School.create({
    ...data,
    slug,
    status: trialDays > 0 ? 'trial' : 'active',
    trialEndDate: trialDays > 0 ? now.add(trialDays, 'day').toDate() : null,
  });

  // Provision default settings document
  await Settings.create({ schoolId: school._id });

  // Provision trial subscription
  await Subscription.create({
    schoolId:    school._id,
    plan:        data.subscriptionPlan || 'free',
    status:      trialDays > 0 ? 'trial' : 'active',
    startDate:   now.toDate(),
    endDate:     now.add(trialDays > 0 ? trialDays : 365, 'day').toDate(),
    trialEndDate:trialDays > 0 ? now.add(trialDays, 'day').toDate() : null,
  });

  return school;
}

async function list(query) {
  const { page, limit, search, status, plan, sortBy, sortOrder } = query;
  const filter = { isDeleted: false };
  if (status) filter.status = status;
  if (plan)   filter.subscriptionPlan = plan;
  if (search) {
    filter.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { slug:  { $regex: search, $options: 'i' } },
    ];
  }

  const sort  = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
  const skip  = (page - 1) * limit;
  const total = await School.countDocuments(filter);
  const schools = await School.find(filter).sort(sort).skip(skip).limit(limit).select('-__v');

  return { schools, meta: paginate(page, limit, total) };
}

async function findById(id) {
  const school = await School.findOne({ _id: id, isDeleted: false }).select('-__v');
  if (!school) throw new NotFoundError('School not found');
  return school;
}

async function update(id, data) {
  const school = await findById(id);
  if (data.name && data.name !== school.name) {
    data.slug = await ensureUniqueSlug(data.name, id);
  }
  Object.assign(school, data);
  await school.save();
  return school;
}

async function updateStatus(id, status, reason) {
  const school = await findById(id);
  const prev   = school.status;
  school.status = status;
  if (reason) school.statusReason = reason;
  if (status === 'suspended') school.suspendedAt = new Date();
  await school.save();
  return { school, previous: prev };
}

async function softDelete(id) {
  const school = await findById(id);
  school.isDeleted  = true;
  school.deletedAt  = new Date();
  school.status     = 'inactive';
  await school.save();
}

async function getStats() {
  const [total, active, trial, suspended, byPlan] = await Promise.all([
    School.countDocuments({ isDeleted: false }),
    School.countDocuments({ isDeleted: false, status: 'active'    }),
    School.countDocuments({ isDeleted: false, status: 'trial'     }),
    School.countDocuments({ isDeleted: false, status: 'suspended' }),
    School.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$subscriptionPlan', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);
  return { total, active, trial, suspended, byPlan };
}

module.exports = { create, list, findById, update, updateStatus, softDelete, getStats };
