import { CreditCard, CheckCircle, Zap, Building2 } from 'lucide-react';

const PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'Perfect for small schools just getting started',
    features: ['Up to 200 students', '5 staff accounts', 'Core modules', 'Email support'],
    current: true,
  },
  {
    name: 'Growth',
    price: '$49/mo',
    description: 'For growing schools that need more power',
    features: ['Up to 1,000 students', 'Unlimited staff', 'All modules', 'AI Assistant', 'Priority support'],
    current: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large institutions and school chains',
    features: ['Unlimited students', 'Multi-campus', 'Custom integrations', 'Dedicated SLA', '24/7 support'],
    current: false,
  },
];

export default function BillingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Billing &amp; Plans</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your subscription and billing details</p>
      </div>

      {/* Current plan banner */}
      <div className="card bg-primary-50 border border-primary-200">
        <div className="card-body flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
            <Zap size={22} className="text-primary-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-primary-900">You're on the Starter plan</p>
            <p className="text-xs text-primary-700 mt-0.5">Upgrade to unlock AI, advanced reports, and more modules</p>
          </div>
          <button className="btn btn-primary btn-sm">Upgrade Plan</button>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map(plan => (
          <div key={plan.name} className={`card relative ${plan.current ? 'ring-2 ring-primary-500' : ''}`}>
            {plan.current && (
              <span className="absolute -top-3 left-4 bg-primary-500 text-white text-xs font-semibold px-3 py-0.5 rounded-full">
                Current plan
              </span>
            )}
            <div className="card-body space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{plan.name}</h3>
                <p className="text-2xl font-bold text-primary-600 mt-1">{plan.price}</p>
                <p className="text-sm text-slate-500 mt-1">{plan.description}</p>
              </div>
              <ul className="space-y-2">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle size={14} className="text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button className={`btn w-full ${plan.current ? 'btn-outline' : 'btn-primary'} btn-sm`} disabled={plan.current}>
                {plan.current ? 'Current plan' : plan.price === 'Custom' ? 'Contact sales' : 'Upgrade'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Payment method placeholder */}
      <div className="card">
        <div className="card-body">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <CreditCard size={16} /> Payment Method
          </h3>
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <Building2 size={20} className="text-slate-400" />
            <p className="text-sm text-slate-500">No payment method added — required only when upgrading to a paid plan</p>
          </div>
        </div>
      </div>
    </div>
  );
}
