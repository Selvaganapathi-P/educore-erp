const settingsService = require('./settings.service');
const { sendSuccess } = require('../../utils/apiResponse');

async function getSettings(req, res) {
  const schoolId = req.user.role === 'super_admin' ? req.params.schoolId : req.schoolId;
  const settings = await settingsService.getBySchool(schoolId);
  sendSuccess(res, settings, 'Settings fetched');
}

async function updateSettings(req, res) {
  const schoolId = req.user.role === 'super_admin' ? req.params.schoolId : req.schoolId;
  const settings = await settingsService.update(schoolId, req.body);
  sendSuccess(res, settings, 'Settings updated');
}

async function updateSettingsSection(req, res) {
  const schoolId = req.user.role === 'super_admin' ? req.params.schoolId : req.schoolId;
  const settings = await settingsService.updateSection(schoolId, req.params.section, req.body);
  sendSuccess(res, settings, `${req.params.section} settings updated`);
}

module.exports = { getSettings, updateSettings, updateSettingsSection };
