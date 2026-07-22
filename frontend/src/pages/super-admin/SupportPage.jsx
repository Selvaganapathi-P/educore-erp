import { LifeBuoy, Mail, MessageSquare, BookOpen, ExternalLink } from 'lucide-react';

const RESOURCES = [
  {
    icon: BookOpen,
    title: 'Documentation',
    desc: 'Guides, API reference, and how-to articles',
    link: '#',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: MessageSquare,
    title: 'Community Forum',
    desc: 'Ask questions and share tips with other admins',
    link: '#',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Mail,
    title: 'Email Support',
    desc: 'Reach our support team directly',
    link: 'mailto:support@educore.app',
    color: 'bg-green-50 text-green-600',
  },
];

const FAQS = [
  { q: 'How do I add a new school?', a: 'Go to Schools → New School, fill in the school details and click Save.' },
  { q: 'How do I reset a user\'s password?', a: 'Go to the Users page, find the user, and use the Reset Password action.' },
  { q: 'Can I import students in bulk?', a: 'Yes — go to Students and use the Import CSV button to upload a spreadsheet.' },
  { q: 'How does multi-tenancy work?', a: 'Each school is an isolated tenant. Data is partitioned by schoolId so schools cannot see each other\'s data.' },
];

export default function SupportPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Support</h1>
        <p className="text-sm text-slate-500 mt-0.5">Get help with EduCore ERP</p>
      </div>

      {/* Resources */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {RESOURCES.map(r => (
          <a key={r.title} href={r.link} className="card hover:shadow-md transition-shadow group">
            <div className="card-body flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${r.color} shrink-0`}>
                <r.icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors flex items-center gap-1">
                  {r.title} <ExternalLink size={12} className="opacity-0 group-hover:opacity-60 transition-opacity" />
                </p>
                <p className="text-sm text-slate-500 mt-0.5">{r.desc}</p>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* FAQs */}
      <div className="card">
        <div className="card-body">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <LifeBuoy size={16} /> Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            {FAQS.map(faq => (
              <div key={faq.q} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                <p className="font-medium text-slate-800 text-sm">{faq.q}</p>
                <p className="text-sm text-slate-500 mt-1">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact form */}
      <div className="card">
        <div className="card-body">
          <h3 className="font-semibold text-slate-900 mb-4">Send a message</h3>
          <div className="space-y-4 max-w-xl">
            <div>
              <label className="label">Subject</label>
              <input className="input" placeholder="Brief description of your issue" />
            </div>
            <div>
              <label className="label">Message</label>
              <textarea className="input min-h-[120px] resize-none" placeholder="Describe your issue in detail…" />
            </div>
            <button className="btn btn-primary btn-sm">Send message</button>
          </div>
        </div>
      </div>
    </div>
  );
}
