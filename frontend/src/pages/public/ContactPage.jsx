import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error('Please fill all required fields'); return; }
    setLoading(true);
    setTimeout(() => {
      setSent(true);
      setLoading(false);
      toast.success('Message sent! We\'ll get back to you shortly.');
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 800);
  };

  return (
    <div className="bg-[#0A0F1E] text-white pt-16">

      {/* Hero */}
      <div className="relative py-24 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(rgba(99,143,255,0.12) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[260px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(245,158,11,0.12) 0%, transparent 70%)' }} />
        <div className="relative z-10">
          <span className="text-xs font-semibold tracking-widest uppercase text-amber-400">Get in Touch</span>
          <h1 className="text-4xl md:text-5xl font-black mt-3 leading-tight">
            We'd Love to{' '}
            <span style={{
              background: 'linear-gradient(90deg,#FBBF24,#F59E0B)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Hear From You</span>
          </h1>
          <p className="text-slate-400 mt-4 text-base max-w-xl mx-auto">
            Admissions, enquiries, or just want to visit campus — we're here to help.
          </p>
        </div>
      </div>

      <section className="py-12 pb-24 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">

          {/* Info */}
          <div>
            <h2 className="font-bold text-white text-lg mb-7">School Information</h2>
            <div className="space-y-5 mb-10">
              {[
                [MapPin, 'amber', '123 School Road, Anna Nagar\nChennai, Tamil Nadu – 600040'],
                [Phone, 'blue', '+91 98765 43210\n+91 44 2345 6789'],
                [Mail, 'purple', 'info@educoreshool.edu.in\nadmissions@educoreshool.edu.in'],
                [Clock, 'emerald', 'Mon – Fri: 8:00 AM – 4:30 PM\nSaturday: 8:00 AM – 1:00 PM'],
              ].map(([Icon, color, text]) => {
                const clr = { amber: '#F59E0B', blue: '#60A5FA', purple: '#A78BFA', emerald: '#34D399' };
                return (
                  <div key={text} className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${clr[color]}15` }}>
                      <Icon className="w-4 h-4" style={{ color: clr[color] }} />
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{text}</p>
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl p-5 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg,rgba(29,78,216,0.12),rgba(29,78,216,0.05))', border: '1px solid rgba(29,78,216,0.2)' }}>
              <h3 className="font-bold text-white mb-2">Admissions Enquiries</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Visit the school office between <span className="text-white">9 AM – 2 PM</span> on school days,
                or email <span className="text-blue-400">admissions@educoreshool.edu.in</span>
              </p>
            </div>
          </div>

          {/* Form */}
          <div>
            <div className="rounded-2xl p-7 relative overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {sent ? (
                <div className="py-12 text-center">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'rgba(52,211,153,0.12)' }}>
                    <span className="text-2xl">✓</span>
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2">Message Sent!</h3>
                  <p className="text-slate-400 text-sm">We'll get back to you within 1–2 business days.</p>
                  <button onClick={() => setSent(false)} className="mt-6 text-blue-400 text-sm hover:text-blue-300 transition-colors">
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="font-bold text-white text-lg mb-5">Send a Message</h2>
                  {[
                    { label: 'Full Name', key: 'name', type: 'text', ph: 'Your name', req: true },
                    { label: 'Email Address', key: 'email', type: 'email', ph: 'you@email.com', req: true },
                    { label: 'Subject', key: 'subject', type: 'text', ph: 'What is this about?', req: false },
                  ].map(({ label, key, type, ph, req }) => (
                    <div key={key}>
                      <label className="text-xs font-medium text-slate-400 block mb-1.5">
                        {label}{req && <span className="text-red-400 ml-1">*</span>}
                      </label>
                      <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        placeholder={ph}
                        className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none transition-all duration-200"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                        onFocus={e => e.target.style.borderColor = 'rgba(96,165,250,0.5)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1.5">
                      Message <span className="text-red-400">*</span>
                    </label>
                    <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      rows={4} placeholder="Write your message here..."
                      className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none resize-none transition-all duration-200"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                      onFocus={e => e.target.style.borderColor = 'rgba(96,165,250,0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                    />
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg,#1D4ED8,#2563EB)', boxShadow: '0 0 20px rgba(29,78,216,0.35)' }}>
                    {loading ? 'Sending...' : <><span>Send Message</span><ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
