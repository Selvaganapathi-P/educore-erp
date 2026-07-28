import { useEffect, useState } from 'react';
import { Printer } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import api from '../../lib/axios';

const gradeColor = (g) => {
  if (g === 'A+' || g === 'A') return 'bg-green-100 text-green-700';
  if (g === 'B+' || g === 'B') return 'bg-blue-100 text-blue-700';
  if (g === 'C' || g === 'D')  return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
};

function printResult(result, studentName) {
  const subjectRows = result.subjects?.map(s =>
    `<tr><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb">${s.name}</td>
     <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:center">${s.marks}</td>
     <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:center">${s.maxMarks}</td>
     <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:center">${((s.marks / s.maxMarks) * 100).toFixed(0)}%</td></tr>`
  ).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Result Card</title>
  <style>body{font-family:Arial,sans-serif;margin:40px;color:#111}h1{color:#1e40af;margin-bottom:4px}
  table{width:100%;border-collapse:collapse;margin-top:16px}th{background:#f1f5f9;padding:8px;text-align:left}
  .badge{display:inline-block;padding:4px 12px;border-radius:999px;font-weight:700;font-size:14px}
  .pass{background:#dcfce7;color:#166534}.fail{background:#fee2e2;color:#991b1b}
  @media print{.no-print{display:none}}</style></head>
  <body>
  <h1>EduCore School</h1>
  <p style="color:#6b7280;margin-bottom:24px">Official Result Card</p>
  <table style="margin-bottom:16px;width:auto;border:none"><tr><td style="padding:4px 12px 4px 0;color:#6b7280">Student</td><td style="font-weight:600">${studentName}</td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Exam</td><td style="font-weight:600;text-transform:capitalize">${result.examType?.replace('_', ' ')}</td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Academic Year</td><td style="font-weight:600">${result.academicYear}</td></tr></table>
  <table><thead><tr><th>Subject</th><th style="text-align:center">Marks</th><th style="text-align:center">Max Marks</th><th style="text-align:center">%</th></tr></thead>
  <tbody>${subjectRows}
  <tr style="background:#f8fafc;font-weight:700"><td style="padding:8px">Total</td>
  <td style="padding:8px;text-align:center">${result.totalMarks}</td>
  <td style="padding:8px;text-align:center">${result.totalMaxMarks}</td>
  <td style="padding:8px;text-align:center">${result.percentage?.toFixed(1)}%</td></tr></tbody></table>
  <div style="margin-top:24px;display:flex;gap:16px;align-items:center">
  <span style="font-size:20px;font-weight:700">Grade: ${result.grade}</span>
  <span class="badge ${result.result === 'pass' ? 'pass' : 'fail'}">${result.result?.toUpperCase()}</span>
  </div>
  <p style="margin-top:40px;color:#9ca3af;font-size:12px">Generated on ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
  <script>window.onload=()=>window.print()</script></body></html>`;

  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
}

export default function StudentResultsPage() {
  const { user, student } = useAuthStore();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.get('/results').then(r => setResults(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-400">Loading results...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Results</h1>

      {results.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No results published yet.</div>
      ) : (
        <div className="space-y-4">
          {results.map(r => (
            <div key={r._id} className="bg-white rounded-xl border overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(expanded === r._id ? null : r._id)}
              >
                <div>
                  <p className="font-semibold text-gray-900 capitalize">{r.examType?.replace('_', ' ')}</p>
                  <p className="text-xs text-gray-500">{r.academicYear} · {r.subjects?.length} subjects</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${gradeColor(r.grade)}`}>{r.grade}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${r.result === 'pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{r.result?.toUpperCase()}</span>
                  <span className="text-sm font-medium text-gray-700">{r.percentage?.toFixed(1)}%</span>
                </div>
              </button>

              {expanded === r._id && (
                <div className="border-t px-6 py-4">
                  <div className="flex justify-end mb-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); printResult(r, user?.name); }}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                    </button>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-500 uppercase tracking-wide border-b">
                        <th className="text-left pb-2">Subject</th>
                        <th className="text-right pb-2">Marks</th>
                        <th className="text-right pb-2">Max Marks</th>
                        <th className="text-right pb-2">%</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {r.subjects?.map((s, i) => (
                        <tr key={i}>
                          <td className="py-2 font-medium text-gray-900">{s.name}</td>
                          <td className="py-2 text-right text-gray-700">{s.marks}</td>
                          <td className="py-2 text-right text-gray-500">{s.maxMarks}</td>
                          <td className="py-2 text-right text-gray-600">{((s.marks / s.maxMarks) * 100).toFixed(0)}%</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="font-semibold border-t">
                        <td className="pt-3">Total</td>
                        <td className="pt-3 text-right">{r.totalMarks}</td>
                        <td className="pt-3 text-right text-gray-500">{r.totalMaxMarks}</td>
                        <td className="pt-3 text-right">{r.percentage?.toFixed(1)}%</td>
                      </tr>
                    </tfoot>
                  </table>
                  <div className="mt-4 pt-4 border-t flex items-center gap-3">
                    <span className="text-sm text-gray-600">Overall Grade:</span>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${gradeColor(r.grade)}`}>{r.grade}</span>
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${r.result === 'pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {r.result?.toUpperCase()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
