import { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

export default function StudentProfilePage() {
  const { user, student, setStudent } = useAuthStore();
  const [edit, setEdit] = useState({ phone: '', email: '', address: '' });
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    if (student) setEdit({ phone: student.phone || '', email: student.email || '', address: student.address || '' });
  }, [student]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await api.put(`/students/${student._id}`, edit);
      setStudent(r.data.data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    if (pwForm.next.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setChangingPw(true);
    try {
      await api.put(`/students/${student._id}`, { password: pwForm.next });
      toast.success('Password changed');
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setChangingPw(false);
    }
  };

  if (!student) return <p className="text-gray-400">Loading profile...</p>;

  const readonly = [
    ['Admission Number', student.admissionNumber],
    ['Class', `${student.class}${student.section ? ` – ${student.section}` : ''}`],
    ['Roll Number', student.rollNumber || '—'],
    ['Academic Year', student.academicYear],
    ["Father's Name", student.fatherName || '—'],
    ["Mother's Name", student.motherName || '—'],
    ['Date of Birth', student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-IN') : '—'],
    ['Gender', student.gender || '—'],
    ['Blood Group', student.bloodGroup || '—'],
  ];

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      {/* Read-only info */}
      <div className="bg-white rounded-xl border p-6 mb-5">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-2xl font-bold">
            {user?.name?.[0]}
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500">Student</p>
          </div>
        </div>

        <h2 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide text-gray-500">Academic Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {readonly.map(([k, v]) => (
            <div key={k}>
              <p className="text-xs text-gray-500">{k}</p>
              <p className="font-medium text-gray-900 mt-0.5">{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Editable fields */}
      <div className="bg-white rounded-xl border p-6 mb-5">
        <h2 className="font-semibold text-gray-900 mb-4">Contact Information</h2>
        <form onSubmit={saveProfile} className="space-y-4">
          {[['Phone', 'phone', 'tel'], ['Email', 'email', 'email'], ['Address', 'address', 'text']].map(([label, key, type]) => (
            <div key={key}>
              <label className="text-sm font-medium text-gray-700">{label}</label>
              {key === 'address' ? (
                <textarea value={edit.address} onChange={e => setEdit(f => ({ ...f, address: e.target.value }))} rows={2}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
              ) : (
                <input type={type} value={edit[key]} onChange={e => setEdit(f => ({ ...f, [key]: e.target.value }))}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              )}
            </div>
          ))}
          <button type="submit" disabled={saving} className="px-5 py-2 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Change Password</h2>
        <form onSubmit={changePassword} className="space-y-4">
          {[['New Password', 'next'], ['Confirm Password', 'confirm']].map(([label, key]) => (
            <div key={key}>
              <label className="text-sm font-medium text-gray-700">{label}</label>
              <input type="password" value={pwForm[key]} onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          ))}
          <button type="submit" disabled={changingPw} className="px-5 py-2 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 disabled:opacity-60">
            {changingPw ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
