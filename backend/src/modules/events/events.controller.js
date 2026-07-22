const svc = require('./events.service');
const { asyncHandler } = require('../../utils/asyncHandler');

const getDashboard       = asyncHandler(async (req, res) => { res.json({ success: true, data: await svc.getDashboard(req.schoolId) }); });

const listEvents         = asyncHandler(async (req, res) => { res.json({ success: true, ...(await svc.listEvents(req.schoolId, req.query)) }); });
const getEvent           = asyncHandler(async (req, res) => {
  const e = await svc.getEvent(req.schoolId, req.params.id);
  if (!e) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: e });
});
const createEvent        = asyncHandler(async (req, res) => { res.status(201).json({ success: true, data: await svc.createEvent(req.schoolId, req.body, req.user._id) }); });
const updateEvent        = asyncHandler(async (req, res) => { res.json({ success: true, data: await svc.updateEvent(req.schoolId, req.params.id, req.body, req.user._id) }); });
const deleteEvent        = asyncHandler(async (req, res) => { await svc.deleteEvent(req.schoolId, req.params.id, req.user._id); res.json({ success: true }); });

const listCertificates   = asyncHandler(async (req, res) => { res.json({ success: true, ...(await svc.listCertificates(req.schoolId, req.query)) }); });
const getCertificate     = asyncHandler(async (req, res) => {
  const c = await svc.getCertificate(req.schoolId, req.params.id);
  if (!c) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: c });
});
const issueCertificate   = asyncHandler(async (req, res) => { res.status(201).json({ success: true, data: await svc.issueCertificate(req.schoolId, req.body, req.user._id) }); });
const updateCertificate  = asyncHandler(async (req, res) => { res.json({ success: true, data: await svc.updateCertificate(req.schoolId, req.params.id, req.body, req.user._id) }); });
const deleteCertificate  = asyncHandler(async (req, res) => { await svc.deleteCertificate(req.schoolId, req.params.id, req.user._id); res.json({ success: true }); });

module.exports = { getDashboard, listEvents, getEvent, createEvent, updateEvent, deleteEvent, listCertificates, getCertificate, issueCertificate, updateCertificate, deleteCertificate };
