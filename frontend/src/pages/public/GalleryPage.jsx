const items = [
  {
    label: 'Annual Day 2024',
    sub: 'Performing Arts',
    url: 'https://images.unsplash.com/photo-1736660605452-bf4eb4d704f4?w=700&q=80&fit=crop',
    tall: true,
  },
  {
    label: 'Science Fair',
    sub: 'Innovation Hub',
    url: 'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=700&q=80&fit=crop',
    tall: false,
  },
  {
    label: 'Sports Day',
    sub: 'Athletics',
    url: 'https://images.unsplash.com/photo-1556863402-b5d84ed0b6d5?w=700&q=80&fit=crop',
    tall: false,
  },
  {
    label: 'Art Exhibition',
    sub: 'Creative Arts',
    url: 'https://images.unsplash.com/photo-1583238829785-7ba8a888bb72?w=700&q=80&fit=crop',
    tall: true,
  },
  {
    label: 'Graduation 2024',
    sub: 'Achievements',
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=700&q=80&fit=crop',
    tall: false,
  },
  {
    label: 'Cultural Fest',
    sub: 'Diversity & Heritage',
    url: 'https://images.unsplash.com/photo-1729951847727-db1dc342ee61?w=700&q=80&fit=crop',
    tall: true,
  },
  {
    label: 'Music Concert',
    sub: 'Performing Arts',
    url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=700&q=80&fit=crop',
    tall: false,
  },
  {
    label: 'Smart Classroom',
    sub: 'Learning in Action',
    url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=700&q=80&fit=crop',
    tall: false,
  },
  {
    label: 'Library Week',
    sub: 'Reading Drive',
    url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=700&q=80&fit=crop',
    tall: true,
  },
  {
    label: 'Republic Day',
    sub: 'National Celebrations',
    url: 'https://images.unsplash.com/photo-1661248822719-ef4908babf0b?w=700&q=80&fit=crop',
    tall: false,
  },
  {
    label: 'STEM Workshop',
    sub: 'Future Innovators',
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=700&q=80&fit=crop',
    tall: false,
  },
  {
    label: 'Sports Tournament',
    sub: 'Inter-School',
    url: 'https://images.unsplash.com/photo-1526749464606-83091e34a261?w=700&q=80&fit=crop',
    tall: true,
  },
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
            Glimpses of achievement, joy, and community — celebrating the vibrant life at our school.
          </p>
        </div>
      </div>

      {/* Masonry photo grid */}
      <section className="pb-24 px-4">
        <div className="max-w-6xl mx-auto columns-2 md:columns-3 lg:columns-4 gap-3">
          {items.map(({ label, sub, url, tall }) => (
            <div
              key={label}
              className="break-inside-avoid mb-3 rounded-2xl overflow-hidden relative group cursor-pointer"
              style={{ border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <img
                src={url}
                alt={label}
                loading="lazy"
                className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                style={{ aspectRatio: tall ? '3/4' : '4/3', display: 'block' }}
              />
              {/* Always-on subtle bottom gradient */}
              <div className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 50%)' }} />
              {/* Hover overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'rgba(124,58,237,0.22)' }} />
              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="font-bold text-white text-sm leading-tight drop-shadow">{label}</p>
                <p className="text-white/60 text-xs mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Follow us on social media for more photos and updates from school events.
        </p>
      </section>
    </div>
  );
}
