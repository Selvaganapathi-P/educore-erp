import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, School } from 'lucide-react';

const links = [
  { to: '/',          label: 'Home',       end: true },
  { to: '/about',     label: 'About' },
  { to: '/facilities', label: 'Facilities' },
  { to: '/gallery',   label: 'Gallery' },
  { to: '/contact',   label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-bold text-blue-700 text-lg">
          <School className="w-6 h-6" />
          EduCore School
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive ? 'text-blue-700 bg-blue-50' : 'text-gray-600 hover:text-blue-700 hover:bg-gray-50'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <Link to="/login" className="ml-4 px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors">
            Login
          </Link>
        </div>

        {/* Mobile menu button */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-md text-gray-600">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t bg-white px-4 py-3 space-y-1">
          {links.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm font-medium ${
                  isActive ? 'text-blue-700 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <Link to="/login" onClick={() => setOpen(false)} className="block px-3 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg text-center mt-2">
            Login
          </Link>
        </div>
      )}
    </nav>
  );
}
