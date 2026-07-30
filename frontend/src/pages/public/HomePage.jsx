import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bell, BookOpen, Users, Award, Calendar, Shield, Zap, GraduationCap, ChevronRight } from 'lucide-react';
import api from '../../lib/axios';

const IMG = {
  hero:       'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1800&q=85&fit=crop',
  classroom:  'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1600&q=80&fit=crop',
  students:   'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1600&q=80&fit=crop',
  sports:     'https://images.unsplash.com/photo-1556863402-b5d84ed0b6d5?w=1600&q=80&fit=crop',
  lab:        'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=1600&q=80&fit=crop',
  library:    'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1600&q=80&fit=crop',
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
          cur = Math.min(cur + n / 112, n);
          setVal(Math.floor(cur));
          if (cur >= n) clearInterval(t);
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref} style={{ fontVariantNumeric: 'tabular-nums' }}>{val.toLocaleString()}{suffix}</span>;
}

const CAT_COLORS = {
  general: 'bg-slate-700/60 text-slate-300',
  exam:    'bg-blue-900/60 text-blue-300',
  event:   'bg-purple-900/60 text-purple-300',
  holiday: 'bg-emerald-900/60 text-emerald-300',
  result:  'bg-amber-900/60 text-amber-300',
};

export default function HomePage() {
  const [announcements, setAnnouncements] = useState([]);
  useEffect(() => {
    api.get('/public/announcements?limit=4').then(r => setAnnouncements(r.data.data)).catch(() => {});
  }, []);

  return (
    <div className="text-white">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        .fu1{animation:fadeUp .8s ease both .1s}
        .fu2{animation:fadeUp .8s ease both .28s}
        .fu3{animation:fadeUp .8s ease both .45s}
        .fu4{animation:fadeUp .8s ease both .62s}
      `}</style>

      {/* ══════════════════════════════════
          HERO — full-screen campus photo
      ══════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background photo */}
        <img src={IMG.hero} alt="Selva National School campus" className="absolute inset-0 w-full h-full object-cover object-center" />
        {/* Dark overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(5,10,25,0.62) 0%, rgba(5,10,25,0.78) 60%, rgba(5,10,25,0.95) 100%)' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center pt-20 pb-16">
          <div className="fu1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-300 text-xs font-semibold tracking-widest uppercase mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
            Admissions Open 2025–26
          </div>

          <h1 className="fu2 text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            <span style={{ background: 'linear-gradient(135deg,#fff 0%,#cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Selva National
            </span>
            <br />
            <span style={{ background: 'linear-gradient(135deg,#F59E0B 0%,#FBBF24 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              School
            </span>
          </h1>

          <p className="fu3 text-slate-300 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            Nurturing curious minds and compassionate leaders for over 25 years.
            Where every student is known, valued, and inspired to excel.
          </p>

          <div className="fu4 flex flex-wrap gap-3 justify-center">
            <Link to="/contact"
              className="group flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-300 hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#1D4ED8,#2563EB)', boxShadow: '0 0 32px rgba(29,78,216,0.5)' }}>
              Apply for Admission <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/about"
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-white border border-white/20 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
              Our Story <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Quick stats pills */}
          <div className="fu4 flex flex-wrap justify-center gap-3 mt-14">
            {[
              { label: 'Students', value: '1,200+', color: 'text-sky-300' },
              { label: 'Pass Rate', value: '98%',   color: 'text-emerald-300' },
              { label: 'Teachers', value: '80+',    color: 'text-purple-300' },
              { label: 'Awards',   value: '50+',    color: 'text-amber-300' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/15 backdrop-blur-sm text-sm" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <span className={`font-bold ${color}`}>{value}</span>
                <span className="text-white/50">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-50">
          <span className="text-white text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white to-transparent" />
        </div>
      </section>

      {/* ══════════════════════════════════
          STATS — dark solid
      ══════════════════════════════════ */}
      <section className="py-16 px-4 bg-[#080C17]" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Years of Excellence', end: '25',   suffix: '+', icon: Award },
            { label: 'Active Students',      end: '1200', suffix: '+', icon: Users },
            { label: 'Classrooms',           end: '36',               icon: BookOpen },
            { label: 'Alumni Worldwide',     end: '5000', suffix: '+', icon: GraduationCap },
          ].map(({ label, end, suffix = '', icon: Icon }) => (
            <div key={label} className="text-center">
              <Icon className="w-5 h-5 text-amber-400 mx-auto mb-3 opacity-80" />
              <p className="text-4xl font-black text-white mb-1"><Counter end={end} suffix={suffix} /></p>
              <p className="text-slate-500 text-xs uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════
          WHY US — classroom photo bg
      ══════════════════════════════════ */}
      <section className="relative py-28 px-4 overflow-hidden">
        <img src={IMG.classroom} alt="classroom" className="absolute inset-0 w-full h-full object-cover object-center" />
        <div className="absolute inset-0" style={{ background: 'rgba(5,10,25,0.88)' }} />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold tracking-widest uppercase text-amber-400">Why Selva National</span>
            <h2 className="text-3xl md:text-4xl font-black mt-3 text-white leading-tight">
              Built for Every <span style={{ background: 'linear-gradient(90deg,#60A5FA,#818CF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Learner</span>
            </h2>
            <p className="text-slate-400 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
              A modern campus designed to ignite curiosity and shape holistic individuals ready for tomorrow's world.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: Shield,   color: '#60A5FA', title: 'Safe & Inclusive',     desc: 'Zero-tolerance environment where every student feels valued, safe, and free to grow.' },
              { icon: Zap,      color: '#FBBF24', title: 'Smart Classrooms',     desc: 'Interactive smart boards, high-speed internet, and digital tools in every classroom.' },
              { icon: Award,    color: '#34D399', title: 'Academic Excellence',  desc: 'Consistent top board results with dedicated faculty giving personalised attention.' },
              { icon: Users,    color: '#A78BFA', title: 'Holistic Development', desc: 'Sports, arts, music, and co-curricular activities to nurture every student\'s talent.' },
              { icon: BookOpen, color: '#38BDF8', title: 'World-Class Library',  desc: '10,000+ books, digital resources, and a dedicated reading space for all grades.' },
              { icon: Calendar, color: '#F472B6', title: 'Vibrant School Life',  desc: 'Annual day, cultural fests, science fair, and sports events that build lasting memories.' },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="group rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}18` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <h3 className="font-bold text-white text-base mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          PRINCIPAL'S MESSAGE — students bg
      ══════════════════════════════════ */}
      <section className="relative py-28 px-4 overflow-hidden">
        <img src={IMG.students} alt="students" className="absolute inset-0 w-full h-full object-cover object-top" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(5,10,35,0.92) 0%, rgba(10,20,50,0.88) 100%)' }} />
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, rgba(245,158,11,0.5))' }} />
            <span className="text-xs font-semibold tracking-widest uppercase text-amber-400 px-2">Principal's Message</span>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, rgba(245,158,11,0.5))' }} />
          </div>
          <div className="relative">
            <span className="absolute -top-8 -left-2 text-[130px] leading-none font-serif text-amber-400/10 select-none">"</span>
            <blockquote className="relative z-10 text-xl md:text-2xl font-light text-slate-200 leading-relaxed pl-6 border-l-2 border-amber-400/30">
              At Selva National School, we believe every child carries a universe of potential within them.
              Our dedicated faculty, state-of-the-art facilities, and a culture rooted in values
              create an environment where students are encouraged to{' '}
              <span className="text-white font-semibold">question, explore, and lead</span>.
            </blockquote>
          </div>
          <div className="flex items-center gap-4 mt-10 pl-6">
            <div className="w-14 h-14 rounded-full flex items-center justify-center font-black text-xl text-white shadow-lg"
              style={{ background: 'linear-gradient(135deg,#1D4ED8,#7C3AED)' }}>S</div>
            <div>
              <p className="font-bold text-white text-lg">Dr. Selvaraj Murugan</p>
              <p className="text-slate-400 text-sm">Principal, Selva National School · M.Ed, Ph.D</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          FACILITIES — sports photo bg
      ══════════════════════════════════ */}
      <section className="relative py-28 px-4 overflow-hidden">
        <img src={IMG.sports} alt="sports" className="absolute inset-0 w-full h-full object-cover object-center" />
        <div className="absolute inset-0" style={{ background: 'rgba(5,10,25,0.87)' }} />
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <span className="text-xs font-semibold tracking-widest uppercase text-emerald-400">Infrastructure</span>
          <h2 className="text-3xl md:text-4xl font-black mt-3 text-white mb-4">
            Campus Built to <span style={{ background: 'linear-gradient(90deg,#34D399,#10B981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Inspire</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mb-12 leading-relaxed">
            Every corner of Selva National School is designed to spark learning, creativity, and growth.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ['🔬','Science Labs','3 fully equipped'],['💻','Computer Lab','60 workstations'],
              ['📚','Library','10,000+ books'],['🏆','Sports Complex','Cricket & courts'],
              ['🎵','Music Room','All instruments'],['🎨','Art Studio','Dedicated space'],
              ['🚌','Transport','15 GPS routes'],['🏥','Medical Room','On-campus nurse'],
            ].map(([emoji, title, sub]) => (
              <div key={title} className="rounded-2xl p-5 text-left hover:scale-[1.03] transition-transform duration-300 cursor-default"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
                <span className="text-2xl block mb-2">{emoji}</span>
                <p className="font-semibold text-white text-sm">{title}</p>
                <p className="text-slate-400 text-xs mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
          <Link to="/facilities"
            className="inline-flex items-center gap-2 mt-10 px-6 py-3 rounded-xl font-semibold text-sm text-white border border-white/15 hover:border-emerald-400/40 hover:bg-emerald-400/5 transition-all duration-300 backdrop-blur-sm">
            View All Facilities <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════
          ANNOUNCEMENTS — library photo bg
      ══════════════════════════════════ */}
      {announcements.length > 0 && (
        <section className="relative py-24 px-4 overflow-hidden">
          <img src={IMG.library} alt="library" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'rgba(5,8,20,0.92)' }} />
          <div className="relative z-10 max-w-5xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase text-amber-400">Latest</span>
                <h2 className="text-2xl md:text-3xl font-black mt-2 text-white">Announcements</h2>
              </div>
              <Link to="/contact" className="text-xs text-slate-500 hover:text-white transition-colors flex items-center gap-1">
                Contact us <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {announcements.map((a, i) => (
                <div key={a._id} className="rounded-2xl p-5 hover:-translate-y-0.5 transition-transform duration-300"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/10">
                      <Bell className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${CAT_COLORS[a.category] || CAT_COLORS.general}`}>{a.category}</span>
                        <span className="text-xs text-slate-600">{new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      </div>
                      <h3 className="font-semibold text-white text-sm leading-snug">{a.title}</h3>
                      <p className="text-slate-400 text-xs mt-1.5 leading-relaxed line-clamp-2">{a.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════
          CTA — science lab photo bg
      ══════════════════════════════════ */}
      <section className="relative py-28 px-4 overflow-hidden">
        <img src={IMG.lab} alt="lab" className="absolute inset-0 w-full h-full object-cover object-center" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,rgba(29,78,216,0.82) 0%,rgba(124,58,237,0.78) 100%)' }} />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
            Ready to Join Our Family?
          </h2>
          <p className="text-blue-100 mb-10 text-base leading-relaxed max-w-xl mx-auto">
            Admissions for 2025–26 are open. Take the first step toward a future built on excellence, values, and ambition.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/contact"
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-blue-900 transition-all duration-300 hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#FCD34D,#F59E0B)', boxShadow: '0 8px 32px rgba(245,158,11,0.4)' }}>
              Apply Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/about"
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white border border-white/25 hover:bg-white/10 transition-all duration-300">
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
