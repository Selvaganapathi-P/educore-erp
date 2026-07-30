const IMG = {
  hero:       'https://images.unsplash.com/photo-1680084521816-cc1ad0433ceb?w=1800&q=85&fit=crop',
  science:    'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=900&q=80&fit=crop',
  computer:   'https://images.unsplash.com/photo-1778489769184-45868633c527?w=900&q=80&fit=crop',
  library:    'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=900&q=80&fit=crop',
  sports:     'https://images.unsplash.com/photo-1556863402-b5d84ed0b6d5?w=900&q=80&fit=crop',
  music:      'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=900&q=80&fit=crop',
  art:        'https://images.unsplash.com/photo-1583238829785-7ba8a888bb72?w=900&q=80&fit=crop',
  smart:      'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1600&q=80&fit=crop',
  transport:  'https://images.unsplash.com/photo-1526749464606-83091e34a261?w=900&q=80&fit=crop',
};

const facilities = [
  {
    title: 'Science Laboratories',
    sub:   'Physics · Chemistry · Biology',
    desc:  'Three fully equipped labs with modern instruments and safety gear for hands-on scientific discovery.',
    img:   IMG.science,
    accent: '#60A5FA',
    badge:  '3 Labs',
  },
  {
    title: 'Computer Lab',
    sub:   '60 Workstations · High-speed fibre',
    desc:  'Dedicated computers with programming tools, creative software, and gigabit internet for every student.',
    img:   IMG.computer,
    accent: '#34D399',
    badge:  '60 PCs',
  },
  {
    title: 'Library',
    sub:   '10,000+ Books · Digital resources',
    desc:  'A curated collection of reference books, fiction, periodicals, and e-learning access in a quiet space.',
    img:   IMG.library,
    accent: '#FBBF24',
    badge:  '10k Books',
  },
  {
    title: 'Sports Complex',
    sub:   'Cricket · Basketball · Volleyball',
    desc:  'Full-size cricket ground, two basketball courts, volleyball court, and an indoor badminton arena.',
    img:   IMG.sports,
    accent: '#F87171',
    badge:  '5 Courts',
  },
  {
    title: 'Music & Performing Arts',
    sub:   'Instruments · Stage · Dance Studio',
    desc:  'Dedicated music room with all instruments, a dance studio, and a 400-seat auditorium for performances.',
    img:   IMG.music,
    accent: '#C084FC',
    badge:  '400-seat Hall',
  },
  {
    title: 'Art Studio',
    sub:   'Painting · Craft · Ceramics',
    desc:  'Natural-light studio stocked with professional supplies for painting, pottery, and mixed-media projects.',
    img:   IMG.art,
    accent: '#FB923C',
    badge:  'Open Studio',
  },
];

export default function FacilitiesPage() {
  return (
    <div className="text-white">

      {/* ══════════════════════════════
          HERO — school building photo
      ══════════════════════════════ */}
      <section className="relative min-h-[65vh] flex items-center justify-center overflow-hidden pt-16">
        <img src={IMG.hero} alt="Selva National School" className="absolute inset-0 w-full h-full object-cover object-center" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(5,10,25,0.28) 0%, rgba(5,10,25,0.58) 65%, rgba(5,10,25,1) 100%)' }} />
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto py-20">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-emerald-300 border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 rounded-full mb-6">Infrastructure</span>
          <h1 className="text-5xl md:text-6xl font-black leading-tight mb-5">
            World-Class{' '}
            <span style={{ background: 'linear-gradient(90deg,#34D399,#10B981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Facilities
            </span>
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-xl mx-auto">
            Every space at Selva National School is thoughtfully designed to inspire learning, creativity, and growth.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════
          STATS ROW
      ══════════════════════════════ */}
      <section className="py-10 px-4 bg-[#080C17]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ['36', 'Smart Classrooms'],
            ['3', 'Science Labs'],
            ['10,000+', 'Library Books'],
            ['15', 'Transport Routes'],
          ].map(([val, label]) => (
            <div key={label} className="rounded-2xl p-5 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-3xl font-black" style={{ background: 'linear-gradient(135deg,#34D399,#60A5FA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{val}</p>
              <p className="text-slate-500 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════
          PHOTO CARDS GRID
      ══════════════════════════════ */}
      <section className="py-20 px-4 bg-[#080C17]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold tracking-widest uppercase text-emerald-400">Our Spaces</span>
            <h2 className="text-3xl font-black text-white mt-3">Explore Our Facilities</h2>
            <p className="text-slate-500 text-sm mt-3 max-w-lg mx-auto">State-of-the-art resources that bring learning to life every day.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {facilities.map(({ title, sub, desc, img, accent, badge }) => (
              <div key={title}
                className="group relative rounded-3xl overflow-hidden cursor-pointer"
                style={{ minHeight: 320, border: `1px solid ${accent}20` }}>

                {/* Photo background */}
                <img src={img} alt={title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Base overlay — always dark enough to read text */}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(5,8,20,0.97) 0%, rgba(5,8,20,0.60) 50%, rgba(5,8,20,0.20) 100%)' }} />
                {/* Hover — richer color tint */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                  style={{ background: `linear-gradient(to top, ${accent}20 0%, transparent 60%)` }} />

                {/* Badge top-right */}
                <span className="absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}40` }}>
                  {badge}
                </span>

                {/* Content bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="font-black text-white text-lg leading-snug">{title}</p>
                  <p className="text-xs mt-1 mb-3" style={{ color: accent }}>{sub}</p>
                  <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all duration-300">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          SMART CLASSROOMS — classroom photo bg
      ══════════════════════════════ */}
      <section className="relative py-24 px-4 overflow-hidden">
        <img src={IMG.smart} alt="smart classroom" className="absolute inset-0 w-full h-full object-cover object-top" />
        <div className="absolute inset-0" style={{ background: 'rgba(5,10,25,0.68)' }} />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs font-semibold tracking-widest uppercase text-blue-400">Technology</span>
              <h2 className="text-3xl font-black text-white mt-3 mb-5 leading-snug">Smart Classrooms in Every Room</h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                All 36 classrooms are fitted with interactive smart boards, HD projectors, and integrated audio systems.
                Teachers use digital lesson plans and real-time assessment tools to make every lesson engaging and inclusive.
              </p>
              <p className="text-slate-400 leading-relaxed">
                Students interact directly with the board for quizzes, group exercises, and multimedia content —
                turning every class into an active learning experience.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { val: '36', label: 'Smart Boards',       accent: '#60A5FA' },
                { val: '4K',  label: 'HD Projectors',      accent: '#A78BFA' },
                { val: '1 Gbps', label: 'Campus Wi-Fi',   accent: '#34D399' },
                { val: '100%',  label: 'Digital Lessons',  accent: '#FBBF24' },
              ].map(({ val, label, accent }) => (
                <div key={label} className="rounded-2xl p-5 text-center" style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${accent}25` }}>
                  <p className="text-2xl font-black" style={{ color: accent }}>{val}</p>
                  <p className="text-slate-400 text-xs mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          TRANSPORT & MEDICAL — dark
      ══════════════════════════════ */}
      <section className="py-20 px-4 bg-[#080C17]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold tracking-widest uppercase text-amber-400">Support Services</span>
            <h2 className="text-3xl font-black text-white mt-3">Safety & Support</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">

            {/* Transport card with photo */}
            <div className="relative rounded-3xl overflow-hidden" style={{ minHeight: 220, border: '1px solid rgba(255,255,255,0.08)' }}>
              <img src={IMG.transport} alt="transport" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(5,10,25,0.90), rgba(5,10,25,0.75))' }} />
              <div className="relative z-10 p-8">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4" style={{ background: 'rgba(251,191,36,0.12)' }}>🚌</div>
                <p className="font-black text-white text-lg">Transport Network</p>
                <p className="text-amber-400 text-xs mb-3">15 routes · GPS-tracked · Chaperones</p>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Safe, GPS-enabled buses covering all major city routes with trained drivers and dedicated chaperones for every journey.
                </p>
              </div>
            </div>

            {/* Medical card */}
            <div className="relative rounded-3xl overflow-hidden p-8"
              style={{ minHeight: 220, background: 'linear-gradient(135deg, rgba(239,68,68,0.10), rgba(5,10,25,0.97))', border: '1px solid rgba(239,68,68,0.15)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4" style={{ background: 'rgba(239,68,68,0.12)' }}>🏥</div>
              <p className="font-black text-white text-lg">Medical Room</p>
              <p className="text-red-400 text-xs mb-3">On-campus nurse · First aid · Emergency protocol</p>
              <p className="text-slate-400 text-sm leading-relaxed">
                Fully equipped medical room staffed by a qualified nurse during all school hours. Emergency contacts and protocols updated annually.
              </p>
              <div className="mt-5 flex gap-2 flex-wrap">
                {['Nurse on duty', 'First-aid kits', 'Emergency protocol', 'Parent alerts'].map(tag => (
                  <span key={tag} className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(239,68,68,0.10)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.20)' }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
