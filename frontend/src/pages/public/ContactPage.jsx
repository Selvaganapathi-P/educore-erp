import { useState } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill all required fields');
      return;
    }
    setSent(true);
    toast.success('Message sent! We will get back to you soon.');
    setForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <span className="text-sm text-blue-600 font-semibold uppercase tracking-wider">Get In Touch</span>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Contact Us</h1>
        <p className="text-gray-500 mt-3">We'd love to hear from you. Reach us anytime.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Info */}
        <div>
          <h2 className="font-bold text-gray-900 text-lg mb-6">School Information</h2>
          <ul className="space-y-5">
            {[
              [MapPin, '123 School Road, Anna Nagar, Chennai, Tamil Nadu – 600040'],
              [Phone, '+91 98765 43210 | +91 44 2345 6789'],
              [Mail, 'info@educoreshool.edu.in'],
              [Clock, 'Mon–Fri: 8:00 AM – 4:30 PM\nSat: 8:00 AM – 1:00 PM'],
            ].map(([Icon, text], i) => (
              <li key={i} className="flex items-start gap-3 text-gray-600 text-sm">
                <Icon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="whitespace-pre-line">{text}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 bg-blue-50 rounded-xl p-5">
            <h3 className="font-semibold text-blue-900 mb-2">Admissions</h3>
            <p className="text-sm text-gray-600">For admissions enquiries, please visit the school office between 9 AM – 2 PM on school days, or email admissions@educoreshool.edu.in</p>
          </div>
        </div>

        {/* Form */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Name *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Subject</label>
              <input
                value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What is this about?"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Message *</label>
              <textarea
                rows={5}
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Write your message here..."
              />
            </div>
            <button type="submit" className="w-full py-2.5 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors text-sm">
              {sent ? 'Sent!' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
