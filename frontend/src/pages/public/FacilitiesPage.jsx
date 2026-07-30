const IMG = {
  hero:      'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1800&q=85&fit=crop',
  science:   'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=900&q=85&fit=crop',
  computer:  'https://images.unsplash.com/photo-1778489769184-45868633c527?w=900&q=85&fit=crop',
  library:   'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=900&q=85&fit=crop',
  sports:    'https://images.unsplash.com/photo-1556863402-b5d84ed0b6d5?w=900&q=85&fit=crop',
  music:     'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=900&q=85&fit=crop',
  art:       'https://images.unsplash.com/photo-1583238829785-7ba8a888bb72?w=900&q=85&fit=crop',
  smart:     'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1200&q=85&fit=crop',
  transport: 'https://images.unsplash.com/photo-1526749464606-83091e34a261?w=900&q=85&fit=crop',
};

const facilities = [
  { title:'Science Laboratories', sub:'Physics · Chemistry · Biology',   desc:'Three fully equipped labs with modern instruments and safety gear for hands-on scientific discovery.', img:IMG.science,   accent:'#1D4ED8', bg:'#EFF6FF', badge:'3 Labs'      },
  { title:'Computer Lab',         sub:'60 Workstations · High-speed',    desc:'Dedicated computers with programming tools, creative software, and gigabit internet for every student.', img:IMG.computer,  accent:'#059669', bg:'#ECFDF5', badge:'60 PCs'     },
  { title:'Library',              sub:'10,000+ Books · Digital resources',desc:'A curated collection of reference books, fiction, periodicals, and e-learning access in a quiet space.', img:IMG.library,   accent:'#D97706', bg:'#FFFBEB', badge:'10k Books' },
  { title:'Sports Complex',       sub:'Cricket · Basketball · Volleyball',desc:'Full-size cricket ground, two basketball courts, volleyball court, and an indoor badminton arena.',    img:IMG.sports,    accent:'#DC2626', bg:'#FEF2F2', badge:'5 Courts'   },
  { title:'Music & Performing Arts',sub:'Instruments · Stage · Dance',   desc:'Dedicated music room with all instruments, a dance studio, and a 400-seat auditorium.',                img:IMG.music,     accent:'#7C3AED', bg:'#F5F3FF', badge:'400-seat'  },
  { title:'Art Studio',           sub:'Painting · Craft · Ceramics',     desc:'Natural-light studio stocked with professional supplies for painting, pottery, and mixed-media.',       img:IMG.art,       accent:'#EA580C', bg:'#FFF7ED', badge:'Open Studio'},
];

export default function FacilitiesPage() {
  return (
    <div className="text-slate-900 bg-white overflow-x-hidden">
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        .fu{animation:fadeUp .75s ease both}
        .float{animation:floatY 4s ease-in-out infinite}
        .fcard{transition:transform .3s,box-shadow .3s}
        .fcard:hover{transform:translateY(-8px)}
        .fcard:hover img{transform:scale(1.07)}
        .fcard img{transition:transform .5s}
      `}</style>

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative min-h-[65vh] flex items-end pb-0 overflow-hidden pt-16">
        <img src={IMG.hero} alt="Selva National School" className="absolute inset-0 w-full h-full object-cover object-center" />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.55) 38%, rgba(255,255,255,0) 72%)' }} />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(240,253,244,0.45) 0%, transparent 45%)' }} />
        <div className="relative z-10 max-w-5xl mx-auto px-6 pb-16 w-full">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-emerald-700 bg-emerald-100 px-4 py-1.5 rounded-full mb-5 fu" style={{ animationDelay: '.1s' }}>
            Infrastructure
          </span>
          <h1 className="fu text-5xl md:text-6xl font-black leading-tight text-slate-900 mb-4" style={{ animationDelay: '.22s' }}>
            World-Class{' '}
            <span style={{ background: 'linear-gradient(135deg,#059669,#10B981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Facilities
            </span>
          </h1>
          <p className="fu text-slate-700 text-lg max-w-xl leading-relaxed" style={{ animationDelay: '.34s' }}>
            Every space at Selva National School is thoughtfully designed to inspire learning, creativity, and growth.
          </p>
        </div>
      </section>

      {/* ── STATS ROW ────────────────────────────────── */}
      <section className="py-10 px-4 bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { val:'36',      label:'Smart Classrooms', c:'#1D4ED8', bg:'#EFF6FF' },
            { val:'3',       label:'Science Labs',     c:'#059669', bg:'#ECFDF5' },
            { val:'10,000+', label:'Library Books',    c:'#D97706', bg:'#FFFBEB' },
            { val:'15',      label:'Transport Routes', c:'#7C3AED', bg:'#F5F3FF' },
          ].map(({ val, label, c, bg }) => (
            <div key={label} className="rounded-2xl p-5 text-center" style={{ background: bg }}>
              <p className="text-3xl font-black mb-1" style={{ color: c }}>{val}</p>
              <p className="text-slate-500 text-xs font-semibold">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FACILITY CARDS ───────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-emerald-700 bg-emerald-100 px-4 py-1.5 rounded-full mb-4">Our Spaces</span>
            <h2 className="text-3xl font-black text-slate-900 mb-3">Explore Our Facilities</h2>
            <p className="text-slate-500 text-sm max-w-lg mx-auto">State-of-the-art resources that bring learning to life every day.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map(({ title, sub, desc, img, accent, bg, badge }) => (
              <div key={title} className="fcard rounded-3xl overflow-hidden bg-white border border-slate-100"
                style={{ boxShadow: '0 4px 24px rgba(0,0,0,.07)' }}>

                {/* Photo */}
                <div className="relative overflow-hidden h-52">
                  <img src={img} alt={title} className="w-full h-full object-cover" />
                  {/* Very light overlay so photo stays vivid */}
                  <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,.3) 0%, transparent 60%)' }} />
                  {/* Badge */}
                  <span className="absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background: bg, color: accent }}>
                    {badge}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="w-8 h-1 rounded-full mb-3" style={{ background: accent }} />
                  <h3 className="font-black text-slate-900 text-lg leading-snug">{title}</h3>
                  <p className="text-xs font-semibold mt-1 mb-3" style={{ color: accent }}>{sub}</p>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SMART CLASSROOMS ─────────────────────────── */}
      <section className="py-24 px-4" style={{ background: '#F8FAFF' }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          {/* Photo */}
          <div className="relative rounded-3xl overflow-hidden" style={{ boxShadow: '0 24px 60px rgba(29,78,216,.14)' }}>
            <img src={IMG.smart} alt="smart classroom" className="w-full aspect-[4/3] object-cover object-top" />
          </div>
          {/* Text */}
          <div>
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-blue-700 bg-blue-100 px-4 py-1.5 rounded-full mb-5">Technology</span>
            <h2 className="text-3xl font-black text-slate-900 mb-5 leading-snug">
              Smart Classrooms in{' '}
              <span style={{ background: 'linear-gradient(135deg,#1D4ED8,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Every Room
              </span>
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              All 36 classrooms are fitted with interactive smart boards, HD projectors, and integrated audio systems.
              Teachers use digital lesson plans and real-time assessment tools to make every lesson engaging and inclusive.
            </p>
            <p className="text-slate-600 leading-relaxed mb-8">
              Students interact directly with the board for quizzes, group exercises, and multimedia content —
              turning every class into an active learning experience.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { val:'36',    label:'Smart Boards',   c:'#1D4ED8', bg:'#EFF6FF' },
                { val:'4K',    label:'HD Projectors',  c:'#7C3AED', bg:'#F5F3FF' },
                { val:'1 Gbps',label:'Campus Wi-Fi',   c:'#059669', bg:'#ECFDF5' },
                { val:'100%',  label:'Digital Lessons',c:'#D97706', bg:'#FFFBEB' },
              ].map(({ val, label, c, bg }) => (
                <div key={label} className="rounded-2xl p-4 text-center" style={{ background: bg }}>
                  <p className="text-2xl font-black" style={{ color: c }}>{val}</p>
                  <p className="text-slate-500 text-xs font-medium mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TRANSPORT & MEDICAL ──────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-amber-600 bg-amber-100 px-4 py-1.5 rounded-full mb-4">Support Services</span>
            <h2 className="text-3xl font-black text-slate-900">Safety & Support</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">

            {/* Transport */}
            <div className="fcard rounded-3xl overflow-hidden border border-slate-100"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,.06)' }}>
              <div className="relative h-48 overflow-hidden">
                <img src={IMG.transport} alt="transport" className="w-full h-full object-cover" />
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,.28) 0%, transparent 60%)' }} />
              </div>
              <div className="p-7">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 bg-amber-50">🚌</div>
                <p className="font-black text-slate-900 text-lg">Transport Network</p>
                <p className="text-amber-600 text-xs font-semibold mb-3">15 routes · GPS-tracked · Chaperones</p>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Safe, GPS-enabled buses covering all major city routes with trained drivers and dedicated chaperones for every journey.
                </p>
              </div>
            </div>

            {/* Medical */}
            <div className="fcard rounded-3xl p-7 border border-red-100 bg-white"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,.06)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4 bg-red-50">🏥</div>
              <p className="font-black text-slate-900 text-lg">Medical Room</p>
              <p className="text-red-500 text-xs font-semibold mb-3">On-campus nurse · First aid · Emergency protocol</p>
              <p className="text-slate-500 text-sm leading-relaxed mb-5">
                Fully equipped medical room staffed by a qualified nurse during all school hours. Emergency contacts and protocols updated annually.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Nurse on duty','First-aid kits','Emergency protocol','Parent alerts'].map(tag => (
                  <span key={tag} className="text-xs px-3 py-1 rounded-full bg-red-50 text-red-600 font-semibold">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(135deg,#059669,#10B981,#0284C7)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-4">Come See Our Campus in Person</h2>
          <p className="text-emerald-100 mb-8 max-w-lg mx-auto text-sm leading-relaxed">
            Book a campus tour and experience our world-class facilities for yourself.
          </p>
          <a href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-emerald-900 hover:scale-105 transition-transform"
            style={{ background: 'linear-gradient(135deg,#FCD34D,#F59E0B)', boxShadow: '0 8px 32px rgba(245,158,11,.4)' }}>
            Book a Tour
          </a>
        </div>
      </section>
    </div>
  );
}
