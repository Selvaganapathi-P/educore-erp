import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bell, BookOpen, Users, Award, Calendar, Shield, Zap, GraduationCap, ChevronRight, Camera } from 'lucide-react';
import api from '../../lib/axios';

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

/* ─── School Scene SVG illustrations ───────────────────── */
function SceneBuilding() {
  return (
    <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Sky gradient */}
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#0D1B3E"/><stop offset="1" stopColor="#1a2d5a"/></linearGradient>
        <linearGradient id="bldg" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#1e3a6e"/><stop offset="1" stopColor="#152a52"/></linearGradient>
      </defs>
      <rect width="320" height="220" fill="url(#sky)"/>
      {/* Stars */}
      {[[20,15],[60,8],[100,20],[150,5],[200,18],[250,10],[290,22],[40,35],[180,30],[270,40]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="1" fill="white" opacity={0.5+Math.random()*0.5}/>
      ))}
      {/* Ground */}
      <rect x="0" y="185" width="320" height="35" fill="#0a1628"/>
      {/* Main building */}
      <rect x="60" y="90" width="200" height="100" fill="url(#bldg)" rx="2"/>
      {/* Roof */}
      <polygon points="50,90 160,45 270,90" fill="#1d3a70"/>
      {/* Flag pole */}
      <line x1="160" y1="45" x2="160" y2="20" stroke="#4a7cc7" strokeWidth="1.5"/>
      <rect x="160" y="20" width="20" height="13" fill="#f59e0b" rx="1"/>
      {/* Windows row 1 */}
      {[85,120,155,190,225].map(x=>(
        <rect key={x} x={x} y="105" width="22" height="18" rx="2" fill="#1e4d8c" opacity="0.9"/>
      ))}
      {/* Windows row 2 */}
      {[85,120,155,190,225].map(x=>(
        <rect key={x} x={x} y="135" width="22" height="18" rx="2" fill="#1e4d8c" opacity="0.9">
          <animate attributeName="opacity" values="0.9;0.4;0.9" dur={`${2+Math.random()*3}s`} repeatCount="indefinite"/>
        </rect>
      ))}
      {/* Door */}
      <rect x="142" y="160" width="36" height="30" rx="3" fill="#0f2347"/>
      <circle cx="175" cy="175" r="2" fill="#f59e0b"/>
      {/* Steps */}
      <rect x="130" y="188" width="60" height="5" rx="1" fill="#1a2d52"/>
      <rect x="120" y="191" width="80" height="4" rx="1" fill="#152444"/>
      {/* Trees */}
      <ellipse cx="25" cy="170" rx="18" ry="22" fill="#14532d" opacity="0.8"/>
      <rect x="23" y="188" width="4" height="10" fill="#713f12"/>
      <ellipse cx="295" cy="170" rx="18" ry="22" fill="#14532d" opacity="0.8"/>
      <rect x="293" y="188" width="4" height="10" fill="#713f12"/>
      {/* Sign */}
      <rect x="110" y="178" width="100" height="14" rx="2" fill="#1e3a6e"/>
      <text x="160" y="188" textAnchor="middle" fill="#93c5fd" fontSize="7" fontFamily="sans-serif" fontWeight="bold">EduCore School</text>
      {/* Lamp posts */}
      <line x1="50" y1="185" x2="50" y2="155" stroke="#374151" strokeWidth="2"/>
      <circle cx="50" cy="153" r="4" fill="#fbbf24" opacity="0.9"/>
      <line x1="270" y1="185" x2="270" y2="155" stroke="#374151" strokeWidth="2"/>
      <circle cx="270" cy="153" r="4" fill="#fbbf24" opacity="0.9"/>
    </svg>
  );
}

function SceneClassroom() {
  return (
    <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="280" height="180" fill="#0f1f3d"/>
      {/* Whiteboard */}
      <rect x="30" y="20" width="220" height="70" rx="4" fill="#1e3a5f"/>
      <rect x="35" y="25" width="210" height="60" rx="3" fill="#1a3354"/>
      {/* Board content - math formulas */}
      <text x="50" y="48" fill="#60a5fa" fontSize="11" fontFamily="monospace">E = mc²</text>
      <text x="140" y="48" fill="#34d399" fontSize="10" fontFamily="monospace">∑(n) = n(n+1)/2</text>
      <text x="60" y="68" fill="#a78bfa" fontSize="9" fontFamily="monospace">∫f(x)dx = F(x) + C</text>
      {/* Desks - row 1 */}
      {[30,100,170].map(x=>(
        <g key={x}>
          <rect x={x} y="115" width="55" height="30" rx="3" fill="#1e3a6e"/>
          <rect x={x+5} y="143" width="10" height="20" fill="#374151"/>
          <rect x={x+40} y="143" width="10" height="20" fill="#374151"/>
          {/* Student head */}
          <circle cx={x+27} cy="108" r="9" fill="#7c3aed" opacity="0.8"/>
          <rect x={x+18} y="117" width="18" height="8" rx="2" fill="#6d28d9" opacity="0.7"/>
        </g>
      ))}
      {/* Teacher area */}
      <rect x="100" y="100" width="80" height="12" rx="2" fill="#1e3a6e" opacity="0.5"/>
      <circle cx="140" cy="92" r="11" fill="#f59e0b" opacity="0.9"/>
      <rect x="129" y="103" width="22" height="10" rx="2" fill="#d97706" opacity="0.8"/>
    </svg>
  );
}

function SceneSports() {
  return (
    <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="field" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#14532d"/><stop offset="1" stopColor="#166534"/></linearGradient>
      </defs>
      <rect width="280" height="180" fill="#0c1a2e"/>
      {/* Field */}
      <rect x="0" y="100" width="280" height="80" fill="url(#field)"/>
      {/* Field lines */}
      <line x1="140" y1="100" x2="140" y2="180" stroke="white" strokeWidth="1" opacity="0.3"/>
      <ellipse cx="140" cy="140" rx="35" ry="25" stroke="white" strokeWidth="1" opacity="0.3" fill="none"/>
      {/* Goal posts left */}
      <line x1="15" y1="100" x2="15" y2="130" stroke="white" strokeWidth="2" opacity="0.7"/>
      <line x1="35" y1="100" x2="35" y2="130" stroke="white" strokeWidth="2" opacity="0.7"/>
      <line x1="15" y1="100" x2="35" y2="100" stroke="white" strokeWidth="2" opacity="0.7"/>
      {/* Goal posts right */}
      <line x1="245" y1="100" x2="245" y2="130" stroke="white" strokeWidth="2" opacity="0.7"/>
      <line x1="265" y1="100" x2="265" y2="130" stroke="white" strokeWidth="2" opacity="0.7"/>
      <line x1="245" y1="100" x2="265" y2="100" stroke="white" strokeWidth="2" opacity="0.7"/>
      {/* Players */}
      {[[80,115,'#3b82f6'],[140,105,'#ef4444'],[190,120,'#3b82f6'],[110,130,'#ef4444'],[170,135,'#3b82f6']].map(([x,y,c],i)=>(
        <g key={i}>
          <circle cx={x} cy={y-12} r="8" fill={c} opacity="0.9"/>
          <rect x={x-5} y={y-4} width="10" height="14" rx="2" fill={c} opacity="0.8"/>
        </g>
      ))}
      {/* Ball */}
      <circle cx="140" cy="118" r="6" fill="white" opacity="0.9"/>
      <path d="M137 115 L143 115 L144 121 L140 124 L136 121 Z" fill="#1f2937" opacity="0.4"/>
      {/* Sky */}
      <rect width="280" height="100" fill="#0c1a2e"/>
      {/* Floodlights */}
      {[40,240].map(x=>(
        <g key={x}>
          <line x1={x} y1="20" x2={x} y2="100" stroke="#374151" strokeWidth="3"/>
          <rect x={x-12} y="15" width="24" height="10" rx="2" fill="#fbbf24" opacity="0.9"/>
          <ellipse cx={x} cy="20" rx="30" ry="15" fill="#fbbf24" opacity="0.08"/>
        </g>
      ))}
      {/* Scoreboard */}
      <rect x="100" y="30" width="80" height="35" rx="4" fill="#1e3a6e"/>
      <text x="140" y="50" textAnchor="middle" fill="#f59e0b" fontSize="18" fontFamily="monospace" fontWeight="bold">2 : 1</text>
      <text x="140" y="62" textAnchor="middle" fill="#60a5fa" fontSize="7" fontFamily="sans-serif">SPORTS DAY</text>
    </svg>
  );
}

function SceneLibrary() {
  return (
    <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="280" height="180" fill="#1a1030"/>
      {/* Shelves */}
      {[0,1,2].map(row=>(
        <g key={row}>
          <rect x="10" y={20+row*45} width="260" height="6" rx="2" fill="#374151"/>
          {/* Books */}
          {Array.from({length:18}).map((_,i)=>{
            const colors=['#3b82f6','#ef4444','#10b981','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#84cc16','#f97316'];
            return <rect key={i} x={12+i*14} y={row*45+26-Math.floor(Math.random()*8+15)} width="10" height={Math.floor(Math.random()*8+15)} rx="1" fill={colors[i%colors.length]} opacity="0.85"/>;
          })}
        </g>
      ))}
      {/* Reading table */}
      <rect x="70" y="145" width="140" height="8" rx="3" fill="#374151"/>
      <rect x="90" y="153" width="8" height="27" fill="#374151"/>
      <rect x="182" y="153" width="8" height="27" fill="#374151"/>
      {/* Student reading */}
      <circle cx="140" cy="133" r="12" fill="#7c3aed"/>
      <rect x="105" y="138" width="70" height="12" rx="2" fill="#4c1d95" opacity="0.7"/>
      {/* Open book on table */}
      <rect x="110" y="140" width="28" height="18" rx="2" fill="#dbeafe"/>
      <line x1="124" y1="140" x2="124" y2="158" stroke="#93c5fd" strokeWidth="1"/>
      <rect x="142" y="140" width="28" height="18" rx="2" fill="#dbeafe"/>
      {/* Lamp */}
      <line x1="200" y1="153" x2="200" y2="125" stroke="#6b7280" strokeWidth="2"/>
      <ellipse cx="200" cy="122" rx="15" ry="8" fill="#fbbf24" opacity="0.7"/>
      <ellipse cx="200" cy="140" rx="30" ry="15" fill="#fbbf24" opacity="0.06"/>
      {/* Window */}
      <rect x="220" y="20" width="45" height="60" rx="3" fill="#1e3a6e" opacity="0.6"/>
      <line x1="242" y1="20" x2="242" y2="80" stroke="#4a7cc7" strokeWidth="1" opacity="0.5"/>
      <line x1="220" y1="50" x2="265" y2="50" stroke="#4a7cc7" strokeWidth="1" opacity="0.5"/>
      {/* Moon outside window */}
      <circle cx="245" cy="38" r="8" fill="#fbbf24" opacity="0.6"/>
      <circle cx="249" cy="35" r="6" fill="#1e3a6e" opacity="0.8"/>
    </svg>
  );
}

function SceneLab() {
  return (
    <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="280" height="180" fill="#0d1f3d"/>
      {/* Lab bench */}
      <rect x="20" y="110" width="240" height="12" rx="3" fill="#1e3a6e"/>
      {/* Microscope */}
      <rect x="40" y="85" width="10" height="30" rx="2" fill="#6b7280"/>
      <rect x="30" y="80" width="30" height="10" rx="2" fill="#9ca3af"/>
      <circle cx="45" cy="75" r="10" fill="#374151"/>
      <circle cx="45" cy="75" r="6" fill="#1e3a6e"/>
      <circle cx="45" cy="75" r="3" fill="#60a5fa" opacity="0.8"/>
      {/* Beakers */}
      <path d="M90 108 L95 90 L105 90 L110 108 Z" fill="#3b82f6" opacity="0.5"/>
      <rect x="90" y="88" width="20" height="5" rx="1" fill="#6b7280"/>
      <path d="M90 108 L95 90 L105 90 L110 108 Z" fill="none" stroke="#60a5fa" strokeWidth="1.5"/>
      {/* Bubbles in beaker */}
      <circle cx="97" cy="100" r="2" fill="#93c5fd" opacity="0.6"/>
      <circle cx="103" cy="95" r="1.5" fill="#93c5fd" opacity="0.6"/>
      {/* Flask */}
      <path d="M135 92 L135 108 L120 122 L155 122 L140 108 L140 92 Z" fill="#10b981" opacity="0.4"/>
      <rect x="132" y="89" width="11" height="5" rx="1" fill="#6b7280"/>
      <path d="M135 92 L135 108 L120 122 L155 122 L140 108 L140 92 Z" fill="none" stroke="#34d399" strokeWidth="1.5"/>
      {/* Bunsen burner */}
      <rect x="175" y="100" width="12" height="15" rx="2" fill="#374151"/>
      <ellipse cx="181" cy="99" rx="6" ry="3" fill="#f59e0b" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="181" cy="97" rx="3" ry="4" fill="#ef4444" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.2;0.6" dur="0.8s" repeatCount="indefinite"/>
      </ellipse>
      {/* Test tubes rack */}
      {[210,220,230].map((x,i)=>(
        <g key={x}>
          <rect x={x} y={90+i*2} width="8" height="25" rx="4" fill={['#3b82f6','#10b981','#f59e0b'][i]} opacity="0.6"/>
          <rect x={x} y={88} width="8" height="5" rx="1" fill="#6b7280"/>
        </g>
      ))}
      {/* Periodic table poster */}
      <rect x="20" y="15" width="100" height="60" rx="3" fill="#1e3a6e" opacity="0.7"/>
      <text x="70" y="30" textAnchor="middle" fill="#60a5fa" fontSize="7" fontFamily="monospace">PERIODIC TABLE</text>
      {[0,1,2,3].map(r=>
        [0,1,2,3,4].map(c=>(
          <rect key={`${r}${c}`} x={22+c*18} y={35+r*11} width="15" height="9" rx="1" fill={['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444'][c]} opacity="0.4"/>
        ))
      )}
      {/* Students */}
      <circle cx="70" cy="80" r="10" fill="#7c3aed" opacity="0.9"/>
      <rect x="60" y="90" width="20" height="22" rx="3" fill="#6d28d9" opacity="0.8"/>
      <circle cx="190" cy="80" r="10" fill="#0891b2" opacity="0.9"/>
      <rect x="180" y="90" width="20" height="22" rx="3" fill="#0e7490" opacity="0.8"/>
    </svg>
  );
}

function SceneAnnualDay() {
  return (
    <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="280" height="180" fill="#1a0a30"/>
      {/* Stage */}
      <rect x="0" y="120" width="280" height="60" fill="#2d1b4e"/>
      <rect x="0" y="115" width="280" height="10" rx="2" fill="#4c1d95"/>
      {/* Curtains */}
      <path d="M0 0 Q30 60 0 120" fill="#7c2d12" opacity="0.9"/>
      <path d="M280 0 Q250 60 280 120" fill="#7c2d12" opacity="0.9"/>
      {/* Spotlight beams */}
      <polygon points="60,0 20,120 100,120" fill="#fbbf24" opacity="0.08"/>
      <polygon points="140,0 110,120 170,120" fill="white" opacity="0.06"/>
      <polygon points="220,0 180,120 260,120" fill="#fbbf24" opacity="0.08"/>
      {/* Performers */}
      {[[90,95,'#ec4899'],[140,88,'#f59e0b'],[190,95,'#3b82f6']].map(([x,y,c],i)=>(
        <g key={i}>
          <circle cx={x} cy={y-15} r="11" fill={c} opacity="0.9"/>
          <path d={`M${x-10} ${y} Q${x} ${y+20} ${x+10} ${y}`} fill={c} opacity="0.8"/>
          {/* Arms up */}
          <line x1={x-10} y1={y-5} x2={x-22} y2={y-20} stroke={c} strokeWidth="3" strokeLinecap="round" opacity="0.8"/>
          <line x1={x+10} y1={y-5} x2={x+22} y2={y-20} stroke={c} strokeWidth="3" strokeLinecap="round" opacity="0.8"/>
        </g>
      ))}
      {/* Audience silhouettes */}
      {[20,50,80,110,145,175,205,235,260].map((x,i)=>(
        <g key={x}>
          <circle cx={x} cy={148} r={7+i%3} fill="#1e1b4b" opacity="0.9"/>
          <rect x={x-6} y={155} width="12" height="15" rx="2" fill="#1e1b4b" opacity="0.8"/>
        </g>
      ))}
      {/* Stars / confetti */}
      {[[50,20,'#f59e0b'],[100,15,'#ec4899'],[160,25,'#60a5fa'],[210,12,'#34d399'],[250,30,'#a78bfa']].map(([x,y,c],i)=>(
        <circle key={i} cx={x} cy={y} r="3" fill={c} opacity="0.8">
          <animate attributeName="cy" values={`${y};${y+8};${y}`} dur={`${1.5+i*0.3}s`} repeatCount="indefinite"/>
        </circle>
      ))}
      {/* Banner */}
      <rect x="60" y="5" width="160" height="22" rx="3" fill="#312e81"/>
      <text x="140" y="20" textAnchor="middle" fill="#fbbf24" fontSize="9" fontFamily="sans-serif" fontWeight="bold">ANNUAL DAY 2025</text>
    </svg>
  );
}

const CAT_COLORS = { general: 'bg-slate-700 text-slate-300', exam: 'bg-blue-900/60 text-blue-300', event: 'bg-purple-900/60 text-purple-300', holiday: 'bg-emerald-900/60 text-emerald-300', result: 'bg-amber-900/60 text-amber-300' };

export default function HomePage() {
  const [announcements, setAnnouncements] = useState([]);
  useEffect(() => {
    api.get('/public/announcements?limit=4').then(r => setAnnouncements(r.data.data)).catch(() => {});
  }, []);

  const photos = [
    { label: 'School Campus',    sub: 'Est. 2000',          scene: <SceneBuilding />,  span: 'md:col-span-2 md:row-span-2', accent: '#1D4ED8' },
    { label: 'Smart Classrooms', sub: 'Interactive Learning', scene: <SceneClassroom />, span: '',                            accent: '#7C3AED' },
    { label: 'Sports Day',       sub: 'Annual Tournament',   scene: <SceneSports />,    span: '',                            accent: '#059669' },
    { label: 'Science Lab',      sub: 'Hands-on Experiments',scene: <SceneLab />,       span: 'md:col-span-2',               accent: '#0891B2' },
    { label: 'Annual Day',       sub: 'Cultural Celebration', scene: <SceneAnnualDay />, span: '',                            accent: '#9333EA' },
    { label: 'Library',          sub: '10,000+ Books',        scene: <SceneLibrary />,   span: '',                            accent: '#B45309' },
  ];

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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[180px]">
            {photos.map(({ label, sub, scene, span, accent }) => (
              <div key={label}
                className={`photo-card relative rounded-2xl overflow-hidden cursor-pointer ${span}`}
                style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                {/* Scene */}
                <div className="photo-scene absolute inset-0">{scene}</div>
                {/* Gradient overlay always */}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)' }} />
                {/* Hover overlay */}
                <div className="photo-overlay absolute inset-0 opacity-0 transition-opacity duration-300" style={{ background: `rgba(${accent === '#1D4ED8' ? '29,78,216' : accent === '#7C3AED' ? '124,58,237' : accent === '#059669' ? '5,150,105' : accent === '#0891B2' ? '8,145,178' : accent === '#9333EA' ? '147,51,234' : '180,83,9'},0.15)` }} />
                {/* Label */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-bold text-white text-sm leading-tight">{label}</p>
                  <p className="text-white/60 text-xs mt-0.5">{sub}</p>
                </div>
                {/* Corner badge */}
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
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
