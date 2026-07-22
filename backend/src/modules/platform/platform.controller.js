const { School }       = require('../schools/school.model');
const { User }         = require('../users/user.model');
const { Subscription } = require('../subscriptions/subscription.model');
const { SupportTicket }= require('../support/supportTicket.model');
const { sendSuccess }  = require('../../utils/apiResponse');

async function getDashboard(req, res) {
  const [totalSchools, activeSchools, trialSchools, totalUsers, openTickets, revenueAgg] = await Promise.all([
    School.countDocuments({ isDeleted: false }),
    School.countDocuments({ isDeleted: false, status: 'active' }),
    School.countDocuments({ isDeleted: false, status: 'trial' }),
    User.countDocuments({ isDeleted: false, role: { $ne: 'super_admin' } }),
    SupportTicket.countDocuments({ status: { $in: ['open','in_progress'] } }),
    Subscription.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  const revenue = revenueAgg[0]?.total ?? 0;

  const recentSchools = await School.find({ isDeleted: false })
    .sort({ createdAt: -1 }).limit(5)
    .select('name email status subscriptionPlan createdAt');

  sendSuccess(res, {
    stats: { totalSchools, activeSchools, trialSchools, totalUsers, openTickets, revenue },
    recentSchools,
  }, 'Platform dashboard');
}

module.exports = { getDashboard };
