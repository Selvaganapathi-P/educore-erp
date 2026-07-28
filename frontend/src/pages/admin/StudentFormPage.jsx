import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

const CLASSES = Array.from({ length: 12 }, (_, i) => i + 1);
const SECTIONS = ['A', 'B', 'C', 'D', 'E'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const empty = {
  name: '', email: '', password: '', phone: '', address: '',
  admissionNumber: '', fatherName: '', motherName: '',
  dateOfBirth: '', gender: '', bloodGroup: '',
  class: '', section: '', rollNumber: '', academicYear: '',
};

export default function StudentFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/students/${id}`).then(r => {
      const s = r.data.data;
      setForm({
        name: s.name || '', email: s.email || '', password: '', phone: s.phone || '',
        address: s.address || '', admissionNumber: s.admissionNumber || '',
        fatherName: s.fatherName || '', motherName: s.motherName || '',
        dateOfBirth: s.dateOfBirth ? s.dateOfBirth.slice(0, 10) : '',
        gender: s.gender || '', bloodGroup: s.bloodGroup || '',
        class: s.class || '', section: s.section || '',
        rollNumber: s.rollNumber || '', academicYear: s.academicYear || '',
      });
    }).catch(() => toast.error('Failed to load student'));
  }, [id]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.class || !form.academicYear || (!isEdit && !form.admissionNumber)) {
      toast.error('Fill all required fields');
      return;
    }
    setSaving(true);
    try {
      const body = { ...form };
      if (!body.password) delete body.password;
      if (isEdit) {
        await api.put(`/students/${id}`, body);
        toast.success('Student updated');
      } else {
        await api.post('/students', body);
        toast.success('Student added');
      }
      navigate('/admin/students');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const field = (label, key, type = 'text', required = false, opts = null) => (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      {opts ? (
        <select value={form[key]} onChange={e => set(key, e.target.value)}
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Select...</option>
          {opts.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={form[key]} onChange={e => set(key, e.target.value)}
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={label} />
      )}
    </div>
  );

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <button onClick={() => navigate('/admin/students')} className="text-sm text-blue-600 hover:underline">← Back to Students</button>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">{isEdit ? 'Edit Student' : 'Add New Student'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field('Full Name', 'name', 'text', true)}
            {field('Email', 'email', 'email', true)}
            {field('Phone', 'phone', 'tel')}
            {field('Date of Birth', 'dateOfBirth', 'date')}
            {field('Gender', 'gender', 'text', false, ['Male', 'Female', 'Other'])}
            {field('Blood Group', 'bloodGroup', 'text', false, BLOOD_GROUPS)}
            {field("Father's Name", 'fatherName')}
            {field("Mother's Name", 'motherName')}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Address</label>
              <textarea value={form.address} onChange={e => set('address', e.target.value)} rows={2}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Full address" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Academic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field('Admission Number', 'admissionNumber', 'text', !isEdit)}
            {field('Academic Year (e.g. 2024-25)', 'academicYear', 'text', true)}
            {field('Class', 'class', 'text', true, CLASSES.map(String))}
            {field('Section', 'section', 'text', false, SECTIONS)}
            {field('Roll Number', 'rollNumber', 'text')}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Login Credentials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 text-xs text-gray-500">
              {isEdit ? 'Leave password blank to keep existing password.' : 'Default password is Student@123 if left blank.'}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={isEdit ? 'Leave blank to keep current' : 'Default: Student@123'} />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors text-sm disabled:opacity-60">
            {saving ? 'Saving...' : (isEdit ? 'Update Student' : 'Add Student')}
          </button>
          <button type="button" onClick={() => navigate('/admin/students')}
            className="px-6 py-2.5 border text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
