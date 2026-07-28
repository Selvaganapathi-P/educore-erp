import { Link } from 'react-router-dom';
import { School, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-auto">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
            <School className="w-5 h-5 text-blue-400" />
            EduCore School
          </div>
          <p className="text-sm leading-relaxed">
            Dedicated to nurturing young minds with quality education, values, and a passion for excellence.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            {[['/', 'Home'], ['/about', 'About Us'], ['/facilities', 'Facilities'], ['/gallery', 'Gallery'], ['/contact', 'Contact']].map(([to, label]) => (
              <li key={to}><Link to={to} className="hover:text-white transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-400" /> 123 School Road, City, State 600001</li>
            <li className="flex items-center gap-2"><Phone className="w-4 h-4 flex-shrink-0 text-blue-400" /> +91 98765 43210</li>
            <li className="flex items-center gap-2"><Mail className="w-4 h-4 flex-shrink-0 text-blue-400" /> info@educoreshool.edu.in</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} EduCore School. All rights reserved.
      </div>
    </footer>
  );
}
