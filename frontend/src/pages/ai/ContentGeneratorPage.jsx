import { useState } from 'react';
import { FileText, Copy, Download, Loader2, ChevronDown, Check } from 'lucide-react';
import api from '../../lib/axios';

const TEMPLATES = [
  { id: 'announcement',  label: 'Announcement',       fields: ['title','audience','date','details','tone'] },
  { id: 'notice',        label: 'Notice',              fields: ['title','audience','date','details'] },
  { id: 'circular',      label: 'Circular',            fields: ['title','audience','date','refNo','details'] },
  { id: 'parent_letter', label: 'Parent Letter',       fields: ['title','studentName','class','details','action'] },
  { id: 'exam_notice',   label: 'Exam Notice',         fields: ['examName','classes','startDate','endDate','details'] },
  { id: 'achievement',   label: 'Achievement Letter',  fields: ['achievement','recipients','event','details'] },
  { id: 'holiday_notice',label: 'Holiday Notice',      fields: ['holidayName','dates','reason','returnDate','details'] },
  { id: 'meeting_notice',label: 'Meeting Notice',      fields: ['meetingType','datetime','venue','attendees','agenda'] },
];

const FIELD_META = {
  title:        { label: 'Title / Subject',      type: 'text' },
  audience:     { label: 'Audience',              type: 'text',     placeholder: 'e.g. All Students, Class 10' },
  date:         { label: 'Date',                  type: 'date' },
  details:      { label: 'Key Details / Content', type: 'textarea' },
  tone:         { label: 'Tone',                  type: 'text',     placeholder: 'Professional, Urgent, Friendly…' },
  refNo:        { label: 'Reference Number',       type: 'text',     placeholder: 'CIRC/2025/001' },
  studentName:  { label: 'Student Name',           type: 'text' },
  class:        { label: 'Class',                  type: 'text',     placeholder: 'e.g. Class 10-A' },
  action:       { label: 'Action Required',        type: 'text',     placeholder: 'e.g. Reply by Monday' },
  examName:     { label: 'Exam Name',              type: 'text',     placeholder: 'e.g. Half Yearly Exam 2025' },
  classes:      { label: 'Classes',                type: 'text',     placeholder: 'e.g. Class 9 & 10' },
  startDate:    { label: 'Start Date',             type: 'date' },
  endDate:      { label: 'End Date',               type: 'date' },
  achievement:  { label: 'Achievement',            type: 'text' },
  recipients:   { label: 'Recipient(s)',           type: 'text' },
  event:        { label: 'Event / Competition',    type: 'text' },
  holidayName:  { label: 'Holiday Name',           type: 'text' },
  dates:        { label: 'Holiday Date(s)',         type: 'text',     placeholder: 'e.g. 15–17 August 2025' },
  reason:       { label: 'Reason',                 type: 'text' },
  returnDate:   { label: 'Return Date',            type: 'date' },
  meetingType:  { label: 'Meeting Type',           type: 'text',     placeholder: 'e.g. PTA Meeting, Staff Meeting' },
  datetime:     { label: 'Date & Time',            type: 'text',     placeholder: 'e.g. 25 July 2025, 10:00 AM' },
  venue:        { label: 'Venue',                  type: 'text' },
  attendees:    { label: 'Attendees',              type: 'text',     placeholder: 'e.g. All Parents, Class Teachers' },
  agenda:       { label: 'Agenda / Key Points',    type: 'textarea' },
};

export default function ContentGeneratorPage() {
  const [template, setTemplate] = useState(TEMPLATES[0]);
  const [fields, setFields]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [output, setOutput]     = useState('');
  const [error, setError]       = useState('');
  const [copied, setCopied]     = useState(false);

  const handleTemplateChange = (tpl) => {
    setTemplate(tpl);
    setFields({});
    setOutput('');
    setError('');
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setOutput('');
    try {
      const res = await api.post('/ai/content', { template: template.id, details: fields });
      setOutput(res.data.data?.content ?? '');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `${template.id}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isReady = template.fields.some(f => fields[f]?.trim());

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Content Generator</h1>
          <p className="page-subtitle">AI-powered school communication drafting</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Left — Form */}
        <div className="space-y-4">
          {/* Template selector */}
          <div className="card card-body">
            <label className="form-label">Select Template</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleTemplateChange(t)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border text-left transition-colors ${
                    template.id === t.id
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-slate-200 text-slate-600 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Template fields */}
          <div className="card card-body space-y-3">
            <h3 className="font-semibold text-sm text-slate-700">{template.label} — Details</h3>
            {template.fields.map(fieldKey => {
              const meta = FIELD_META[fieldKey] || { label: fieldKey, type: 'text' };
              return (
                <div key={fieldKey}>
                  <label className="form-label">{meta.label}</label>
                  {meta.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      className="form-input resize-none text-sm"
                      placeholder={meta.placeholder || ''}
                      value={fields[fieldKey] || ''}
                      onChange={e => setFields(prev => ({ ...prev, [fieldKey]: e.target.value }))}
                    />
                  ) : (
                    <input
                      type={meta.type}
                      className="form-input text-sm"
                      placeholder={meta.placeholder || ''}
                      value={fields[fieldKey] || ''}
                      onChange={e => setFields(prev => ({ ...prev, [fieldKey]: e.target.value }))}
                    />
                  )}
                </div>
              );
            })}

            <button
              onClick={handleGenerate}
              disabled={loading || !isReady}
              className="btn btn-primary btn-md w-full gap-2 mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              {loading ? 'Generating…' : 'Generate Content'}
            </button>

            {error && (
              <p className="text-sm text-red-600 mt-1">{error}</p>
            )}
          </div>
        </div>

        {/* Right — Output */}
        <div className="card flex flex-col min-h-80">
          <div className="card-body flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-slate-700">Generated Content</h3>
              {output && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="btn btn-ghost btn-sm gap-1.5 text-xs">
                    {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button onClick={handleDownload} className="btn btn-ghost btn-sm gap-1.5 text-xs">
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              )}
            </div>

            {loading && (
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                <p className="text-sm text-slate-500">Generating your content…</p>
              </div>
            )}

            {!loading && !output && (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center border-2 border-dashed border-slate-200 rounded-xl">
                <FileText className="w-8 h-8 text-slate-300" />
                <p className="text-sm text-slate-400">Your generated content will appear here</p>
              </div>
            )}

            {!loading && output && (
              <div className="flex-1 relative">
                <textarea
                  readOnly
                  value={output}
                  className="w-full h-full min-h-64 form-input text-sm font-mono resize-none bg-slate-50"
                  style={{ lineHeight: '1.7' }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
