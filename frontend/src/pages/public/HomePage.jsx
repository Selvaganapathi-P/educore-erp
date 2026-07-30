import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Bell, BookOpen, Users, Award, Calendar,
  Shield, Zap, GraduationCap, ChevronRight, Star,
} from 'lucide-react';
import api from '../../lib/axios';

const IMG = {
  hero:      'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1400&q=90&fit=crop',
  classroom: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=900&q=85&fit=crop',
  students:  'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=900&q=85&fit=crop',
  lab:       'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=900&q=85&fit=crop',
  library:   'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=900&q=85&fit=crop',
};

const CAT_COLORS = {
  general: 'bg-slate-100 text-slate-600',
  exam:    'bg-blue-100 text-blue-700',
  event:   'bg-purple-100 text-purple-700',
  holiday: 'bg-emerald-100 text-emerald-700',
  result:  'bg-amber-100 text-amber-700',
};

function Counter({ end, suffix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const n = parseInt(end, 10);
        let cur = 0;
        const t = setInterval(() => {
          cur = Math.min(cur + n / 80, n);
          setVal(Math.floor(cur));
          if (cur >= n) clearInterval(t);
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

export default function HomePage() {
  const [announcements, setAnnouncements] = useState([]);
  useEffect(() => {
    api.get('/public/announcements?limit=4').then(r => setAnnouncements(r.data.data)).catch(() => {});
  }, []);

  return (
    <div className="text-slate-900 bg-white overflow-x-hidden">
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeRight{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
        @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes pulse-ring{0%{transform:scale(1);opacity:.6}100%{transform:scale(1.6);opacity:0}}
        .fu1{animation:fadeUp .7s ease both .1s}
        .fu2{animation:fadeUp .7s ease both .22s}
        .fu3{animation:fadeUp .7s ease both .34s}
        .fu4{animation:fadeUp .7s ease both .46s}
        .fr1{animation:fadeRight .7s ease both .4s}
        .float{animation:floatY 4s ease-in-out infinite}
        .card-hover{transition:transform .25s,box-shadow .25s}
        .card-hover:hover{transform:translateY(-6px);box-shadow:0 20px 40px rgba(29,78,216,.12)}
      `}</style>

      {/* ── HERO ──────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#EFF6FF 0%,#DBEAFE 45%,#EDE9FE 100%)' }}>

        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(147,197,253,.35) 0%,transparent 70%)', transform: 'translate(20%,-20%)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(167,139,250,.2) 0%,transparent 70%)', transform: 'translate(-30%,30%)' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 w-full grid lg:grid-cols-2 gap-12 items-center">

          {/* Left — text */}
          <div>
            <div className="fu1 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-7"
              style={{ background: 'linear-gradient(135deg,#FEF3C7,#FDE68A)', color: '#92400E' }}>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Admissions Open 2025 – 26
            </div>

            <h1 className="fu2 text-5xl sm:text-6xl md:text-7xl font-black leading-[1.04] tracking-tight mb-6">
              <span className="text-slate-900">Selva</span>{' '}
              <span style={{ background: 'linear-gradient(135deg,#1D4ED8,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>National</span>
              <br /><span className="text-slate-900">School</span>
            </h1>

            <p className="fu3 text-slate-600 text-lg md:text-xl leading-relaxed max-w-md mb-10">
              Nurturing curious minds and compassionate leaders for over 25 years.
              Where every student is known, valued, and inspired to excel.
            </p>

            <div className="fu4 flex flex-wrap gap-3 mb-10">
              <Link to="/contact"
                className="group flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm text-white transition-all duration-300 hover:scale-105 hover:shadow-xl"
                style={{ background: 'linear-gradient(135deg,#1D4ED8,#2563EB)', boxShadow: '0 8px 28px rgba(29,78,216,.38)' }}>
                Apply for Admission <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/about"
                className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-sm text-slate-700 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-300">
                Our Story <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Proof badges */}
            <div className="fu4 flex flex-wrap gap-3">
              {[
                { v: '1,200+', l: 'Students', c: '#1D4ED8', bg: '#EFF6FF' },
                { v: '98%',    l: 'Pass Rate', c: '#059669', bg: '#ECFDF5' },
                { v: '80+',    l: 'Teachers',  c: '#7C3AED', bg: '#F5F3FF' },
                { v: '50+',    l: 'Awards',    c: '#D97706', bg: '#FFFBEB' },
              ].map(({ v, l, c, bg }) => (
                <div key={l} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: bg, color: c }}>
                  <span className="font-black">{v}</span>
                  <span className="opacity-70 font-medium">{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — photo frame */}
          <div className="fr1 relative flex justify-center lg:justify-end">
            {/* Main photo */}
            <div className="relative w-full max-w-md">
              <div className="rounded-3xl overflow-hidden shadow-2xl"
                style={{ boxShadow: '0 32px 80px rgba(29,78,216,.22), 0 8px 24px rgba(0,0,0,.08)' }}>
                <img src={IMG.hero} alt="Selva National School" className="w-full aspect-[4/3] object-cover" />
              </div>

              {/* Floating stat card — bottom left */}
              <div className="float absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-xl px-5 py-4 flex items-center gap-3"
                style={{ boxShadow: '0 12px 32px rgba(29,78,216,.15)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#EFF6FF' }}>
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xl font-black text-slate-900">1,200+</p>
                  <p className="text-xs text-slate-500 font-medium">Happy Students</p>
                </div>
              </div>

              {/* Floating star card — top right */}
              <div className="float absolute -top-5 -right-5 bg-white rounded-2xl shadow-xl px-5 py-4 flex items-center gap-3"
                style={{ boxShadow: '0 12px 32px rgba(245,158,11,.2)', animationDelay: '1.5s' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#FFFBEB' }}>
                  <Star className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xl font-black text-slate-900">A+</p>
                  <p className="text-xs text-slate-500 font-medium">CBSE Rating</p>
                </div>
              </div>

              {/* Decorative ring */}
              <div className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{ border: '2px solid rgba(29,78,216,.12)', transform: 'translate(12px,12px)', zIndex: -1 }} />
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-40">
          <span className="text-slate-500 text-xs tracking-widest uppercase font-medium">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-blue-400 to-transparent" />
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white" style={{ borderBottom: '1px solid #F1F5F9' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Years of Excellence', end: '25',   suffix: '+', icon: Award,        c: '#1D4ED8', bg: '#EFF6FF' },
            { label: 'Active Students',      end: '1200', suffix: '+', icon: Users,        c: '#059669', bg: '#ECFDF5' },
            { label: 'Smart Classrooms',     end: '36',               icon: BookOpen,     c: '#7C3AED', bg: '#F5F3FF' },
            { label: 'Alumni Worldwide',     end: '5000', suffix: '+', icon: GraduationCap, c: '#D97706', bg: '#FFFBEB' },
          ].map(({ label, end, suffix = '', icon: Icon, c, bg }) => (
            <div key={label} className="text-center p-6 rounded-2xl" style={{ background: bg }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,.06)' }}>
                <Icon className="w-5 h-5" style={{ color: c }} />
              </div>
              <p className="text-4xl font-black mb-1" style={{ color: c }}><Counter end={end} suffix={suffix} /></p>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY US ────────────────────────────────────── */}
      <section className="py-24 px-4" style={{ background: '#F8FAFF' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-blue-700 bg-blue-100 px-4 py-1.5 rounded-full mb-4">Why Selva National</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
              Built for Every{' '}
              <span style={{ background: 'linear-gradient(135deg,#1D4ED8,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Learner</span>
            </h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
              A modern campus designed to ignite curiosity and shape holistic individuals ready for tomorrow's world.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: Shield,   c:'#1D4ED8', bg:'#EFF6FF', title:'Safe & Inclusive',     desc:'Zero-tolerance environment where every student feels valued, safe, and free to grow.' },
              { icon: Zap,      c:'#D97706', bg:'#FFFBEB', title:'Smart Classrooms',     desc:'Interactive smart boards, high-speed internet, and digital tools in every classroom.' },
              { icon: Award,    c:'#059669', bg:'#ECFDF5', title:'Academic Excellence',  desc:'Consistent top board results with dedicated faculty giving personalised attention.' },
              { icon: Users,    c:'#7C3AED', bg:'#F5F3FF', title:'Holistic Development', desc:'Sports, arts, music, and co-curricular activities to nurture every student\'s talent.' },
              { icon: BookOpen, c:'#0284C7', bg:'#E0F2FE', title:'World-Class Library',  desc:'10,000+ books, digital resources, and a dedicated reading space for all grades.' },
              { icon: Calendar, c:'#DB2777', bg:'#FDF2F8', title:'Vibrant School Life',  desc:'Annual day, cultural fests, science fair, and sports events that build lasting memories.' },
            ].map(({ icon: Icon, c, bg, title, desc }) => (
              <div key={title} className="card-hover bg-white rounded-3xl p-7 border border-slate-100"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,.05)' }}>
                <div className="w-13 h-13 rounded-2xl flex items-center justify-center mb-5" style={{ background: bg, width: 52, height: 52 }}>
                  <Icon className="w-6 h-6" style={{ color: c }} />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRINCIPAL ─────────────────────────────────── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          {/* Photo */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden" style={{ boxShadow: '0 24px 60px rgba(29,78,216,.15)' }}>
              <img src={IMG.students} alt="Students" className="w-full aspect-[4/3] object-cover object-top" />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl px-6 py-5"
              style={{ boxShadow: '0 12px 32px rgba(29,78,216,.12)' }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl text-white"
                  style={{ background: 'linear-gradient(135deg,#1D4ED8,#7C3AED)' }}>S</div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Dr. Selvaraj Murugan</p>
                  <p className="text-slate-500 text-xs">Principal · M.Ed, Ph.D</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quote */}
          <div>
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-amber-600 bg-amber-50 px-4 py-1.5 rounded-full mb-6">Principal's Message</span>
            <div className="relative">
              <span className="absolute -top-6 -left-3 text-[100px] leading-none font-serif text-blue-100 select-none pointer-events-none">"</span>
              <blockquote className="relative text-xl md:text-2xl font-light text-slate-700 leading-relaxed pl-5 border-l-4 border-amber-400">
                At Selva National School, we believe every child carries a universe of potential within them.
                Our dedicated faculty, state-of-the-art facilities, and a culture rooted in values create
                an environment where students are encouraged to{' '}
                <span className="font-bold text-slate-900">question, explore, and lead</span>.
              </blockquote>
            </div>
            <div className="mt-8 flex gap-6">
              <div className="text-center">
                <p className="text-3xl font-black text-blue-600">25+</p>
                <p className="text-xs text-slate-500 mt-1">Years Leading</p>
              </div>
              <div className="w-px bg-slate-100" />
              <div className="text-center">
                <p className="text-3xl font-black text-emerald-600">5k+</p>
                <p className="text-xs text-slate-500 mt-1">Alumni Shaped</p>
              </div>
              <div className="w-px bg-slate-100" />
              <div className="text-center">
                <p className="text-3xl font-black text-purple-600">98%</p>
                <p className="text-xs text-slate-500 mt-1">Pass Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FACILITIES ────────────────────────────────── */}
      <section className="py-24 px-4" style={{ background: '#F0FDF4' }}>
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-emerald-700 bg-emerald-100 px-4 py-1.5 rounded-full mb-4">Infrastructure</span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
            Campus Built to{' '}
            <span style={{ background: 'linear-gradient(135deg,#059669,#10B981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Inspire</span>
          </h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto mb-12 leading-relaxed">
            Every corner of Selva National School is designed to spark learning, creativity, and growth.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { e:'🔬', t:'Science Labs',   s:'3 fully equipped', c:'#EFF6FF' },
              { e:'💻', t:'Computer Lab',   s:'60 workstations',  c:'#F5F3FF' },
              { e:'📚', t:'Library',        s:'10,000+ books',    c:'#FFFBEB' },
              { e:'🏆', t:'Sports Complex', s:'Cricket & courts', c:'#ECFDF5' },
              { e:'🎵', t:'Music Room',     s:'All instruments',  c:'#FDF2F8' },
              { e:'🎨', t:'Art Studio',     s:'Dedicated space',  c:'#FFF7ED' },
              { e:'🚌', t:'Transport',      s:'15 GPS routes',    c:'#E0F2FE' },
              { e:'🏥', t:'Medical Room',   s:'On-campus nurse',  c:'#FEF2F2' },
            ].map(({ e, t, s, c }) => (
              <div key={t} className="card-hover bg-white rounded-2xl p-5 text-left border border-slate-100"
                style={{ boxShadow: '0 4px 16px rgba(0,0,0,.04)' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 text-2xl" style={{ background: c }}>{e}</div>
                <p className="font-bold text-slate-900 text-sm">{t}</p>
                <p className="text-slate-400 text-xs mt-0.5">{s}</p>
              </div>
            ))}
          </div>
          <Link to="/facilities"
            className="inline-flex items-center gap-2 mt-10 px-7 py-3.5 rounded-2xl font-bold text-sm text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg,#059669,#10B981)', boxShadow: '0 8px 24px rgba(5,150,105,.28)' }}>
            View All Facilities <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── ANNOUNCEMENTS ─────────────────────────────── */}
      {announcements.length > 0 && (
        <section className="py-24 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="inline-block text-xs font-bold tracking-widest uppercase text-amber-600 bg-amber-50 px-4 py-1.5 rounded-full mb-3">Latest</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900">Announcements</h2>
              </div>
              <Link to="/contact" className="text-xs text-blue-600 font-semibold hover:text-blue-800 transition-colors flex items-center gap-1">
                Contact us <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {announcements.map(a => (
                <div key={a._id} className="card-hover rounded-2xl p-5 border border-slate-100 bg-white"
                  style={{ boxShadow: '0 4px 16px rgba(0,0,0,.05)' }}>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-50">
                      <Bell className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-semibold ${CAT_COLORS[a.category] || CAT_COLORS.general}`}>{a.category}</span>
                        <span className="text-xs text-slate-400">{new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      </div>
                      <h3 className="font-semibold text-slate-900 text-sm leading-snug">{a.title}</h3>
                      <p className="text-slate-500 text-xs mt-1.5 leading-relaxed line-clamp-2">{a.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ───────────────────────────────────────── */}
      <section className="relative py-28 px-4 overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#1D4ED8 0%,#2563EB 40%,#7C3AED 100%)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.06) 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(255,255,255,.08),transparent 70%)', transform: 'translate(30%,-30%)' }} />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-xs font-bold tracking-widest uppercase mb-7 border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Seats Filling Fast
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
            Ready to Join Our Family?
          </h2>
          <p className="text-blue-100 mb-10 text-base leading-relaxed max-w-xl mx-auto">
            Admissions for 2025–26 are open. Take the first step toward a future built on excellence, values, and ambition.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/contact"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-blue-900 transition-all duration-300 hover:scale-105 hover:shadow-xl"
              style={{ background: 'linear-gradient(135deg,#FCD34D,#F59E0B)', boxShadow: '0 8px 32px rgba(245,158,11,.4)' }}>
              Apply Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/about"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white border border-white/30 hover:bg-white/10 transition-all duration-300">
              Learn More <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
