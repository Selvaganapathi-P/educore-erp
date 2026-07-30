import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const links = [
  { to: '/',           label: 'Home',       end: true },
  { to: '/about',      label: 'About' },
  { to: '/facilities', label: 'Facilities' },
  { to: '/gallery',    label: 'Gallery' },
  { to: '/contact',    label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => { setOpen(false); }, [location]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav
      className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? 'rgba(10,15,30,0.92)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-base"
            style={{ background: 'linear-gradient(135deg,#1D4ED8,#7C3AED)' }}>S</div>
          <span className="font-bold text-white text-base tracking-tight">
            Selva National <span className="text-slate-400 font-medium">School</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-white bg-white/8'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }>
              {label}
            </NavLink>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login"
            className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link to="/contact"
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#1D4ED8,#2563EB)', boxShadow: '0 0 16px rgba(29,78,216,0.4)' }}>
            Apply Now
          </Link>
        </div>

        {/* Mobile burger */}
        <button onClick={() => setOpen(p => !p)}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden px-4 pb-4 pt-1"
          style={{ background: 'rgba(10,15,30,0.98)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex flex-col gap-1">
            {links.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'text-white bg-white/8' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`
                }>
                {label}
              </NavLink>
            ))}
            <div className="border-t border-white/6 mt-2 pt-3 flex flex-col gap-2">
              <Link to="/login" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                Sign In
              </Link>
              <Link to="/contact"
                className="block px-4 py-3 rounded-xl text-sm font-bold text-white text-center"
                style={{ background: 'linear-gradient(135deg,#1D4ED8,#2563EB)' }}>
                Apply Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
