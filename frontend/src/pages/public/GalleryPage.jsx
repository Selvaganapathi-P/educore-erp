const items = [
  { emoji: '🎭', label: 'Annual Day 2024',    sub: 'Performing Arts',  grad: 'from-violet-600/30 to-purple-600/20' },
  { emoji: '🔬', label: 'Science Fair',       sub: 'Innovation',       grad: 'from-blue-600/30 to-cyan-600/20' },
  { emoji: '🏆', label: 'Sports Day',         sub: 'Athletics',        grad: 'from-amber-600/30 to-orange-500/20' },
  { emoji: '🎨', label: 'Art Exhibition',     sub: 'Creative Arts',    grad: 'from-rose-600/30 to-pink-500/20' },
  { emoji: '🇮🇳', label: 'Republic Day',      sub: 'Celebrations',     grad: 'from-orange-600/30 to-green-600/20' },
  { emoji: '🎓', label: 'Graduation 2024',    sub: 'Achievements',     grad: 'from-indigo-600/30 to-blue-500/20' },
  { emoji: '💃', label: 'Cultural Fest',      sub: 'Diversity',        grad: 'from-pink-600/30 to-rose-500/20' },
  { emoji: '🌳', label: 'Tree Plantation',    sub: 'Eco Initiative',   grad: 'from-emerald-600/30 to-green-500/20' },
  { emoji: '📚', label: 'Library Week',       sub: 'Reading Drive',    grad: 'from-sky-600/30 to-blue-400/20' },
  { emoji: '🎵', label: 'Music Concert',      sub: 'Performing Arts',  grad: 'from-purple-600/30 to-violet-400/20' },
  { emoji: '🚀', label: 'STEM Workshop',      sub: 'Innovation',       grad: 'from-blue-600/30 to-indigo-400/20' },
  { emoji: '⚽', label: 'Inter-School Tourney',sub: 'Sports',          grad: 'from-green-600/30 to-emerald-400/20' },
];

export default function GalleryPage() {
  return (
    <div className="bg-[#0A0F1E] text-white pt-16">

      {/* Hero */}
      <div className="relative py-24 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(rgba(99,143,255,0.12) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[260px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.2) 0%, transparent 70%)' }} />
        <div className="relative z-10">
          <span className="text-xs font-semibold tracking-widest uppercase text-purple-400">Memories</span>
          <h1 className="text-4xl md:text-5xl font-black mt-3 leading-tight">
            Life at{' '}
            <span style={{
              background: 'linear-gradient(90deg,#A78BFA,#818CF8)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Selva National School</span>
          </h1>
          <p className="text-slate-400 mt-4 text-base max-w-xl mx-auto leading-relaxed">
            Glimpses of achievement, joy, and community — celebrating the vibrant life at Selva National School School.
          </p>
        </div>
      </div>

      {/* Masonry-style grid */}
      <section className="py-8 pb-24 px-4">
        <div className="max-w-5xl mx-auto columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {items.map(({ emoji, label, sub, grad }, i) => (
            <div
              key={label}
              className={`break-inside-avoid rounded-2xl bg-gradient-to-br ${grad} flex flex-col items-center justify-center cursor-pointer group hover:scale-[1.03] transition-transform duration-300 relative overflow-hidden`}
              style={{
                aspectRatio: i % 3 === 0 ? '3/4' : i % 5 === 0 ? '4/5' : '1/1',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'rgba(0,0,0,0.2)' }} />
              <span className="text-4xl mb-2 relative z-10">{emoji}</span>
              <p className="text-white font-semibold text-sm relative z-10 text-center px-3">{label}</p>
              <p className="text-white/50 text-xs mt-1 relative z-10">{sub}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-slate-600 text-xs mt-10">
          Follow us on social media for more photos and updates from school events.
        </p>
      </section>
    </div>
  );
}
