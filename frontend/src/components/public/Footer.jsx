import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';

const navLinks = [
  ['/about',      'About Us'],
  ['/facilities', 'Facilities'],
  ['/gallery',    'Gallery'],
  ['/contact',    'Contact'],
];

export default function Footer() {
  return (
    <footer style={{ background: '#050810', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">

        {/* Brand */}
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white"
              style={{ background: 'linear-gradient(135deg,#1D4ED8,#7C3AED)' }}>S</div>
            <span className="font-bold text-white">Selva National School</span>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">
            Empowering students with knowledge, character, and a love for lifelong learning since 1999.
          </p>
          {/* Decorative line */}
          <div className="mt-6 h-px w-16" style={{ background: 'linear-gradient(90deg,#1D4ED8,transparent)' }} />
        </div>

        {/* Quick Links */}
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-slate-500 mb-5">Navigation</p>
          <ul className="space-y-3">
            {navLinks.map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="text-slate-400 text-sm hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/login" className="text-slate-400 text-sm hover:text-white transition-colors flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                Student / Staff Login
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-slate-500 mb-5">Contact</p>
          <ul className="space-y-4">
            <li className="flex items-start gap-3 text-slate-400 text-sm">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
              123 School Road, Anna Nagar,<br />Chennai, Tamil Nadu – 600040
            </li>
            <li className="flex items-center gap-3 text-slate-400 text-sm">
              <Phone className="w-4 h-4 flex-shrink-0 text-blue-500" />
              +91 98765 43210
            </li>
            <li className="flex items-center gap-3 text-slate-400 text-sm">
              <Mail className="w-4 h-4 flex-shrink-0 text-blue-500" />
              info@educoreshool.edu.in
            </li>
          </ul>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-600 text-xs">© {new Date().getFullYear()} Selva National School. All rights reserved.</p>
          <p className="text-slate-700 text-xs">Designed with ❤ for learners everywhere</p>
        </div>
      </div>
    </footer>
  );
}
