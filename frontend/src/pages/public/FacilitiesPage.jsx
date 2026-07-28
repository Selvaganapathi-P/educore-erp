import { BookOpen, Monitor, Beaker, Music, Dumbbell, Bus } from 'lucide-react';

const facilities = [
  { icon: BookOpen,  title: 'Library',         desc: '10,000+ books, digital resources, and a quiet reading environment for students and staff.' },
  { icon: Monitor,   title: 'Computer Lab',    desc: 'State-of-the-art computers with high-speed internet and programming tools.' },
  { icon: Beaker,    title: 'Science Labs',    desc: 'Fully equipped Physics, Chemistry, and Biology labs for hands-on experiments.' },
  { icon: Music,     title: 'Music & Arts',    desc: 'Dedicated spaces for music, dance, painting, and performing arts.' },
  { icon: Dumbbell,  title: 'Sports Complex',  desc: 'Cricket ground, basketball and volleyball courts, and indoor badminton.' },
  { icon: Bus,       title: 'Transport',       desc: 'Safe and reliable bus service covering major routes across the city.' },
];

export default function FacilitiesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <span className="text-sm text-blue-600 font-semibold uppercase tracking-wider">Infrastructure</span>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Our Facilities</h1>
        <p className="text-gray-500 mt-3 max-w-xl mx-auto">
          World-class facilities designed to support every aspect of student learning and growth.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {facilities.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="border rounded-xl p-6 hover:border-blue-300 hover:shadow-sm transition-all">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Icon className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-blue-50 rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-blue-900 mb-3">Smart Classrooms</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          All classrooms are equipped with interactive smart boards, projectors, and audio systems to make learning engaging, visual, and effective for every student.
        </p>
      </div>
    </div>
  );
}
