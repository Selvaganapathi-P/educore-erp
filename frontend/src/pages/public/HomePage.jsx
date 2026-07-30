import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bell, BookOpen, Users, Award, Calendar, Shield, Zap, GraduationCap, ChevronRight, Camera } from 'lucide-react';
import api from '../../lib/axios';

const PHOTOS = [
  {
    label: 'Our Campus',
    sub: 'Est. 2000',
    url: 'https://images.unsplash.com/photo-1680084521816-cc1ad0433ceb?w=900&q=80&fit=crop',
    span: 'md:col-span-2 md:row-span-2',
  },
  {
    label: 'Smart Classrooms',
    sub: 'Interactive Learning',
    url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&q=80&fit=crop',
    span: '',
  },
  {
    label: 'Sports & Play',
    sub: 'Active Campus Life',
    url: 'https://images.unsplash.com/photo-1556863402-b5d84ed0b6d5?w=600&q=80&fit=crop',
    span: '',
  },
  {
    label: 'Science Labs',
    sub: 'Hands-on Experiments',
    url: 'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=900&q=80&fit=crop',
    span: 'md:col-span-2',
  },
  {
    label: 'Cultural Events',
    sub: 'Annual Celebrations',
    url: 'https://images.unsplash.com/photo-1759456629068-205f242feccd?w=600&q=80&fit=crop',
    span: '',
  },
  {
    label: 'Library',
    sub: '10,000+ Books',
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80&fit=crop',
    span: '',
  },
];

/* ─── Animated counter ─────────────────────────────────── */
function Counter({ end, suffix = '', prefix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const n = parseInt(end.replace(/\D/g, ''), 10);
        const dur = 1800, step = 16;
        const inc = n / (dur / step);
        let cur = 0;
        const t = setInterval(() => {
          cur = Math.min(cur + inc, n);
          setVal(Math.floor(cur));
          if (cur >= n) clearInterval(t);
        }, step);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref} style={{ fontVariantNumeric: 'tabular-nums' }}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

/* ─── Gradient border card ──────────────────────────────── */
function GCard({ icon: Icon, title, desc, color }) {
  const gradients = { blue: 'from-blue-500/30 to-indigo-500/30', amber: 'from-amber-500/30 to-orange-500/30', green: 'from-emerald-500/30 to-teal-500/30', purple: 'from-purple-500/30 to-violet-500/30', sky: 'from-sky-500/30 to-blue-400/30', rose: 'from-rose-500/30 to-pink-500/30' };
  const icon_bg   = { blue: 'bg-blue-500/10 text-blue-400', amber: 'bg-amber-500/10 text-amber-400', green: 'bg-emerald-500/10 text-emerald-400', purple: 'bg-purple-500/10 text-purple-400', sky: 'bg-sky-500/10 text-sky-400', rose: 'bg-rose-500/10 text-rose-400' };
  return (
    <div className="relative group rounded-2xl p-px overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)' }}>
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradients[color]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <div className="relative rounded-2xl bg-[#0D1424] p-6 h-full">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${icon_bg[color]}`}><Icon className="w-5 h-5" /></div>
        <h3 className="font-bold text-white text-base mb-2">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

const CAT_COLORS = { general: 'bg-slate-700 text-slate-300', exam: 'bg-blue-900/60 text-blue-300', event: 'bg-purple-900/60 text-purple-300', holiday: 'bg-emerald-900/60 text-emerald-300', result: 'bg-amber-900/60 text-amber-300' };

export default function HomePage() {
  const [announcements, setAnnouncements] = useState([]);
  useEffect(() => {
    api.get('/public/announcements?limit=4').then(r => setAnnouncements(r.data.data)).catch(() => {});
  }, []);


  return (
    <div className="bg-[#0A0F1E] text-white">

      <style>{`
        @keyframes orbFloat { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-30px) scale(1.04)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .fade-up-1{animation:fadeUp .7s ease both .1s}
        .fade-up-2{animation:fadeUp .7s ease both .25s}
        .fade-up-3{animation:fadeUp .7s ease both .4s}
        .fade-up-4{animation:fadeUp .7s ease both .55s}
        .photo-card:hover .photo-overlay{opacity:1}
        .photo-card:hover .photo-scene{transform:scale(1.04)}
        .photo-scene{transition:transform .5s ease}
      `}</style>

      {/* ══════════ HERO ══════════ */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden px-4 pt-16 pb-20">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(99,143,255,0.18) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-[-10%] left-[15%] w-[520px] h-[520px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(29,78,216,0.35) 0%, transparent 70%)', animation: 'orbFloat 9s ease-in-out infinite', filter: 'blur(1px)' }} />
        <div className="absolute bottom-[-5%] right-[10%] w-[420px] h-[420px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)', animation: 'orbFloat 12s ease-in-out infinite reverse', filter: 'blur(1px)' }} />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="fade-up-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-semibold tracking-wide uppercase mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block animate-pulse" />
            Admissions Open 2025–26
          </div>
          <h1 className="fade-up-2 text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            Where{' '}
            <span style={{ background: 'linear-gradient(135deg,#60A5FA 0%,#818CF8 50%,#A78BFA 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Curiosity</span>
            {' '}Meets<br />
            <span style={{ background: 'linear-gradient(135deg,#F59E0B 0%,#FBBF24 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Excellence</span>
          </h1>
          <p className="fade-up-3 text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            EduCore School has nurtured over 1,200 students across Classes 1–12 for 25 years — building thinkers, leaders, and compassionate human beings.
          </p>
          <div className="fade-up-4 flex flex-wrap gap-3 justify-center">
            <Link to="/contact" className="group flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-300" style={{ background: 'linear-gradient(135deg,#1D4ED8,#2563EB)', boxShadow: '0 0 24px rgba(29,78,216,0.45)' }}>
              Apply for Admission <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/about" className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-slate-300 border border-white/10 hover:border-white/25 hover:text-white hover:bg-white/5 transition-all duration-300">
              Explore School <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="fade-up-4 flex flex-wrap justify-center gap-3 mt-14">
            {[
              { label: 'Students', value: '1200+', color: 'text-sky-400' },
              { label: 'Pass Rate', value: '98%',  color: 'text-emerald-400' },
              { label: 'Teachers', value: '80+',   color: 'text-purple-400' },
              { label: 'Awards',   value: '50+',   color: 'text-amber-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/8 text-sm" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(8px)' }}>
                <span className={`font-bold ${color}`}>{value}</span>
                <span className="text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-32 pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent, #0A0F1E)' }} />
      </section>

      {/* ══════════ STATS BAR ══════════ */}
      <section className="py-16 px-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Years of Excellence', end: '25',   suffix: '+', icon: Award },
            { label: 'Active Students',      end: '1200', suffix: '+', icon: Users },
            { label: 'Classes Offered',      end: '36',               icon: BookOpen },
            { label: 'Alumni Worldwide',     end: '5000', suffix: '+', icon: GraduationCap },
          ].map(({ label, end, suffix = '', icon: Icon }) => (
            <div key={label} className="text-center">
              <Icon className="w-5 h-5 text-blue-400 mx-auto mb-3 opacity-70" />
              <p className="text-4xl font-black text-white mb-1"><Counter end={end} suffix={suffix} /></p>
              <p className="text-slate-500 text-xs uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ CAMPUS PHOTOS ══════════ */}
      <section className="py-24 px-4 bg-[#080C17]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-amber-400">
              <Camera className="w-3.5 h-3.5" /> Campus Life
            </span>
            <h2 className="text-3xl md:text-4xl font-black mt-3 text-white leading-tight">
              A Glimpse of{' '}
              <span style={{ background: 'linear-gradient(90deg,#F59E0B,#FBBF24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>EduCore</span>
            </h2>
            <p className="text-slate-400 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
              From smart classrooms to the sports field — every corner of our campus is built to inspire.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[200px]">
            {PHOTOS.map(({ label, sub, url, span }) => (
              <div key={label}
                className={`photo-card relative rounded-2xl overflow-hidden cursor-pointer ${span}`}
                style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                {/* Real photo */}
                <img
                  src={url}
                  alt={label}
                  className="photo-scene absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Dark gradient so text is readable */}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }} />
                {/* Hover tint */}
                <div className="photo-overlay absolute inset-0 opacity-0 transition-opacity duration-300" style={{ background: 'rgba(29,78,216,0.18)' }} />
                {/* Label */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-bold text-white text-sm leading-tight drop-shadow">{label}</p>
                  <p className="text-white/60 text-xs mt-0.5">{sub}</p>
                </div>
                {/* Camera badge */}
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}>
                  <Camera className="w-3 h-3 text-white/70" />
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/gallery" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-amber-400 border border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all duration-300">
              View Full Gallery <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════ FEATURES ══════════ */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold tracking-widest uppercase text-blue-400">Why EduCore</span>
            <h2 className="text-3xl md:text-4xl font-black mt-3 text-white leading-tight">
              Built for Every{' '}
              <span style={{ background: 'linear-gradient(90deg,#60A5FA,#818CF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Learner</span>
            </h2>
            <p className="text-slate-400 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
              A modern campus designed to ignite curiosity and shape holistic individuals ready for tomorrow's world.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <GCard icon={Shield}   color="blue"   title="Safe & Inclusive"     desc="A zero-tolerance policy ensures every student feels valued, safe, and free to be themselves." />
            <GCard icon={Zap}      color="amber"  title="Smart Classrooms"     desc="Interactive smart boards, high-speed internet, and digital tools in every classroom." />
            <GCard icon={Award}    color="green"  title="Academic Excellence"  desc="Consistent top board results with dedicated faculty providing personalised attention." />
            <GCard icon={Users}    color="purple" title="Holistic Development" desc="Sports, arts, music, and co-curricular activities to nurture every student's talents." />
            <GCard icon={BookOpen} color="sky"    title="World-Class Library"  desc="10,000+ books, digital resources, and a dedicated reading environment for all grades." />
            <GCard icon={Calendar} color="rose"   title="Vibrant School Life"  desc="Annual day, cultural festivals, science fair, and sports events that build lasting memories." />
          </div>
        </div>
      </section>

      {/* ══════════ PRINCIPAL'S MESSAGE ══════════ */}
      <section className="py-24 px-4" style={{ background: 'linear-gradient(135deg,#0F1E3D 0%,#0A0F1E 60%,#0F1A2E 100%)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-600/40" />
            <span className="text-xs font-semibold tracking-widest uppercase text-blue-400 px-2">Principal's Message</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-600/40" />
          </div>
          <div className="relative">
            <span className="absolute -top-6 -left-2 text-[120px] leading-none font-serif text-blue-600/15 select-none pointer-events-none">"</span>
            <blockquote className="relative z-10 text-xl md:text-2xl font-light text-slate-200 leading-relaxed pl-4">
              At EduCore School, we believe every child carries a universe of potential within them. Our dedicated faculty, state-of-the-art facilities, and a culture rooted in values create an environment where students are encouraged to{' '}
              <span className="text-white font-semibold">question, explore, and lead</span>.
            </blockquote>
          </div>
          <div className="flex items-center gap-4 mt-10 pl-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg text-white" style={{ background: 'linear-gradient(135deg,#1D4ED8,#7C3AED)' }}>P</div>
            <div>
              <p className="font-bold text-white">Dr. Priya Sharma</p>
              <p className="text-slate-500 text-sm">Principal, EduCore School · M.Ed, Ph.D</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ ANNOUNCEMENTS ══════════ */}
      {announcements.length > 0 && (
        <section className="py-24 px-4 bg-[#080C17]">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase text-amber-400">Latest</span>
                <h2 className="text-2xl md:text-3xl font-black mt-2 text-white">Announcements</h2>
              </div>
              <Link to="/contact" className="text-xs text-slate-500 hover:text-white transition-colors flex items-center gap-1">Contact us <ChevronRight className="w-3.5 h-3.5" /></Link>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {announcements.map((a, i) => (
                <div key={a._id} className="relative rounded-2xl p-5 group hover:-translate-y-0.5 transition-transform duration-300"
                  style={{ background: i%2===0 ? 'linear-gradient(135deg,rgba(29,78,216,0.08),rgba(29,78,216,0.03))' : 'linear-gradient(135deg,rgba(245,158,11,0.08),rgba(245,158,11,0.03))', border: `1px solid ${i%2===0 ? 'rgba(29,78,216,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${i%2===0 ? 'bg-blue-500/10' : 'bg-amber-500/10'}`}>
                      <Bell className={`w-4 h-4 ${i%2===0 ? 'text-blue-400' : 'text-amber-400'}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${CAT_COLORS[a.category]||CAT_COLORS.general}`}>{a.category}</span>
                        <span className="text-xs text-slate-600">{new Date(a.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
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

      {/* ══════════ FACILITIES ══════════ */}
      <section className="py-24 px-4 bg-[#0A0F1E]">
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-xs font-semibold tracking-widest uppercase text-emerald-400">Infrastructure</span>
          <h2 className="text-3xl md:text-4xl font-black mt-3 text-white mb-4">
            Campus Built to{' '}
            <span style={{ background: 'linear-gradient(90deg,#34D399,#10B981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Inspire</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mb-12 leading-relaxed">Every corner of EduCore School is designed to spark learning, creativity, and growth.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ['🔬','Science Labs','3 fully equipped'],['💻','Computer Lab','High-speed internet'],
              ['📚','Library','10,000+ books'],['🏆','Sports Complex','Cricket & courts'],
              ['🎵','Music Room','All instruments'],['🎨','Art Studio','Dedicated space'],
              ['🚌','Transport','15 routes'],['🏥','Medical Room','On-campus nurse'],
            ].map(([emoji,title,sub])=>(
              <div key={title} className="rounded-2xl p-4 text-left group hover:scale-[1.02] transition-transform duration-300" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-2xl block mb-2">{emoji}</span>
                <p className="font-semibold text-white text-sm">{title}</p>
                <p className="text-slate-500 text-xs mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
          <Link to="/facilities" className="inline-flex items-center gap-2 mt-10 px-6 py-3 rounded-xl font-semibold text-sm text-white border border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all duration-300">
            View All Facilities <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ══════════ CTA STRIP ══════════ */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg,#1D4ED8 0%,#7C3AED 50%,#1D4ED8 100%)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">Ready to Join Our Family?</h2>
          <p className="text-blue-200 mb-8 text-sm leading-relaxed max-w-xl mx-auto">Admissions for 2025–26 are open. Take the first step toward a future built on excellence, values, and ambition.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/contact" className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm text-blue-900 transition-all duration-300 hover:scale-105" style={{ background: 'linear-gradient(135deg,#FCD34D,#F59E0B)', boxShadow: '0 8px 32px rgba(245,158,11,0.4)' }}>
              Apply Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/about" className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-white border border-white/20 hover:bg-white/10 transition-all duration-300">
              Learn More
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
