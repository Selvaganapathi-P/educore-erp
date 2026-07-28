export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <span className="text-sm text-blue-600 font-semibold uppercase tracking-wider">Our Story</span>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">About EduCore School</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Our History</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Founded in 1999, EduCore School has grown from a small institution with 50 students to a thriving educational community of over 1,200 students from Class 1 to Class 12.
          </p>
          <p className="text-gray-600 leading-relaxed">
            For 25 years, we have maintained our commitment to academic rigour combined with holistic development, producing alumni who have excelled in every field — medicine, engineering, arts, sports, and public service.
          </p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center p-8">
          <div className="text-center">
            <p className="text-6xl font-bold text-blue-800">25+</p>
            <p className="text-blue-600 font-medium mt-2">Years of Excellence</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {[
          ['Our Vision', 'To be a centre of learning excellence that inspires students to reach their full potential and contribute positively to society.'],
          ['Our Mission', 'To deliver quality education in a caring environment that fosters intellectual curiosity, ethical values, and creative thinking.'],
          ['Our Values', 'Integrity, compassion, excellence, teamwork, and respect for every individual form the foundation of our school culture.'],
        ].map(([title, desc]) => (
          <div key={title} className="bg-blue-50 rounded-xl p-6">
            <h3 className="font-bold text-blue-900 text-lg mb-3">{title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Our Leadership</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            ['Dr. Priya Sharma', 'Principal', 'M.Ed., Ph.D. in Education, 20 years of experience.'],
            ['Mr. Rajesh Kumar', 'Vice Principal', 'M.Sc., B.Ed., specialist in student development.'],
          ].map(([name, role, bio]) => (
            <div key={name} className="flex items-center gap-4 border rounded-xl p-5">
              <div className="w-14 h-14 rounded-full bg-blue-200 flex items-center justify-center text-2xl font-bold text-blue-700 flex-shrink-0">
                {name[0]}
              </div>
              <div>
                <p className="font-bold text-gray-900">{name}</p>
                <p className="text-blue-600 text-sm">{role}</p>
                <p className="text-gray-500 text-xs mt-1">{bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
