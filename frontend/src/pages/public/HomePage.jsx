import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Award, Calendar, ArrowRight, Bell } from 'lucide-react';
import api from '../../lib/axios';

const stats = [
  { label: 'Students', value: '1,200+', icon: Users },
  { label: 'Classes', value: '36', icon: BookOpen },
  { label: 'Awards', value: '50+', icon: Award },
  { label: 'Years', value: '25+', icon: Calendar },
];

export default function HomePage() {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    api.get('/public/announcements?limit=4').then(r => setAnnouncements(r.data.data)).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Welcome to EduCore School
          </h1>
          <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto">
            Empowering students with knowledge, character, and a love for lifelong learning since 1999.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/about" className="px-6 py-3 bg-white text-blue-800 font-semibold rounded-lg hover:bg-blue-50 transition-colors">
              Learn More
            </Link>
            <Link to="/contact" className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-12">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center p-6 rounded-xl bg-blue-50">
              <Icon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-900">{value}</p>
              <p className="text-sm text-gray-600 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Principal's Message */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-10 items-center">
          <div className="w-40 h-40 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 text-5xl text-blue-700 font-bold">
            P
          </div>
          <div>
            <span className="text-sm text-blue-600 font-semibold uppercase tracking-wider">Principal's Message</span>
            <h2 className="text-2xl font-bold mt-2 mb-4 text-gray-900">A Word From Our Principal</h2>
            <p className="text-gray-600 leading-relaxed">
              At EduCore School, we believe every child has unique potential waiting to be discovered. Our dedicated faculty and state-of-the-art facilities create an environment where students are encouraged to question, explore, and grow.
              We are committed to shaping not just academically strong but holistically developed individuals who will lead tomorrow's world with integrity and compassion.
            </p>
            <p className="mt-4 font-semibold text-gray-800">— Dr. Priya Sharma, Principal</p>
          </div>
        </div>
      </section>

      {/* Announcements */}
      {announcements.length > 0 && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-sm text-blue-600 font-semibold uppercase tracking-wider">Latest</span>
                <h2 className="text-2xl font-bold text-gray-900 mt-1">Announcements</h2>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {announcements.map(a => (
                <div key={a._id} className="border rounded-xl p-5 hover:border-blue-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <Bell className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize">{a.category}</span>
                      <h3 className="font-semibold text-gray-900 mt-2">{a.title}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{a.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Highlights */}
      <section className="py-16 px-4 bg-blue-900 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Why Choose EduCore School?</h2>
          <p className="text-blue-300 mb-10">We offer more than education — we build futures.</p>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            {[
              ['Academic Excellence', 'Consistently high board results with personalised attention for every student.'],
              ['Holistic Development', 'Sports, arts, and co-curricular activities to nurture every talent.'],
              ['Safe Environment', 'A secure, inclusive campus where every student feels valued.'],
            ].map(([title, desc]) => (
              <div key={title} className="bg-blue-800/50 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-blue-300 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <Link to="/facilities" className="inline-flex items-center gap-2 mt-10 px-6 py-3 bg-white text-blue-800 font-semibold rounded-lg hover:bg-blue-50 transition-colors">
            Explore Our Facilities <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
