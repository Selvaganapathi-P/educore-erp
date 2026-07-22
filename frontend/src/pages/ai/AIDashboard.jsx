import { Link } from 'react-router-dom';
import { Bot, MessageSquare, Lightbulb, FileText, Sparkles, ArrowRight } from 'lucide-react';

const FEATURES = [
  {
    icon: MessageSquare,
    color: 'bg-indigo-50 text-indigo-600',
    title: 'AI Chat Assistant',
    desc: 'Ask questions about your school — students, fees, attendance, staff — and get intelligent answers with context from your live data.',
    href: '/ai/chat',
    cta: 'Start Chatting',
  },
  {
    icon: Lightbulb,
    color: 'bg-amber-50 text-amber-600',
    title: 'School Insights',
    desc: 'Get AI-generated actionable insights based on your fee collection, attendance trends, health visits, and other operational data.',
    href: '/ai/insights',
    cta: 'View Insights',
  },
  {
    icon: FileText,
    color: 'bg-emerald-50 text-emerald-600',
    title: 'Content Generator',
    desc: 'Generate professional school communications — announcements, circulars, notices, letters — with AI. Just fill in the key details.',
    href: '/ai/content',
    cta: 'Generate Content',
  },
];

const TIPS = [
  'Ask "How many students have unpaid fees this month?"',
  'Try "Draft an exam notice for Class 10 starting next Monday"',
  'Request "Analyze our attendance trend and suggest improvements"',
  'Ask "Write a parent letter about the upcoming annual day event"',
  'Try "What are the top 5 things I should focus on this week?"',
];

export default function AIDashboard() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">EduCore AI Assistant</h1>
            <p className="mt-1 text-indigo-100 max-w-xl">
              Your intelligent school management co-pilot. Ask questions, get insights, and generate
              professional content — all powered by AI with real-time school data.
            </p>
            <Link to="/ai/chat" className="mt-4 inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-indigo-50 transition-colors">
              <Sparkles className="w-4 h-4" />
              Start AI Chat
            </Link>
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {FEATURES.map(f => (
          <div key={f.title} className="card card-body flex flex-col">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${f.color}`}>
              <f.icon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-800 mt-3">{f.title}</h3>
            <p className="text-sm text-slate-500 mt-1 flex-1">{f.desc}</p>
            <Link to={f.href} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors">
              {f.cta} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>

      {/* Tips & example prompts */}
      <div className="card card-body">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h2 className="font-semibold text-slate-700">Try asking...</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {TIPS.map((tip, i) => (
            <Link
              key={i}
              to={`/ai/chat?q=${encodeURIComponent(tip)}`}
              className="group flex items-start gap-2 px-3 py-2.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0 group-hover:text-indigo-600" />
              <span className="text-xs text-slate-600 group-hover:text-indigo-700">{tip}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
