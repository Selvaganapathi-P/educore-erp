const IMG = {
  hero:     'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1800&q=85&fit=crop',
  history:  'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=900&q=85&fit=crop',
  vision:   'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=900&q=85&fit=crop',
  cultural: 'https://images.unsplash.com/photo-1729951847727-db1dc342ee61?w=900&q=85&fit=crop',
};

export default function AboutPage() {
  return (
    <div className="text-slate-900 bg-white overflow-x-hidden">
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        .fu{animation:fadeUp .75s ease both}
        .float{animation:floatY 4s ease-in-out infinite}
        .card-h{transition:transform .25s,box-shadow .25s}
        .card-h:hover{transform:translateY(-5px);box-shadow:0 20px 40px rgba(29,78,216,.1)}
      `}</style>

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative min-h-[70vh] flex items-end pb-0 overflow-hidden pt-16">
        <img src={IMG.hero} alt="campus" className="absolute inset-0 w-full h-full object-cover object-center" />
        {/* Bright white gradient — bottom to top so text reads on bottom */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.55) 40%, rgba(255,255,255,0) 75%)' }} />
        {/* Left-side tint for top area visibility */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(239,246,255,0.45) 0%, transparent 50%)' }} />
        <div className="relative z-10 max-w-5xl mx-auto px-6 pb-16 w-full">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-blue-700 bg-blue-100 px-4 py-1.5 rounded-full mb-5 fu" style={{ animationDelay: '.1s' }}>Our Story</span>
          <h1 className="fu text-5xl md:text-6xl font-black leading-tight text-slate-900 mb-4" style={{ animationDelay: '.22s' }}>
            About{' '}
            <span style={{ background: 'linear-gradient(135deg,#1D4ED8,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Selva National School
            </span>
          </h1>
          <p className="fu text-slate-700 text-lg max-w-xl leading-relaxed" style={{ animationDelay: '.34s' }}>
            25 years of nurturing minds, shaping futures, and building a community where every child matters.
          </p>
        </div>
      </section>

      {/* ── HISTORY ──────────────────────────────────── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center">
          {/* Photo */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden" style={{ boxShadow: '0 24px 60px rgba(29,78,216,.14)' }}>
              <img src={IMG.history} alt="students" className="w-full aspect-[4/3] object-cover" />
            </div>
            {/* Year badge */}
            <div className="float absolute bottom-6 left-6 bg-white rounded-2xl shadow-xl px-6 py-4"
              style={{ boxShadow: '0 12px 32px rgba(29,78,216,.14)' }}>
              <p className="text-4xl font-black" style={{ background: 'linear-gradient(135deg,#1D4ED8,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>1999</p>
              <p className="text-slate-500 text-xs font-semibold mt-0.5">Year of Founding</p>
            </div>
          </div>
          {/* Text */}
          <div>
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-blue-700 bg-blue-100 px-4 py-1.5 rounded-full mb-5">History</span>
            <h2 className="text-3xl font-black text-slate-900 mb-5 leading-snug">A Legacy Built Over 25 Years</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Founded in 1999 with just 50 students and a bold vision to provide quality education in an inclusive environment,
              Selva National School has grown into a vibrant community of over 1,200 students from Classes 1 to 12.
            </p>
            <p className="text-slate-600 leading-relaxed mb-8">
              Over the decades, our alumni have excelled in medicine, engineering, arts, sports, and public service —
              carrying the values and curiosity that Selva National School instilled in them.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[['1,200+','Students enrolled'],['80+','Dedicated teachers'],['5,000+','Alumni worldwide'],['98%','Board pass rate']].map(([v,l])=>(
                <div key={l} className="rounded-2xl p-4 bg-blue-50">
                  <p className="text-2xl font-black text-blue-700">{v}</p>
                  <p className="text-slate-500 text-xs font-medium mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── VISION / MISSION / VALUES ─────────────────── */}
      <section className="py-24 px-4" style={{ background: '#F8FAFF' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-purple-700 bg-purple-100 px-4 py-1.5 rounded-full mb-4">Foundation</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">What Drives Us</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title:'Our Vision',  accent:'#1D4ED8', bg:'#EFF6FF', icon:'🎯',
                desc:'To be a centre of learning that inspires every student to reach their full potential and contribute positively to society.' },
              { title:'Our Mission', accent:'#7C3AED', bg:'#F5F3FF', icon:'🚀',
                desc:'Deliver quality education in a caring environment that fosters intellectual curiosity, ethical values, and creative thinking.' },
              { title:'Our Values',  accent:'#D97706', bg:'#FFFBEB', icon:'⭐',
                desc:'Integrity, compassion, excellence, teamwork, and respect for every individual form the bedrock of our school culture.' },
            ].map(({ title, accent, bg, icon, desc }) => (
              <div key={title} className="card-h rounded-3xl p-8 text-center border border-slate-100 bg-white"
                style={{ boxShadow: '0 4px 24px rgba(0,0,0,.05)' }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5" style={{ background: bg }}>
                  {icon}
                </div>
                <h3 className="font-black text-slate-900 text-lg mb-3">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                <div className="mt-5 w-10 h-1 rounded-full mx-auto" style={{ background: accent }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MILESTONES ───────────────────────────────── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-amber-600 bg-amber-100 px-4 py-1.5 rounded-full mb-4">Timeline</span>
            <h2 className="text-3xl font-black text-slate-900">Our Journey</h2>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 hidden md:block"
              style={{ background: 'linear-gradient(to bottom,transparent,#BFDBFE,transparent)' }} />
            <div className="space-y-8">
              {[
                { year:'1999', event:'School founded with 50 students and 8 teachers in Anna Nagar, Chennai.', side:'left',  c:'#1D4ED8', bg:'#EFF6FF' },
                { year:'2005', event:'Expanded to Class 12. Science and Commerce streams introduced.',          side:'right', c:'#7C3AED', bg:'#F5F3FF' },
                { year:'2010', event:'New sports complex and science laboratories inaugurated.',                side:'left',  c:'#059669', bg:'#ECFDF5' },
                { year:'2015', event:'Smart classrooms installed in all 36 rooms. Computer lab upgraded.',     side:'right', c:'#D97706', bg:'#FFFBEB' },
                { year:'2020', event:'Successfully transitioned to hybrid learning during pandemic — zero dropout rate.', side:'left', c:'#DB2777', bg:'#FDF2F8' },
                { year:'2024', event:'100% board pass rate. 1,200+ students. 5,000+ proud alumni worldwide.', side:'right', c:'#0284C7', bg:'#E0F2FE' },
              ].map(({ year, event, side, c, bg }) => (
                <div key={year} className={`md:flex md:items-center gap-8 ${side==='right'?'md:flex-row-reverse':''}`}>
                  <div className={`md:w-1/2 ${side==='right'?'md:text-left':'md:text-right'}`}>
                    <div className="card-h inline-block rounded-2xl px-6 py-4 border border-slate-100 bg-white"
                      style={{ boxShadow: '0 4px 16px rgba(0,0,0,.05)' }}>
                      <p className="font-black text-lg mb-1" style={{ color: c }}>{year}</p>
                      <p className="text-slate-600 text-sm leading-relaxed">{event}</p>
                    </div>
                  </div>
                  <div className="hidden md:flex w-4 h-4 rounded-full flex-shrink-0 mx-auto items-center justify-center border-2 border-white"
                    style={{ background: c, boxShadow: `0 0 0 4px ${bg}` }} />
                  <div className="md:w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── LEADERSHIP ───────────────────────────────── */}
      <section className="py-24 px-4" style={{ background: '#F8FAFF' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-emerald-700 bg-emerald-100 px-4 py-1.5 rounded-full mb-4">Team</span>
            <h2 className="text-3xl font-black text-slate-900 mb-3">Our Leadership</h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto">Experienced educators committed to excellence and the holistic growth of every student.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { name:'Dr. Selvaraj Murugan', role:'Principal',       qual:'M.Ed., Ph.D · 22 yrs', grad:'from-blue-600 to-violet-600',   bg:'#EFF6FF' },
              { name:'Mrs. Kavitha Rajan',  role:'Vice Principal',   qual:'M.Sc., B.Ed · 18 yrs', grad:'from-emerald-600 to-teal-600',  bg:'#ECFDF5' },
              { name:'Mr. Arjun Sharma',    role:'Head of Science',  qual:'M.Sc. Physics · 15 yrs',grad:'from-orange-500 to-amber-500', bg:'#FFFBEB' },
              { name:'Ms. Priya Nair',      role:'Head of Arts',     qual:'M.A. Fine Arts · 12 yrs',grad:'from-pink-500 to-rose-500',  bg:'#FDF2F8' },
            ].map(({ name, role, qual, grad, bg }) => (
              <div key={name} className="card-h rounded-3xl p-6 text-center bg-white border border-slate-100"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,.05)' }}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white mx-auto mb-4 bg-gradient-to-br ${grad}`}>
                  {name[0]}
                </div>
                <p className="font-bold text-slate-900 text-sm">{name}</p>
                <p className="text-blue-600 text-xs font-semibold mt-1">{role}</p>
                <p className="text-slate-400 text-xs mt-1.5">{qual}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────── */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(135deg,#1D4ED8,#2563EB,#7C3AED)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Be Part of Our Growing Story</h2>
          <p className="text-blue-100 mb-8 text-base max-w-lg mx-auto">Admissions for 2025–26 are open. Come visit us or get in touch today.</p>
          <a href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-blue-900 hover:scale-105 transition-transform"
            style={{ background: 'linear-gradient(135deg,#FCD34D,#F59E0B)', boxShadow: '0 8px 32px rgba(245,158,11,.4)' }}>
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
}
