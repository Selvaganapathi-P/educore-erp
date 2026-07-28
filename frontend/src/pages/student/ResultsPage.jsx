import { useEffect, useState } from 'react';
import api from '../../lib/axios';

const gradeColor = (g) => {
  if (g === 'A+' || g === 'A') return 'bg-green-100 text-green-700';
  if (g === 'B+' || g === 'B') return 'bg-blue-100 text-blue-700';
  if (g === 'C' || g === 'D') return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
};

export default function StudentResultsPage() {
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
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-semibold text-gray-900 capitalize">{r.examType?.replace('_', ' ')}</p>
                    <p className="text-xs text-gray-500">{r.academicYear}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${gradeColor(r.grade)}`}>{r.grade}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${r.result === 'pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{r.result?.toUpperCase()}</span>
                  <span className="text-sm font-medium text-gray-700">{r.percentage?.toFixed(1)}%</span>
                  <span className="text-xs text-gray-400">{r.totalMarks}/{r.totalMaxMarks}</span>
                </div>
              </button>

              {expanded === r._id && (
                <div className="border-t px-6 py-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-500 uppercase tracking-wide">
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
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
