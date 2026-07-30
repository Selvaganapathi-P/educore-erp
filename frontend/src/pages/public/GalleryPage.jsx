const items = [
  { label:'Annual Day 2024',    sub:'Performing Arts',      url:'https://images.unsplash.com/photo-1736660605452-bf4eb4d704f4?w=700&q=85&fit=crop', tall:true  },
  { label:'Science Fair',       sub:'Innovation Hub',       url:'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=700&q=85&fit=crop', tall:false },
  { label:'Sports Day',         sub:'Athletics',            url:'https://images.unsplash.com/photo-1556863402-b5d84ed0b6d5?w=700&q=85&fit=crop', tall:false },
  { label:'Art Exhibition',     sub:'Creative Arts',        url:'https://images.unsplash.com/photo-1583238829785-7ba8a888bb72?w=700&q=85&fit=crop', tall:true  },
  { label:'Graduation 2024',    sub:'Achievements',         url:'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=700&q=85&fit=crop', tall:false },
  { label:'Cultural Fest',      sub:'Diversity & Heritage', url:'https://images.unsplash.com/photo-1729951847727-db1dc342ee61?w=700&q=85&fit=crop', tall:true  },
  { label:'Music Concert',      sub:'Performing Arts',      url:'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=700&q=85&fit=crop', tall:false },
  { label:'Smart Classroom',    sub:'Learning in Action',   url:'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=700&q=85&fit=crop', tall:false },
  { label:'Library Week',       sub:'Reading Drive',        url:'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=700&q=85&fit=crop', tall:true  },
  { label:'Republic Day',       sub:'National Celebrations',url:'https://images.unsplash.com/photo-1661248822719-ef4908babf0b?w=700&q=85&fit=crop', tall:false },
  { label:'STEM Workshop',      sub:'Future Innovators',    url:'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=700&q=85&fit=crop', tall:false },
  { label:'Sports Tournament',  sub:'Inter-School',         url:'https://images.unsplash.com/photo-1526749464606-83091e34a261?w=700&q=85&fit=crop', tall:true  },
];

const TAGS = ['All','Sports','Arts','Science','Events','Achievements'];

export default function GalleryPage() {
  return (
    <div className="text-slate-900 bg-white overflow-x-hidden">
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp .75s ease both}
        .gcard{transition:transform .3s,box-shadow .3s}
        .gcard:hover{transform:translateY(-6px);box-shadow:0 24px 48px rgba(0,0,0,.15)}
        .gcard:hover img{transform:scale(1.06)}
        .gcard img{transition:transform .5s ease}
      `}</style>

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="pt-24 pb-14 px-4 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#F5F3FF 0%,#EDE9FE 40%,#FAF5FF 100%)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(rgba(124,58,237,.08) 1.5px,transparent 1.5px)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 pointer-events-none rounded-full"
          style={{ background: 'radial-gradient(ellipse,rgba(167,139,250,.25) 0%,transparent 70%)' }} />
        <div className="relative z-10">
          <span className="fu inline-block text-xs font-bold tracking-widest uppercase text-purple-700 bg-purple-100 px-4 py-1.5 rounded-full mb-5" style={{ animationDelay: '.05s' }}>
            Memories
          </span>
          <h1 className="fu text-4xl md:text-5xl font-black text-slate-900 mt-2 mb-4 leading-tight" style={{ animationDelay: '.18s' }}>
            Life at{' '}
            <span style={{ background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Selva National School
            </span>
          </h1>
          <p className="fu text-slate-500 mt-3 text-base max-w-xl mx-auto leading-relaxed" style={{ animationDelay: '.3s' }}>
            Glimpses of achievement, joy, and community — celebrating the vibrant life at our school.
          </p>

          {/* Filter pills */}
          <div className="fu flex flex-wrap justify-center gap-2 mt-8" style={{ animationDelay: '.42s' }}>
            {TAGS.map((tag, i) => (
              <button key={tag}
                className="px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 border"
                style={i === 0
                  ? { background: '#7C3AED', color: 'white', border: '1px solid #7C3AED', boxShadow: '0 4px 14px rgba(124,58,237,.3)' }
                  : { background: 'white', color: '#475569', border: '1px solid #E2E8F0' }}>
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── MASONRY GRID ─────────────────────────────── */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-6xl mx-auto columns-2 md:columns-3 lg:columns-4 gap-4">
          {items.map(({ label, sub, url, tall }) => (
            <div key={label}
              className="gcard break-inside-avoid mb-4 rounded-2xl overflow-hidden relative cursor-pointer bg-slate-100 border border-slate-100">
              <img
                src={url}
                alt={label}
                loading="lazy"
                className="w-full object-cover block"
                style={{ aspectRatio: tall ? '3/4' : '4/3' }}
              />
              {/* Bottom overlay with label */}
              <div className="absolute inset-0"
                style={{ background: 'linear-gradient(to top,rgba(15,23,42,.72) 0%,transparent 55%)' }} />
              {/* Hover color tint */}
              <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'rgba(124,58,237,.18)' }} />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="font-bold text-white text-sm leading-tight drop-shadow">{label}</p>
                <p className="text-white/65 text-xs mt-0.5 font-medium">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="text-center mt-8">
          <p className="text-slate-400 text-sm">
            Follow us on social media for more photos and live updates from school events.
          </p>
          <div className="flex justify-center gap-4 mt-4">
            {['📷 Instagram','📘 Facebook','🎬 YouTube'].map(s => (
              <span key={s} className="text-xs font-semibold text-purple-600 bg-purple-50 px-4 py-2 rounded-full cursor-pointer hover:bg-purple-100 transition-colors">{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(135deg,#7C3AED,#6D28D9,#4F46E5)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-4">Create Your Own Memories Here</h2>
          <p className="text-purple-200 mb-8 text-sm max-w-lg mx-auto leading-relaxed">
            Admissions for 2025–26 are open. Be part of the vibrant Selva National School family.
          </p>
          <a href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-purple-900 hover:scale-105 transition-transform"
            style={{ background: 'linear-gradient(135deg,#FCD34D,#F59E0B)', boxShadow: '0 8px 32px rgba(245,158,11,.4)' }}>
            Apply for Admission
          </a>
        </div>
      </section>
    </div>
  );
}
