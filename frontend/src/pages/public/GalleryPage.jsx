const items = [
  { label: 'Annual Day 2024', color: 'from-blue-200 to-blue-300', emoji: '🎭' },
  { label: 'Science Fair',    color: 'from-green-200 to-green-300', emoji: '🔬' },
  { label: 'Sports Day',      color: 'from-orange-200 to-orange-300', emoji: '🏆' },
  { label: 'Art Exhibition',  color: 'from-pink-200 to-pink-300', emoji: '🎨' },
  { label: 'Republic Day',    color: 'from-yellow-200 to-yellow-300', emoji: '🇮🇳' },
  { label: 'Graduation',      color: 'from-purple-200 to-purple-300', emoji: '🎓' },
  { label: 'Cultural Fest',   color: 'from-red-200 to-red-300', emoji: '💃' },
  { label: 'Tree Plantation', color: 'from-emerald-200 to-emerald-300', emoji: '🌳' },
  { label: 'Class Room',      color: 'from-sky-200 to-sky-300', emoji: '📚' },
];

export default function GalleryPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <span className="text-sm text-blue-600 font-semibold uppercase tracking-wider">Memories</span>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Photo Gallery</h1>
        <p className="text-gray-500 mt-3">Glimpses of life at EduCore School — celebrating achievement, joy, and community.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {items.map(({ label, color, emoji }) => (
          <div key={label} className={`bg-gradient-to-br ${color} rounded-xl aspect-video flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform`}>
            <span className="text-4xl mb-2">{emoji}</span>
            <span className="text-sm font-semibold text-gray-700">{label}</span>
          </div>
        ))}
      </div>

      <p className="text-center text-gray-400 text-sm mt-8">
        More photos available on our official social media pages.
      </p>
    </div>
  );
}
