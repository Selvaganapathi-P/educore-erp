const Section = ({ label, children }) => (
  <section className="py-20 px-4">
    <div className="max-w-5xl mx-auto">
      <span className="text-xs font-semibold tracking-widest uppercase text-blue-400">{label}</span>
      {children}
    </div>
  </section>
);

const Card = ({ title, desc, accent = '#1D4ED8' }) => (
  <div className="rounded-2xl p-6 relative overflow-hidden"
    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
    <div className="absolute top-0 left-0 right-0 h-px"
      style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
    <h3 className="font-bold text-white text-base mb-3">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default function AboutPage() {
  return (
    <div className="bg-[#0A0F1E] text-white pt-16">

      {/* Hero */}
      <div className="relative py-24 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(99,143,255,0.12) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(29,78,216,0.25) 0%, transparent 70%)' }} />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="text-xs font-semibold tracking-widest uppercase text-blue-400">Our Story</span>
          <h1 className="text-4xl md:text-5xl font-black mt-3 leading-tight">
            About{' '}
            <span style={{
              background: 'linear-gradient(90deg,#60A5FA,#818CF8)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Selva National School School</span>
          </h1>
          <p className="text-slate-400 mt-5 text-base leading-relaxed">
            25 years of nurturing minds, shaping futures, and building a community that believes every child matters.
          </p>
        </div>
      </div>

      {/* History */}
      <Section label="History">
        <div className="grid md:grid-cols-2 gap-12 mt-8 items-center">
          <div>
            <h2 className="text-2xl font-black text-white mb-5">A Legacy Built Over 25 Years</h2>
            <p className="text-slate-400 leading-relaxed mb-4">
              Founded in 1999 with just 50 students and a vision to provide quality education in an inclusive environment,
              Selva National School School has grown into a vibrant community of over 1,200 students from Classes 1 to 12.
            </p>
            <p className="text-slate-400 leading-relaxed">
              Over the decades, our alumni have gone on to excel in medicine, engineering, arts, sports, and public service —
              carrying with them the values and curiosity that Selva National School instilled.
            </p>
          </div>
          <div className="rounded-2xl p-10 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg,rgba(29,78,216,0.15),rgba(124,58,237,0.1))', border: '1px solid rgba(29,78,216,0.2)' }}>
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(99,143,255,0.08) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <p className="relative text-7xl font-black" style={{ background: 'linear-gradient(135deg,#60A5FA,#818CF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>25+</p>
            <p className="relative text-slate-400 mt-2 font-medium">Years of Excellence</p>
          </div>
        </div>
      </Section>

      {/* Vision Mission Values */}
      <section className="py-20 px-4 bg-[#080C17]">
        <div className="max-w-5xl mx-auto">
          <span className="text-xs font-semibold tracking-widest uppercase text-purple-400">Foundation</span>
          <h2 className="text-2xl font-black text-white mt-3 mb-8">What Drives Us</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card title="Our Vision" accent="#1D4ED8"
              desc="To be a centre of learning that inspires every student to reach their full potential and contribute positively to society." />
            <Card title="Our Mission" accent="#7C3AED"
              desc="Deliver quality education in a caring environment that fosters intellectual curiosity, ethical values, and creative thinking." />
            <Card title="Our Values" accent="#F59E0B"
              desc="Integrity, compassion, excellence, teamwork, and respect for every individual form the bedrock of our school culture." />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
            {[['1999', 'Year Founded'], ['1,200+', 'Students'], ['80+', 'Teachers'], ['5,000+', 'Alumni']].map(([v, l]) => (
              <div key={l} className="p-8 text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <p className="text-3xl font-black text-white">{v}</p>
                <p className="text-slate-500 text-xs mt-2 uppercase tracking-wider">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-20 px-4 bg-[#080C17]">
        <div className="max-w-5xl mx-auto">
          <span className="text-xs font-semibold tracking-widest uppercase text-emerald-400">Team</span>
          <h2 className="text-2xl font-black text-white mt-3 mb-8">Our Leadership</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { name: 'Dr. Priya Sharma', role: 'Principal', bio: 'M.Ed., Ph.D. in Education · 20 years experience', color: 'from-blue-600 to-violet-600' },
              { name: 'Mr. Rajesh Kumar', role: 'Vice Principal', bio: 'M.Sc., B.Ed. · Specialist in student development', color: 'from-emerald-600 to-teal-600' },
            ].map(({ name, role, bio, color }) => (
              <div key={name} className="flex items-center gap-4 rounded-2xl p-5"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black text-white flex-shrink-0 bg-gradient-to-br ${color}`}>
                  {name[0]}
                </div>
                <div>
                  <p className="font-bold text-white">{name}</p>
                  <p className="text-blue-400 text-sm">{role}</p>
                  <p className="text-slate-500 text-xs mt-1">{bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
