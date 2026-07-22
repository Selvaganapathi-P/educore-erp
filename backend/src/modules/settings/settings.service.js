const { Settings } = require('./settings.model');
const { NotFoundError } = require('../../utils/appError');

async function getBySchool(schoolId) {
  let settings = await Settings.findOne({ schoolId });
  if (!settings) {
    settings = await Settings.create({ schoolId });
  }
  return settings;
}

async function update(schoolId, data) {
  const settings = await getBySchool(schoolId);

  // Deep merge top-level sections
  const sections = ['academic','attendance','fees','notifications','integrations','library','transport','certificates','idCard'];
  for (const section of sections) {
    if (data[section]) {
      settings[section] = { ...settings[section].toObject ? settings[section].toObject() : settings[section], ...data[section] };
    }
  }
  settings.markModified('academic');
  settings.markModified('notifications');
  settings.markModified('integrations');
  await settings.save();
  return settings;
}

async function updateSection(schoolId, section, data) {
  const settings = await getBySchool(schoolId);
  const allowed  = ['academic','attendance','fees','notifications','integrations','library','transport','certificates','idCard'];
  if (!allowed.includes(section)) throw new NotFoundError(`Unknown settings section: ${section}`);

  const current = settings[section] ? (settings[section].toObject ? settings[section].toObject() : settings[section]) : {};
  settings[section] = { ...current, ...data };
  settings.markModified(section);
  await settings.save();
  return settings;
}

module.exports = { getBySchool, update, updateSection };
