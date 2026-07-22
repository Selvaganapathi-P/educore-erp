import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, ChevronDown, ChevronUp, Trash2, Edit2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import api from '../../lib/axios';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/EmptyState';

export default function ClassesPage() {
  const qc = useQueryClient();
  const [yearFilter, setYearFilter] = useState('');
  const [expanded, setExpanded]     = useState(null);
  const [classModal, setClassModal] = useState(false);
  const [sectionModal, setSectionModal] = useState(null);
  const [delTarget, setDel]         = useState(null);

  const { data: years = [] } = useQuery({
    queryKey: ['academic-years'],
    queryFn:  () => api.get('/academics/years').then(r => r.data.data),
  });

  const currentYear = years.find(y => y.isCurrent)?._id ?? '';

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ['classes', yearFilter || currentYear],
    queryFn:  () => api.get('/academics/classes', { params: { academicYearId: yearFilter || currentYear } }).then(r => r.data.data),
    enabled:  !!(yearFilter || currentYear),
  });

  const { register, handleSubmit, reset } = useForm();

  const createMut = useMutation({
    mutationFn: data => api.post('/academics/classes', {
      ...data,
      academicYearId: yearFilter || currentYear,
      displayOrder: data.displayOrder ? Number(data.displayOrder) : 0,
      sections: [{ name: data.sectionName || 'A', capacity: Number(data.capacity) || 40 }],
    }),
    onSuccess: () => { toast.success('Class created'); reset(); setClassModal(false); qc.invalidateQueries(['classes']); },
    onError:   e => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const addSectionMut = useMutation({
    mutationFn: ({ classId, data }) => api.post(`/academics/classes/${classId}/sections`, data),
    onSuccess: () => { toast.success('Section added'); setSectionModal(null); qc.invalidateQueries(['classes']); },
    onError:   e => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const delClassMut = useMutation({
    mutationFn: id => api.delete(`/academics/classes/${id}`),
    onSuccess: () => { toast.success('Deleted'); setDel(null); qc.invalidateQueries(['classes']); },
    onError:   e => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const delSectionMut = useMutation({
    mutationFn: ({ classId, sectionId }) => api.delete(`/academics/classes/${classId}/sections/${sectionId}`),
    onSuccess: () => { toast.success('Section removed'); qc.invalidateQueries(['classes']); },
    onError:   e => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const { register: regSec, handleSubmit: handleSec, reset: resetSec } = useForm();

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Classes & Sections</h1>
          <p className="page-subtitle">Manage class structure and section assignments</p>
        </div>
        <button onClick={() => { reset(); setClassModal(true); }} className="btn btn-primary btn-md">
          <Plus size={16}/> Add Class
        </button>
      </div>

      {/* Year filter */}
      {years.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {years.map(y => (
            <button key={y._id}
              onClick={() => setYearFilter(y._id === (yearFilter || currentYear) ? '' : y._id)}
              className={clsx('px-3 py-1 rounded-full text-xs font-medium border transition-all',
                (yearFilter || currentYear) === y._id
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300')}>
              {y.name}{y.isCurrent ? ' ★' : ''}
            </button>
          ))}
        </div>
      )}

      {/* Classes list */}
      <div className="space-y-3">
        {isLoading
          ? Array.from({length:5}).map((_,i)=><div key={i} className="skeleton h-16 rounded-xl"/>)
          : classes.length === 0
            ? <div className="card card-body"><EmptyState icon={Users} title="No classes found" description="Add your first class to get started."/></div>
            : classes.map(cls => (
              <div key={cls._id} className="card overflow-hidden">
                <div className="card-body flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold shrink-0">
                    {cls.name.replace(/\D/g,'') || cls.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800">{cls.name}</p>
                    <p className="text-xs text-slate-500">
                      {cls.sections.filter(s=>!s.isDeleted).length} sections ·{' '}
                      {cls.sections.filter(s=>!s.isDeleted).reduce((a,s)=>a+s.strength,0)} students
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { resetSec(); setSectionModal(cls); }} className="btn btn-outline btn-sm">
                      <Plus size={13}/> Section
                    </button>
                    <button onClick={() => setExpanded(expanded === cls._id ? null : cls._id)} className="btn btn-icon btn-ghost">
                      {expanded === cls._id ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
                    </button>
                    <button onClick={() => setDel({ type: 'class', id: cls._id, name: cls.name })}
                      className="btn btn-icon btn-ghost text-red-400 hover:text-red-600"><Trash2 size={15}/></button>
                  </div>
                </div>

                {expanded === cls._id && (
                  <div className="px-6 pb-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-4">
                    {cls.sections.filter(s=>!s.isDeleted).map(sec => (
                      <div key={sec._id} className="bg-slate-50 rounded-lg p-3 flex items-start justify-between">
                        <div>
                          <p className="font-medium text-slate-800">Section {sec.name}</p>
                          <p className="text-xs text-slate-500">{sec.strength}/{sec.capacity} students</p>
                          {sec.roomNo && <p className="text-xs text-slate-400">Room {sec.roomNo}</p>}
                          {sec.classTeacher && (
                            <p className="text-xs text-primary-600">
                              {sec.classTeacher.profile?.firstName} {sec.classTeacher.profile?.lastName}
                            </p>
                          )}
                        </div>
                        <button onClick={() => delSectionMut.mutate({ classId: cls._id, sectionId: sec._id })}
                          className="btn btn-icon btn-ghost text-red-300 hover:text-red-500 -mt-1 -mr-1">
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
        }
      </div>

      {/* Create class modal */}
      <Modal open={classModal} onClose={() => setClassModal(false)} title="Add New Class" size="sm">
        <form onSubmit={handleSubmit(d => createMut.mutate(d))} className="space-y-4">
          <div>
            <label className="label">Class Name *</label>
            <input className="input w-full" placeholder="Grade 1, Class 10…" {...register('name', { required: true })}/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">First Section</label>
              <input className="input w-full" placeholder="A" {...register('sectionName')}/>
            </div>
            <div>
              <label className="label">Capacity</label>
              <input type="number" className="input w-full" defaultValue={40} {...register('capacity')}/>
            </div>
          </div>
          <div>
            <label className="label">Display Order</label>
            <input type="number" className="input w-full" defaultValue={0} {...register('displayOrder')}/>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setClassModal(false)} className="btn btn-outline btn-md">Cancel</button>
            <button type="submit" disabled={createMut.isPending} className="btn btn-primary btn-md">
              {createMut.isPending && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
              Create
            </button>
          </div>
        </form>
      </Modal>

      {/* Add section modal */}
      {sectionModal && (
        <Modal open onClose={() => setSectionModal(null)} title={`Add Section to ${sectionModal.name}`} size="sm">
          <form onSubmit={handleSec(d => addSectionMut.mutate({ classId: sectionModal._id, data: { name: d.name, capacity: Number(d.capacity) || 40, roomNo: d.roomNo } }))} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Section Name *</label>
                <input className="input w-full" placeholder="B" {...regSec('name', { required: true })}/>
              </div>
              <div>
                <label className="label">Capacity</label>
                <input type="number" className="input w-full" defaultValue={40} {...regSec('capacity')}/>
              </div>
            </div>
            <div>
              <label className="label">Room No</label>
              <input className="input w-full" placeholder="101" {...regSec('roomNo')}/>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setSectionModal(null)} className="btn btn-outline btn-md">Cancel</button>
              <button type="submit" disabled={addSectionMut.isPending} className="btn btn-primary btn-md">
                {addSectionMut.isPending && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
                Add
              </button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmDialog open={!!delTarget} onClose={() => setDel(null)}
        onConfirm={() => delClassMut.mutate(delTarget.id)} loading={delClassMut.isPending}
        danger title="Delete Class" message={`Delete "${delTarget?.name}"?`} confirmLabel="Delete"/>
    </div>
  );
}
