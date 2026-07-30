const IMG = {
  hero:      'https://images.unsplash.com/photo-1759200135568-566eb9ecaa81?w=1800&q=85&fit=crop',
  history:   'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1400&q=80&fit=crop',
  vision:    'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1600&q=80&fit=crop',
  cultural:  'https://images.unsplash.com/photo-1729951847727-db1dc342ee61?w=1600&q=80&fit=crop',
};

export default function AboutPage() {
  return (
    <div className="text-white">

      {/* ══════════════════════════════
          HERO — aerial school campus
      ══════════════════════════════ */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-16">
        <img src={IMG.hero} alt="Selva National School campus" className="absolute inset-0 w-full h-full object-cover object-center" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(5,10,25,0.55) 0%, rgba(5,10,25,0.80) 70%, rgba(5,10,25,1) 100%)' }} />
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto py-20">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-blue-300 border border-blue-400/30 bg-blue-400/10 px-4 py-1.5 rounded-full mb-6">Our Story</span>
          <h1 className="text-5xl md:text-6xl font-black leading-tight mb-5">
            About{' '}
            <span style={{ background: 'linear-gradient(90deg,#60A5FA,#818CF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Selva National School
            </span>
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-xl mx-auto">
            25 years of nurturing minds, shaping futures, and building a community where every child matters.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════
          HISTORY — photo left, text right
      ══════════════════════════════ */}
      <section className="relative py-24 px-4 overflow-hidden bg-[#080C17]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">

          {/* Real photo */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ minHeight: 360 }}>
            <img src={IMG.history} alt="students" className="w-full h-full object-cover" style={{ minHeight: 360 }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,rgba(29,78,216,0.25),transparent)' }} />
            {/* Year badge */}
            <div className="absolute bottom-6 left-6 px-5 py-3 rounded-2xl" style={{ background: 'rgba(5,10,25,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-4xl font-black" style={{ background: 'linear-gradient(135deg,#60A5FA,#818CF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>1999</p>
              <p className="text-slate-400 text-xs mt-0.5">Year of Founding</p>
            </div>
          </div>

          {/* Text */}
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-blue-400">History</span>
            <h2 className="text-3xl font-black text-white mt-3 mb-6 leading-snug">A Legacy Built Over 25 Years</h2>
            <p className="text-slate-400 leading-relaxed mb-5">
              Founded in 1999 with just 50 students and a bold vision to provide quality education in an inclusive environment,
              Selva National School has grown into a vibrant community of over 1,200 students from Classes 1 to 12.
            </p>
            <p className="text-slate-400 leading-relaxed mb-8">
              Over the decades, our alumni have excelled in medicine, engineering, arts, sports, and public service —
              carrying the values and curiosity that Selva National School instilled in them.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[['1,200+','Students enrolled'],['80+','Dedicated teachers'],['5,000+','Alumni worldwide'],['98%','Board pass rate']].map(([v,l])=>(
                <div key={l} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-2xl font-black text-white">{v}</p>
                  <p className="text-slate-500 text-xs mt-1">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          VISION / MISSION / VALUES — classroom photo bg
      ══════════════════════════════ */}
      <section className="relative py-24 px-4 overflow-hidden">
        <img src={IMG.vision} alt="classroom" className="absolute inset-0 w-full h-full object-cover object-top" />
        <div className="absolute inset-0" style={{ background: 'rgba(5,10,25,0.90)' }} />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold tracking-widest uppercase text-purple-400">Foundation</span>
            <h2 className="text-3xl md:text-4xl font-black text-white mt-3">What Drives Us</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Our Vision', accent: '#60A5FA', icon: '🎯',
                desc: 'To be a centre of learning that inspires every student to reach their full potential and contribute positively to society.' },
              { title: 'Our Mission', accent: '#A78BFA', icon: '🚀',
                desc: 'Deliver quality education in a caring environment that fosters intellectual curiosity, ethical values, and creative thinking.' },
              { title: 'Our Values', accent: '#FBBF24', icon: '⭐',
                desc: 'Integrity, compassion, excellence, teamwork, and respect for every individual form the bedrock of our school culture.' },
            ].map(({ title, accent, icon, desc }) => (
              <div key={title} className="rounded-3xl p-8 text-center hover:-translate-y-1 transition-transform duration-300"
                style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${accent}30`, backdropFilter: 'blur(10px)' }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5"
                  style={{ background: `${accent}15` }}>
                  {icon}
                </div>
                <h3 className="font-black text-white text-lg mb-3">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          MILESTONES — dark
      ══════════════════════════════ */}
      <section className="py-20 px-4 bg-[#080C17]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold tracking-widest uppercase text-amber-400">Timeline</span>
            <h2 className="text-3xl font-black text-white mt-3">Our Journey</h2>
          </div>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 hidden md:block" style={{ background: 'linear-gradient(to bottom, transparent, rgba(96,165,250,0.4), transparent)' }} />
            <div className="space-y-8">
              {[
                { year: '1999', event: 'School founded with 50 students and 8 teachers in Anna Nagar, Chennai.', side: 'left' },
                { year: '2005', event: 'Expanded to Class 12. Science and Commerce streams introduced.', side: 'right' },
                { year: '2010', event: 'New sports complex and science laboratories inaugurated.', side: 'left' },
                { year: '2015', event: 'Smart classrooms installed in all 36 rooms. Computer lab upgraded to 60 workstations.', side: 'right' },
                { year: '2020', event: 'Successfully transitioned to hybrid learning during the pandemic — zero dropout rate.', side: 'left' },
                { year: '2024', event: '100% board pass rate. 1,200+ students. 5,000+ proud alumni worldwide.', side: 'right' },
              ].map(({ year, event, side }) => (
                <div key={year} className={`md:flex md:items-center gap-8 ${side === 'right' ? 'md:flex-row-reverse' : ''}`}>
                  <div className={`md:w-1/2 ${side === 'right' ? 'md:text-left' : 'md:text-right'}`}>
                    <div className="inline-block rounded-2xl px-5 py-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <p className="text-blue-400 font-black text-lg">{year}</p>
                      <p className="text-slate-300 text-sm mt-1 leading-relaxed">{event}</p>
                    </div>
                  </div>
                  {/* Dot */}
                  <div className="hidden md:flex w-4 h-4 rounded-full flex-shrink-0 mx-auto items-center justify-center" style={{ background: '#60A5FA', boxShadow: '0 0 12px rgba(96,165,250,0.6)' }} />
                  <div className="md:w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          LEADERSHIP — cultural photo bg
      ══════════════════════════════ */}
      <section className="relative py-24 px-4 overflow-hidden">
        <img src={IMG.cultural} alt="school event" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'rgba(5,8,22,0.91)' }} />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold tracking-widest uppercase text-emerald-400">Team</span>
            <h2 className="text-3xl font-black text-white mt-3">Our Leadership</h2>
            <p className="text-slate-400 text-sm mt-3 max-w-md mx-auto">Experienced educators committed to excellence and the holistic growth of every student.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Dr. Selvaraj Murugan', role: 'Principal',       qual: 'M.Ed., Ph.D · 22 yrs', color: 'from-blue-600 to-violet-600' },
              { name: 'Mrs. Kavitha Rajan',  role: 'Vice Principal',   qual: 'M.Sc., B.Ed · 18 yrs', color: 'from-emerald-600 to-teal-600' },
              { name: 'Mr. Arjun Sharma',    role: 'Head of Science',  qual: 'M.Sc. Physics · 15 yrs', color: 'from-orange-600 to-amber-500' },
              { name: 'Ms. Priya Nair',      role: 'Head of Arts',     qual: 'M.A. Fine Arts · 12 yrs', color: 'from-pink-600 to-rose-500' },
            ].map(({ name, role, qual, color }) => (
              <div key={name} className="rounded-3xl p-6 text-center hover:-translate-y-1 transition-transform duration-300"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white mx-auto mb-4 bg-gradient-to-br ${color}`}>
                  {name[0]}
                </div>
                <p className="font-bold text-white text-sm">{name}</p>
                <p className="text-blue-400 text-xs mt-1">{role}</p>
                <p className="text-slate-500 text-xs mt-2">{qual}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
