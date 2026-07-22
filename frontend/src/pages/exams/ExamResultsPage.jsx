import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator, Globe, Printer, Trophy } from 'lucide-react';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

const GRADE_COLOR = { 'A+':'text-emerald-600', 'A':'text-emerald-500', 'B+':'text-blue-600', 'B':'text-blue-400', 'C':'text-amber-500', 'D':'text-orange-400', 'F':'text-red-500', 'AB':'text-slate-400', 'N/A':'text-slate-300' };

export default function ExamResultsPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const qc       = useQueryClient();

  const [classId,   setClassId]   = useState('');
  const [sectionId, setSectionId] = useState('');
  const [printStudent, setPrint]  = useState(null);

  const { data: examData } = useQuery({
    queryKey: ['exam', id],
    queryFn:  () => api.get(`/exams/${id}`).then(r => r.data.data),
    enabled:  !!id,
  });

  const { data: years = [] } = useQuery({ queryKey: ['academic-years'], queryFn: () => api.get('/academics/years').then(r => r.data.data) });
  const currentYear = years.find(y => y.isCurrent);

  const { data: classes = [] } = useQuery({
    queryKey: ['classes', currentYear?._id],
    queryFn:  () => api.get('/academics/classes', { params: { academicYearId: currentYear._id } }).then(r => r.data.data),
    enabled:  !!currentYear?._id,
  });

  const selectedClass = classes.find(c => c._id === classId);
  const sections      = (selectedClass?.sections ?? []).filter(s => !s.isDeleted);

  const { data: results = [], isLoading: resultsLoading, refetch } = useQuery({
    queryKey: ['exam-results', id, classId, sectionId],
    queryFn:  () => api.get(`/exams/${id}/results`, { params: { classId, sectionId } }).then(r => r.data.data),
    enabled:  !!(classId && sectionId),
  });

  const exam     = examData ?? {};
  const schedule = (exam.schedule ?? []).filter(s => !classId || String(s.classId?._id ?? s.classId) === String(classId));

  // Build subject header from schedule for selected class
  const subjectHeaders = useMemo(() => {
    const seen = new Set();
    return schedule.filter(s => {
      const key = String(s.subjectId?._id ?? s.subjectName);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [schedule]);

  const calcMut = useMutation({
    mutationFn: () => api.post(`/exams/${id}/results/calculate`, { classId, sectionId }),
    onSuccess:  () => { toast.success('Ranks calculated'); refetch(); },
    onError:    e  => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const publishMut = useMutation({
    mutationFn: () => api.post(`/exams/${id}/results/publish`, { classId, sectionId }),
    onSuccess:  () => { toast.success('Results published'); qc.invalidateQueries(['exams']); },
    onError:    e  => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const allPublished = results.length > 0 && results.every(r => r.isPublished);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/exams/${id}`)} className="btn btn-icon btn-ghost"><ArrowLeft size={18}/></button>
          <div>
            <h1 className="page-title">Exam Results</h1>
            <p className="page-subtitle">{exam.name}</p>
          </div>
        </div>
        {results.length > 0 && (
          <div className="flex gap-2">
            <button onClick={() => calcMut.mutate()} disabled={calcMut.isPending || !classId || !sectionId}
              className="btn btn-outline btn-md">
              {calcMut.isPending && <span className="w-4 h-4 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin"/>}
              <Calculator size={15}/> Calculate Ranks
            </button>
            {!allPublished && (
              <button onClick={() => publishMut.mutate()} disabled={publishMut.isPending}
                className="btn btn-primary btn-md">
                <Globe size={15}/> Publish Results
              </button>
            )}
          </div>
        )}
      </div>

      {/* Selectors */}
      <div className="card card-body flex flex-wrap gap-4 items-end">
        <div>
          <label className="label">Class</label>
          <select className="input w-36" value={classId} onChange={e => { setClassId(e.target.value); setSectionId(''); }}>
            <option value="">Select class</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Section</label>
          <select className="input w-32" value={sectionId} onChange={e => setSectionId(e.target.value)} disabled={!classId}>
            <option value="">Section</option>
            {sections.map(s => <option key={s._id} value={s._id}>Section {s.name}</option>)}
          </select>
        </div>
      </div>

      {/* Results table */}
      {classId && sectionId && (
        resultsLoading
          ? <div className="skeleton h-64 rounded-xl"/>
          : results.length === 0
            ? <div className="card card-body text-center text-slate-400 py-12">No results found. Enter marks and calculate ranks first.</div>
            : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="border border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-500 sticky left-0 bg-slate-50 w-8">Rank</th>
                      <th className="border border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-500 sticky left-8 bg-slate-50 min-w-[160px]">Student</th>
                      {subjectHeaders.map(s => (
                        <th key={s._id} className="border border-slate-200 px-2 py-2 text-center text-xs font-semibold text-slate-500 min-w-[80px]">
                          <div style={{ color: s.subjectId?.color }}>{s.subjectId?.name ?? s.subjectName}</div>
                          <div className="text-slate-400 font-normal">/{s.maxMarks}</div>
                        </th>
                      ))}
                      <th className="border border-slate-200 px-3 py-2 text-center text-xs font-semibold text-slate-600 bg-slate-100">Total</th>
                      <th className="border border-slate-200 px-3 py-2 text-center text-xs font-semibold text-slate-600 bg-slate-100">%</th>
                      <th className="border border-slate-200 px-3 py-2 text-center text-xs font-semibold text-slate-600 bg-slate-100">Grade</th>
                      <th className="border border-slate-200 px-3 py-2 text-center text-xs font-semibold text-slate-600 bg-slate-100">Result</th>
                      <th className="border border-slate-200 px-2 py-2 text-center text-xs font-semibold text-slate-500">Report</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, idx) => {
                      const name = `${r.userId?.profile?.firstName ?? ''} ${r.userId?.profile?.lastName ?? ''}`.trim() || '—';
                      return (
                        <tr key={r._id} className={`hover:bg-slate-50 ${idx % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
                          <td className="border border-slate-100 px-3 py-2 text-center font-bold text-slate-600 sticky left-0 bg-white">
                            {r.rank ? (
                              <span className={`flex items-center justify-center gap-0.5 ${r.rank <= 3 ? 'text-amber-500' : ''}`}>
                                {r.rank <= 3 && <Trophy size={12}/>} {r.rank}
                              </span>
                            ) : '—'}
                          </td>
                          <td className="border border-slate-100 px-3 py-2 sticky left-8 bg-white">
                            <p className="font-medium text-slate-700">{name}</p>
                            {r.studentId?.rollNumber && <p className="text-xs text-slate-400">{r.studentId.rollNumber}</p>}
                          </td>
                          {subjectHeaders.map(sh => {
                            const sr = r.subjectResults?.find(s => String(s.scheduleId) === String(sh._id));
                            return (
                              <td key={sh._id} className="border border-slate-100 px-2 py-2 text-center">
                                {sr ? (
                                  sr.isAbsent
                                    ? <span className="text-slate-400 text-xs">AB</span>
                                    : (
                                      <span className={`font-semibold ${sr.isPassed ? 'text-slate-700' : 'text-red-500'}`}>
                                        {sr.marksObtained}
                                      </span>
                                    )
                                ) : <span className="text-slate-300">—</span>}
                              </td>
                            );
                          })}
                          <td className="border border-slate-100 px-3 py-2 text-center font-bold text-slate-700 bg-slate-50">
                            {r.totalObtained ?? '—'}/{r.totalMarks ?? '—'}
                          </td>
                          <td className="border border-slate-100 px-3 py-2 text-center font-semibold bg-slate-50">
                            <span className={r.percentage >= 75 ? 'text-emerald-600' : r.percentage >= 50 ? 'text-amber-500' : 'text-red-500'}>
                              {r.percentage ?? '—'}%
                            </span>
                          </td>
                          <td className="border border-slate-100 px-3 py-2 text-center font-bold bg-slate-50">
                            <span className={GRADE_COLOR[r.grade] ?? 'text-slate-400'}>{r.grade || '—'}</span>
                          </td>
                          <td className="border border-slate-100 px-3 py-2 text-center bg-slate-50">
                            <span className={`badge text-xs ${r.isPassed ? 'badge-success' : 'badge-error'}`}>
                              {r.isPassed ? 'Pass' : 'Fail'}
                            </span>
                          </td>
                          <td className="border border-slate-100 px-2 py-2 text-center">
                            <button onClick={() => setPrint(r)} className="btn btn-ghost btn-icon">
                              <Printer size={14}/>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
      )}

      {(!classId || !sectionId) && (
        <div className="card card-body flex items-center justify-center h-40">
          <p className="text-slate-400 text-sm">Select a class and section to view results.</p>
        </div>
      )}

      {printStudent && <ReportCardModal result={printStudent} exam={exam} onClose={() => setPrint(null)}/>}
    </div>
  );
}

function ReportCardModal({ result, exam, onClose }) {
  const name    = `${result.userId?.profile?.firstName ?? ''} ${result.userId?.profile?.lastName ?? ''}`.trim();
  const rollNo  = result.studentId?.rollNumber;
  const GRADE_COLOR_PRINT = { 'A+':'#059669','A':'#10b981','B+':'#2563eb','B':'#3b82f6','C':'#d97706','D':'#ea580c','F':'#dc2626','AB':'#94a3b8' };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 print:p-4" id="report-card">
          {/* Header */}
          <div className="text-center border-b border-slate-200 pb-4 mb-4">
            <h2 className="text-xl font-bold text-slate-900">Report Card</h2>
            <p className="text-sm text-slate-500">{exam.name} · {exam.academicYearId?.name}</p>
          </div>

          {/* Student info */}
          <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
            <div><span className="text-slate-400">Name: </span><strong>{name}</strong></div>
            <div><span className="text-slate-400">Roll No: </span><strong>{rollNo || '—'}</strong></div>
            <div><span className="text-slate-400">Class: </span><strong>{result.classId?.name || '—'}</strong></div>
            <div><span className="text-slate-400">Exam Date: </span><strong>{dayjs(exam.startDate).format('DD MMM YYYY')}</strong></div>
          </div>

          {/* Marks table */}
          <table className="w-full mb-6 text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-600">Subject</th>
                <th className="border border-slate-200 px-3 py-2 text-center font-semibold text-slate-600">Max</th>
                <th className="border border-slate-200 px-3 py-2 text-center font-semibold text-slate-600">Obtained</th>
                <th className="border border-slate-200 px-3 py-2 text-center font-semibold text-slate-600">Grade</th>
                <th className="border border-slate-200 px-3 py-2 text-center font-semibold text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {(result.subjectResults ?? []).map((sr, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="border border-slate-200 px-3 py-2 font-medium">{sr.subjectName || sr.subjectId?.name || '—'}</td>
                  <td className="border border-slate-200 px-3 py-2 text-center">{sr.maxMarks}</td>
                  <td className="border border-slate-200 px-3 py-2 text-center font-semibold">
                    {sr.isAbsent ? 'AB' : sr.marksObtained}
                  </td>
                  <td className="border border-slate-200 px-3 py-2 text-center font-bold" style={{ color: GRADE_COLOR_PRINT[sr.grade] }}>{sr.grade}</td>
                  <td className="border border-slate-200 px-3 py-2 text-center">
                    {sr.isAbsent ? <span className="text-slate-400">Absent</span>
                      : sr.isPassed ? <span className="text-emerald-600 font-medium">Pass</span>
                      : <span className="text-red-500 font-medium">Fail</span>}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold">
                <td className="border border-slate-200 px-3 py-2">Total</td>
                <td className="border border-slate-200 px-3 py-2 text-center">{result.totalMarks}</td>
                <td className="border border-slate-200 px-3 py-2 text-center">{result.totalObtained}</td>
                <td className="border border-slate-200 px-3 py-2 text-center" style={{ color: GRADE_COLOR_PRINT[result.grade] }}>{result.grade}</td>
                <td className="border border-slate-200 px-3 py-2 text-center">
                  <span className={result.isPassed ? 'text-emerald-600' : 'text-red-500'}>{result.isPassed ? 'PASS' : 'FAIL'}</span>
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Summary row */}
          <div className="flex justify-between items-center bg-slate-50 rounded-xl px-4 py-3 text-sm mb-6">
            <div><span className="text-slate-400">Percentage: </span><strong>{result.percentage}%</strong></div>
            <div><span className="text-slate-400">Grade: </span><strong style={{ color: GRADE_COLOR_PRINT[result.grade] }}>{result.grade}</strong></div>
            {result.rank > 0 && <div><span className="text-slate-400">Rank: </span><strong className="text-amber-600">{result.rank}</strong></div>}
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 pb-6">
          <button onClick={onClose} className="btn btn-outline btn-md">Close</button>
          <button onClick={() => window.print()} className="btn btn-primary btn-md"><Printer size={15}/> Print</button>
        </div>
      </div>
    </div>
  );
}
