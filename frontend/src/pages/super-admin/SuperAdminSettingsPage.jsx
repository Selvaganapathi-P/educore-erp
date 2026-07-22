import { useState } from 'react';
import { Settings, Globe, Bell, Shield, Save } from 'lucide-react';

export default function SuperAdminSettingsPage() {
  const [platformName, setPlatformName] = useState('EduCore ERP');
  const [supportEmail, setSupportEmail] = useState('support@educore.app');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Global configuration for EduCore ERP</p>
      </div>

      {/* General */}
      <div className="card">
        <div className="card-body space-y-5">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Globe size={16} /> General
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label">Platform Name</label>
              <input className="input" value={platformName} onChange={e => setPlatformName(e.target.value)} />
            </div>
            <div>
              <label className="label">Support Email</label>
              <input className="input" type="email" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card">
        <div className="card-body space-y-4">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Bell size={16} /> Notifications
          </h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setEmailNotifs(v => !v)}
              className={`w-10 h-5 rounded-full transition-colors relative ${emailNotifs ? 'bg-primary-500' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${emailNotifs ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">Email notifications</p>
              <p className="text-xs text-slate-500">Receive alerts when new schools register or users report issues</p>
            </div>
          </label>
        </div>
      </div>

      {/* Security */}
      <div className="card">
        <div className="card-body space-y-4">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Shield size={16} /> Security
          </h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setMaintenanceMode(v => !v)}
              className={`w-10 h-5 rounded-full transition-colors relative ${maintenanceMode ? 'bg-amber-500' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${maintenanceMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">Maintenance mode</p>
              <p className="text-xs text-slate-500">Temporarily disable access for all school users (super admin still accessible)</p>
            </div>
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="btn btn-primary flex items-center gap-2">
          <Save size={15} /> Save Settings
        </button>
      </div>
    </div>
  );
}
