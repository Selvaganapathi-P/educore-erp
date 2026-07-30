import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Cartoon playground scene ─────────────────────────────────── */
function PlaygroundScene() {
  return (
    <div className="relative w-full overflow-hidden rounded-3xl" style={{ height: 300, background: 'linear-gradient(to bottom, #87CEEB 0%, #b8e4f9 55%, #c8f0a0 55%, #8BC34A 100%)' }}>
      <style>{`
        /* Sun */
        @keyframes sunPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        .sun { animation: sunPulse 3s ease-in-out infinite; }

        /* Clouds */
        @keyframes cloud1 { 0%{transform:translateX(-80px)} 100%{transform:translateX(420px)} }
        @keyframes cloud2 { 0%{transform:translateX(460px)} 100%{transform:translateX(-120px)} }
        .cloud1 { animation: cloud1 22s linear infinite; }
        .cloud2 { animation: cloud2 30s linear infinite; }

        /* Ball bounce */
        @keyframes ballBounce {
          0%,100%{transform:translateY(0) scaleY(1)}
          45%{transform:translateY(-54px) scaleY(1)}
          50%{transform:translateY(-54px) scaleY(1)}
          90%{transform:translateY(0) scaleY(0.75) scaleX(1.2)}
        }
        .ball { animation: ballBounce 1s cubic-bezier(.33,0,.66,1) infinite; transform-origin: bottom center; }

        /* Kid running left-right */
        @keyframes runRight {
          0%{transform:translateX(0)}
          48%{transform:translateX(0)}
          50%{transform:translateX(105px)}
          98%{transform:translateX(105px)}
          100%{transform:translateX(0)}
        }
        .runner { animation: runRight 2.4s linear infinite; }

        /* Leg swing for running kid */
        @keyframes legL { 0%,100%{transform:rotate(-28deg)} 50%{transform:rotate(28deg)} }
        @keyframes legR { 0%,100%{transform:rotate(28deg)} 50%{transform:rotate(-28deg)} }
        .leg-l { animation: legL .5s ease-in-out infinite; transform-origin: top center; }
        .leg-r { animation: legR .5s ease-in-out infinite; transform-origin: top center; }

        /* Arm swing */
        @keyframes armL { 0%,100%{transform:rotate(30deg)} 50%{transform:rotate(-30deg)} }
        @keyframes armR { 0%,100%{transform:rotate(-30deg)} 50%{transform:rotate(30deg)} }
        .arm-l { animation: armL .5s ease-in-out infinite; transform-origin: top center; }
        .arm-r { animation: armR .5s ease-in-out infinite; transform-origin: top center; }

        /* Skipping rope */
        @keyframes ropeSwing { 0%{d:path("M0 0 Q15 28 30 0")} 50%{d:path("M0 0 Q15 -28 30 0")} 100%{d:path("M0 0 Q15 28 30 0")} }
        @keyframes skipJump { 0%,100%,45%{transform:translateY(0)} 20%,25%{transform:translateY(-18px)} }
        .skipper { animation: skipJump .8s ease-in-out infinite; }
        @keyframes ropeAnim { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        .rope { animation: ropeAnim .8s linear infinite; transform-origin: 0 0; }

        /* Kite float */
        @keyframes kiteFloat {
          0%,100%{transform:translate(0,0) rotate(-8deg)}
          33%{transform:translate(10px,-14px) rotate(4deg)}
          66%{transform:translate(-6px,-8px) rotate(-12deg)}
        }
        .kite { animation: kiteFloat 3s ease-in-out infinite; }
        @keyframes kiteTailWave {
          0%,100%{transform:rotate(-12deg)}
          50%{transform:rotate(12deg)}
        }
        .kite-tail { animation: kiteTailWave 1.2s ease-in-out infinite; transform-origin: top center; }

        /* Bird flap */
        @keyframes birdFlap { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(-0.5)} }
        @keyframes birdFly { 0%{transform:translateX(0) translateY(0)} 100%{transform:translateX(350px) translateY(-20px)} }
        .bird { animation: birdFly 10s linear infinite; }
        .bird-wing { animation: birdFlap .4s ease-in-out infinite; transform-origin: center; }

        /* Seesaw */
        @keyframes seesaw { 0%,100%{transform:rotate(-15deg)} 50%{transform:rotate(15deg)} }
        .seesaw-board { animation: seesaw 2s ease-in-out infinite; transform-origin: center; }
        @keyframes seesawKidLeft { 0%,100%{transform:translateY(0)} 50%{transform:translateY(18px)} }
        @keyframes seesawKidRight { 0%,100%{transform:translateY(18px)} 50%{transform:translateY(0)} }
        .seesaw-kid-l { animation: seesawKidLeft 2s ease-in-out infinite; }
        .seesaw-kid-r { animation: seesawKidRight 2s ease-in-out infinite; }

        /* Swing */
        @keyframes swingKid { 0%,100%{transform:rotate(-30deg)} 50%{transform:rotate(30deg)} }
        .swing-rope { animation: swingKid 2s ease-in-out infinite; transform-origin: top center; }
      `}</style>

      {/* Sun */}
      <g className="sun" style={{ position: 'absolute' }}>
        <svg className="sun" style={{ position: 'absolute', top: 12, right: 40, width: 52, height: 52 }} viewBox="0 0 52 52">
          {[0,45,90,135,180,225,270,315].map(a => (
            <line key={a} x1="26" y1="26" x2={26 + 22 * Math.cos(a * Math.PI/180)} y2={26 + 22 * Math.sin(a * Math.PI/180)} stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round" />
          ))}
          <circle cx="26" cy="26" r="13" fill="#FFD700" />
        </svg>
      </g>

      {/* Clouds */}
      <svg className="cloud1" style={{ position: 'absolute', top: 20, left: 0, width: 90, height: 40 }} viewBox="0 0 90 40">
        <ellipse cx="45" cy="30" rx="35" ry="14" fill="white" opacity="0.9" />
        <ellipse cx="30" cy="24" rx="22" ry="16" fill="white" opacity="0.9" />
        <ellipse cx="58" cy="22" rx="18" ry="14" fill="white" opacity="0.9" />
      </svg>
      <svg className="cloud2" style={{ position: 'absolute', top: 40, left: 0, width: 70, height: 32 }} viewBox="0 0 70 32">
        <ellipse cx="35" cy="24" rx="28" ry="11" fill="white" opacity="0.8" />
        <ellipse cx="22" cy="18" rx="18" ry="13" fill="white" opacity="0.8" />
        <ellipse cx="48" cy="17" rx="14" ry="12" fill="white" opacity="0.8" />
      </svg>

      {/* Birds */}
      <svg className="bird" style={{ position: 'absolute', top: 55, left: 20, width: 24, height: 12 }} viewBox="0 0 24 12">
        <path className="bird-wing" d="M12 6 Q6 0 0 4" stroke="#334155" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path className="bird-wing" d="M12 6 Q18 0 24 4" stroke="#334155" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>

      {/* School building background */}
      <svg style={{ position: 'absolute', bottom: 80, left: 16, width: 100, height: 90 }} viewBox="0 0 100 90">
        <rect x="5" y="30" width="90" height="60" fill="#F97316" rx="3" />
        <rect x="10" y="20" width="80" height="20" fill="#EA580C" rx="2" />
        <rect x="35" y="15" width="30" height="10" fill="#C2410C" rx="2" />
        {/* Flag */}
        <line x1="50" y1="0" x2="50" y2="16" stroke="#92400E" strokeWidth="1.5" />
        <polygon points="50,0 62,5 50,10" fill="#EF4444" />
        {/* Windows */}
        {[20,55,75].map(x => <rect key={x} x={x} y="36" width="12" height="12" fill="#BAE6FD" rx="2" stroke="#7DD3FC" strokeWidth="1" />)}
        {/* Door */}
        <rect x="42" y="60" width="16" height="30" fill="#92400E" rx="3" />
        <circle cx="55" cy="76" r="1.5" fill="#FCD34D" />
      </svg>

      {/* Tree left */}
      <svg style={{ position: 'absolute', bottom: 80, left: 120, width: 44, height: 70 }} viewBox="0 0 44 70">
        <rect x="18" y="42" width="8" height="28" fill="#92400E" />
        <ellipse cx="22" cy="30" rx="20" ry="24" fill="#16A34A" />
        <ellipse cx="14" cy="38" rx="14" ry="16" fill="#15803D" />
        <ellipse cx="30" cy="36" rx="14" ry="16" fill="#166534" />
      </svg>

      {/* Tree right */}
      <svg style={{ position: 'absolute', bottom: 80, right: 100, width: 38, height: 60 }} viewBox="0 0 38 60">
        <rect x="15" y="36" width="7" height="24" fill="#92400E" />
        <ellipse cx="19" cy="26" rx="17" ry="20" fill="#22C55E" />
        <ellipse cx="10" cy="33" rx="12" ry="14" fill="#16A34A" />
        <ellipse cx="27" cy="31" rx="12" ry="14" fill="#15803D" />
      </svg>

      {/* ── RUNNER with ball ── */}
      <div className="runner" style={{ position: 'absolute', bottom: 82, left: 190 }}>
        <svg width="28" height="58" viewBox="0 0 28 58">
          {/* Head */}
          <circle cx="14" cy="8" r="7" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
          {/* Eyes */}
          <circle cx="11" cy="7" r="1.2" fill="#1E293B" /><circle cx="17" cy="7" r="1.2" fill="#1E293B" />
          {/* Smile */}
          <path d="M11 10 Q14 13 17 10" stroke="#1E293B" strokeWidth="1" fill="none" strokeLinecap="round" />
          {/* Hair */}
          <path d="M7 6 Q14 0 21 6" stroke="#92400E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Shirt */}
          <rect x="7" y="15" width="14" height="16" rx="3" fill="#3B82F6" />
          {/* Left arm */}
          <rect className="arm-l" x="12" y="15" width="4" height="14" rx="2" fill="#FBBF24" style={{ transformOrigin: '14px 15px' }} />
          {/* Right arm */}
          <rect className="arm-r" x="12" y="15" width="4" height="14" rx="2" fill="#FBBF24" style={{ transformOrigin: '14px 15px' }} />
          {/* Shorts */}
          <rect x="8" y="30" width="12" height="9" rx="2" fill="#1D4ED8" />
          {/* Left leg */}
          <rect className="leg-l" x="7" y="38" width="5" height="16" rx="2.5" fill="#FBBF24" style={{ transformOrigin: '9.5px 38px' }} />
          {/* Right leg */}
          <rect className="leg-r" x="16" y="38" width="5" height="16" rx="2.5" fill="#FBBF24" style={{ transformOrigin: '18.5px 38px' }} />
          {/* Shoes */}
          <ellipse cx="9.5" cy="54" rx="5" ry="3" fill="#EF4444" />
          <ellipse cx="18.5" cy="54" rx="5" ry="3" fill="#EF4444" />
        </svg>
        {/* Ball above runner */}
        <div className="ball" style={{ position: 'absolute', top: -18, left: 8 }}>
          <svg width="14" height="14" viewBox="0 0 14 14">
            <circle cx="7" cy="7" r="7" fill="#F97316" />
            <path d="M2 7 Q7 3 12 7" stroke="white" strokeWidth="1" fill="none" />
            <path d="M2 7 Q7 11 12 7" stroke="white" strokeWidth="1" fill="none" />
          </svg>
        </div>
      </div>

      {/* ── SKIPPER ── */}
      <div className="skipper" style={{ position: 'absolute', bottom: 82, left: 270 }}>
        <svg width="26" height="56" viewBox="0 0 26 56">
          <circle cx="13" cy="8" r="7" fill="#FCA5A5" stroke="#F87171" strokeWidth="1" />
          <circle cx="10" cy="7" r="1.2" fill="#1E293B" /><circle cx="16" cy="7" r="1.2" fill="#1E293B" />
          <path d="M10 10 Q13 13 16 10" stroke="#1E293B" strokeWidth="1" fill="none" strokeLinecap="round" />
          {/* Pigtails */}
          <path d="M6 3 Q2 -3 4 -8" stroke="#92400E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M20 3 Q24 -3 22 -8" stroke="#92400E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="4" cy="-8" r="2.5" fill="#EC4899" />
          <circle cx="22" cy="-8" r="2.5" fill="#EC4899" />
          {/* Dress */}
          <path d="M6 14 L6 30 Q13 36 20 30 L20 14 Z" fill="#EC4899" />
          <rect x="5" y="14" width="16" height="5" rx="2" fill="#DB2777" />
          {/* Arms out */}
          <line x1="6" y1="18" x2="-2" y2="26" stroke="#FCA5A5" strokeWidth="4" strokeLinecap="round" />
          <line x1="20" y1="18" x2="28" y2="26" stroke="#FCA5A5" strokeWidth="4" strokeLinecap="round" />
          {/* Legs */}
          <line x1="9" y1="30" x2="7" y2="46" stroke="#FCA5A5" strokeWidth="5" strokeLinecap="round" />
          <line x1="17" y1="30" x2="19" y2="46" stroke="#FCA5A5" strokeWidth="5" strokeLinecap="round" />
          <ellipse cx="7" cy="48" rx="5" ry="3" fill="#7C3AED" />
          <ellipse cx="19" cy="48" rx="5" ry="3" fill="#7C3AED" />
        </svg>
        {/* Rope ends */}
        <svg style={{ position: 'absolute', top: 30, left: -8, width: 42, height: 28 }} viewBox="0 0 42 28">
          <path className="rope" d="M0 0 Q21 28 42 0" stroke="#D97706" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      {/* ── KITE KID ── */}
      <div style={{ position: 'absolute', bottom: 82, right: 220 }}>
        <svg width="26" height="54" viewBox="0 0 26 54">
          <circle cx="13" cy="8" r="7" fill="#86EFAC" stroke="#4ADE80" strokeWidth="1" />
          <circle cx="10" cy="7" r="1.2" fill="#1E293B" /><circle cx="16" cy="7" r="1.2" fill="#1E293B" />
          <path d="M10 10 Q13 13 16 10" stroke="#1E293B" strokeWidth="1" fill="none" strokeLinecap="round" />
          <rect x="7" y="14" width="12" height="15" rx="3" fill="#F59E0B" />
          <rect x="8" y="28" width="10" height="9" rx="2" fill="#B45309" />
          <line x1="19" y1="18" x2="26" y2="10" stroke="#86EFAC" strokeWidth="4" strokeLinecap="round" />
          <line x1="7" y1="18" x2="0" y2="26" stroke="#86EFAC" strokeWidth="4" strokeLinecap="round" />
          <line x1="9" y1="36" x2="7" y2="50" stroke="#86EFAC" strokeWidth="5" strokeLinecap="round" />
          <line x1="17" y1="36" x2="19" y2="50" stroke="#86EFAC" strokeWidth="5" strokeLinecap="round" />
          <ellipse cx="7" cy="52" rx="5" ry="2.5" fill="#1D4ED8" />
          <ellipse cx="19" cy="52" rx="5" ry="2.5" fill="#1D4ED8" />
        </svg>
        {/* Kite string */}
        <svg style={{ position: 'absolute', bottom: 48, right: -10, width: 120, height: 120 }} viewBox="0 0 120 120">
          <path d="M0 120 Q50 60 90 10" stroke="#D97706" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
        </svg>
        {/* Kite */}
        <div className="kite" style={{ position: 'absolute', bottom: 130, right: 20 }}>
          <svg width="42" height="52" viewBox="0 0 42 52">
            <polygon points="21,0 42,21 21,46 0,21" fill="#EF4444" />
            <polygon points="21,0 42,21 21,23" fill="#FBBF24" />
            <polygon points="0,21 21,23 21,46" fill="#3B82F6" />
            <line x1="21" y1="0" x2="21" y2="46" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
            <line x1="0" y1="21" x2="42" y2="21" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
            {/* Tail */}
            <g className="kite-tail">
              <path d="M21 46 Q24 54 18 60 Q24 68 20 76" stroke="#8B5CF6" strokeWidth="2" fill="none" strokeLinecap="round" />
              <ellipse cx="18" cy="60" rx="4" ry="2.5" fill="#EC4899" transform="rotate(-20,18,60)" />
              <ellipse cx="20" cy="76" rx="4" ry="2.5" fill="#F97316" transform="rotate(10,20,76)" />
            </g>
          </svg>
        </div>
      </div>

      {/* ── SEESAW ── */}
      <div style={{ position: 'absolute', bottom: 80, right: 30 }}>
        <svg width="110" height="80" viewBox="0 0 110 80">
          {/* Post */}
          <rect x="50" y="40" width="10" height="30" fill="#92400E" rx="3" />
          <ellipse cx="55" cy="72" rx="20" ry="7" fill="#78350F" />
          {/* Board */}
          <g className="seesaw-board">
            <rect x="5" y="36" width="100" height="8" rx="4" fill="#D97706" />
          </g>
          {/* Kid Left */}
          <g className="seesaw-kid-l" style={{ transformOrigin: '18px 36px' }}>
            <circle cx="18" cy="20" r="7" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
            <circle cx="15" cy="19" r="1.2" fill="#1E293B" /><circle cx="21" cy="19" r="1.2" fill="#1E293B" />
            <path d="M15 22 Q18 25 21 22" stroke="#1E293B" strokeWidth="1" fill="none" />
            <rect x="12" y="27" width="12" height="12" rx="3" fill="#EC4899" />
          </g>
          {/* Kid Right */}
          <g className="seesaw-kid-r" style={{ transformOrigin: '92px 36px' }}>
            <circle cx="92" cy="20" r="7" fill="#86EFAC" stroke="#4ADE80" strokeWidth="1" />
            <circle cx="89" cy="19" r="1.2" fill="#1E293B" /><circle cx="95" cy="19" r="1.2" fill="#1E293B" />
            <path d="M89 22 Q92 25 95 22" stroke="#1E293B" strokeWidth="1" fill="none" />
            <rect x="86" y="27" width="12" height="12" rx="3" fill="#3B82F6" />
          </g>
        </svg>
      </div>

      {/* Ground detail — path / flowers */}
      <svg style={{ position: 'absolute', bottom: 78, left: 0, width: '100%', height: 10 }} viewBox="0 0 400 10" preserveAspectRatio="none">
        <path d="M0 10 Q100 0 200 8 Q300 0 400 10" fill="#65A30D" />
      </svg>
      {/* Small flowers */}
      {[[60,78],[155,76],[310,77],[370,79]].map(([x,y],i) => (
        <svg key={i} style={{ position: 'absolute', bottom: y, left: x, width: 12, height: 14 }} viewBox="0 0 12 14">
          <circle cx="6" cy="5" r="3" fill={['#F472B6','#FBBF24','#A78BFA','#34D399'][i]} />
          {[0,72,144,216,288].map(a => (
            <circle key={a} cx={6+3.5*Math.cos((a-90)*Math.PI/180)} cy={5+3.5*Math.sin((a-90)*Math.PI/180)} r="2" fill={['#FBCFE8','#FDE68A','#DDD6FE','#A7F3D0'][i]} />
          ))}
          <line x1="6" y1="8" x2="6" y2="14" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ))}

      {/* Label */}
      <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center' }}>
        <span style={{ fontSize: 10, color: 'rgba(0,0,0,0.35)', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600 }}>
          Selva National School — Playground
        </span>
      </div>
    </div>
  );
}

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

      {/* Cartoon Playground */}
      <section className="px-4 pb-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-4">
            <span className="text-xs font-semibold tracking-widest uppercase text-emerald-400">Our Happy Campus</span>
            <p className="text-slate-500 text-xs mt-1">Where every day is full of joy and learning</p>
          </div>
          <PlaygroundScene />
        </div>
      </section>

      <section className="py-12 pb-24 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">

          {/* Info */}
          <div>
            <h2 className="font-bold text-white text-lg mb-7">School Information</h2>
            <div className="space-y-5 mb-10">
              {[
                [MapPin, 'amber', '123 School Road, Anna Nagar\nChennai, Tamil Nadu – 600040'],
                [Phone, 'blue', '+91 98765 43210\n+91 44 2345 6789'],
                [Mail, 'purple', 'info@selvanationalschool.edu.in\nadmissions@selvanationalschool.edu.in'],
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
                or email <span className="text-blue-400">admissions@selvanationalschool.edu.in</span>
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
