const facilities = [
  { emoji: '🔬', title: 'Science Laboratories', sub: 'Physics · Chemistry · Biology',
    desc: 'Three fully equipped labs with modern instruments and safety gear for hands-on scientific exploration.' },
  { emoji: '💻', title: 'Computer Lab',          sub: '60 workstations · High-speed fibre',
    desc: 'State-of-the-art computers with programming tools, creative software, and fast internet connectivity.' },
  { emoji: '📚', title: 'Library',               sub: '10,000+ books · Digital resources',
    desc: 'A quiet, well-curated library with reference books, fiction, periodicals, and e-learning access.' },
  { emoji: '🏆', title: 'Sports Complex',         sub: 'Cricket · Basketball · Volleyball',
    desc: 'A full-size cricket ground, two basketball courts, volleyball court, and indoor badminton arena.' },
  { emoji: '🎵', title: 'Music & Performing Arts',sub: 'Instruments · Stage · Studio',
    desc: 'Dedicated music room with all instruments, dance studio, and an auditorium for performances.' },
  { emoji: '🎨', title: 'Art Studio',             sub: 'Painting · Craft · Ceramics',
    desc: 'Natural-light studio with professional supplies for painting, pottery, and mixed-media art.' },
  { emoji: '🚌', title: 'Transport Network',      sub: '15 routes · GPS-tracked',
    desc: 'Safe, GPS-enabled buses covering major city routes with trained drivers and chaperones.' },
  { emoji: '🏥', title: 'Medical Room',           sub: 'On-campus nurse · First aid',
    desc: 'Fully equipped medical room staffed by a qualified nurse during school hours.' },
];

export default function FacilitiesPage() {
  return (
    <div className="bg-[#0A0F1E] text-white pt-16">

      {/* Hero */}
      <div className="relative py-24 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(rgba(99,143,255,0.12) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[260px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(52,211,153,0.15) 0%, transparent 70%)' }} />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="text-xs font-semibold tracking-widest uppercase text-emerald-400">Infrastructure</span>
          <h1 className="text-4xl md:text-5xl font-black mt-3 leading-tight">
            World-Class{' '}
            <span style={{
              background: 'linear-gradient(90deg,#34D399,#10B981)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Facilities</span>
          </h1>
          <p className="text-slate-400 mt-5 text-base leading-relaxed max-w-xl mx-auto">
            Every resource at Selva National School is designed to support learning, creativity, health, and holistic development.
          </p>
        </div>
      </div>

      {/* Grid */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-2 gap-4">
          {facilities.map(({ emoji, title, sub, desc }) => (
            <div key={title}
              className="group rounded-2xl p-6 flex gap-5 hover:-translate-y-0.5 transition-transform duration-300 relative overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at top left, rgba(52,211,153,0.05) 0%, transparent 60%)' }} />
              <span className="text-3xl flex-shrink-0">{emoji}</span>
              <div>
                <p className="font-bold text-white text-sm">{title}</p>
                <p className="text-emerald-400 text-xs mb-2">{sub}</p>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Smart classroom highlight */}
      <section className="py-16 px-4 bg-[#080C17]">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl p-10 relative overflow-hidden text-center"
            style={{ background: 'linear-gradient(135deg, rgba(29,78,216,0.15), rgba(52,211,153,0.08))', border: '1px solid rgba(29,78,216,0.2)' }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(rgba(99,143,255,0.07) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <span className="text-4xl block mb-4">🖥️</span>
            <h2 className="text-2xl font-black text-white mb-4 relative z-10">Smart Classrooms</h2>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed relative z-10">
              All 36 classrooms are equipped with interactive smart boards, HD projectors, and integrated audio systems.
              Teachers use digital lesson plans and real-time student assessment tools to make every class engaging, inclusive, and effective.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
