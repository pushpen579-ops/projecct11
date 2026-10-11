import { useEffect, useState, useMemo } from 'react';
import { BookOpen, Plus, Edit3, Trash2, Search, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Subject, Course } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Table from '@/components/ui/Table';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Input, Select } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toast';

interface SubjectsPageProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export default function SubjectsPage({ searchValue, onSearchChange }: SubjectsPageProps) {
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<(Subject & { course?: Course })[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    subject_code: '', name: '', course_id: '', semester: '1', credits: '3', faculty: '',
  });

  async function loadData() {
    setLoading(true);
    const { data } = await supabase
      .from('subjects')
      .select('*, course:courses(*)')
      .order('name');
    const { data: cData } = await supabase.from('courses').select('*').order('name');
    setSubjects((data as (Subject & { course?: Course })[]) || []);
    setCourses(cData || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    const q = searchValue.toLowerCase();
    return subjects.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.subject_code.toLowerCase().includes(q) ||
        s.faculty.toLowerCase().includes(q) ||
        (s.course?.name || '').toLowerCase().includes(q)
    );
  }, [subjects, searchValue]);

  function openAdd() {
    setEditing(null);
    setForm({ subject_code: '', name: '', course_id: courses[0]?.id || '', semester: '1', credits: '3', faculty: '' });
    setShowForm(true);
  }

  function openEdit(sub: Subject) {
    setEditing(sub);
    setForm({
      subject_code: sub.subject_code,
      name: sub.name,
      course_id: sub.course_id,
      semester: String(sub.semester),
      credits: String(sub.credits),
      faculty: sub.faculty,
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name || !form.subject_code || !form.faculty || !form.course_id) {
      toast('error', 'Please fill in all required fields.');
      return;
    }
    setSaving(true);
    const payload = {
      subject_code: form.subject_code,
      name: form.name,
      course_id: form.course_id,
      semester: parseInt(form.semester) || 1,
      credits: parseInt(form.credits) || 3,
      faculty: form.faculty,
    };
    if (editing) {
      const { error } = await supabase.from('subjects').update(payload).eq('id', editing.id);
      if (error) { setSaving(false); toast('error', error.message); return; }
      toast('success', 'Subject updated successfully.');
    } else {
      const { error } = await supabase.from('subjects').insert(payload);
      if (error) { setSaving(false); toast('error', error.message.includes('duplicate') ? 'A subject with this code already exists.' : error.message); return; }
      toast('success', 'Subject added successfully.');
    }
    setSaving(false);
    setShowForm(false);
    loadData();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from('subjects').delete().eq('id', deleteTarget.id);
    setDeleting(false);
    if (error) { toast('error', error.message); return; }
    toast('success', 'Subject deleted successfully.');
    setDeleteTarget(null);
    loadData();
  }

  type SubjectRow = Subject & { course?: Course };

  const columns = [
    {
      key: 'subject_code',
      header: 'Code',
      render: (s: SubjectRow) => <span className="font-mono text-xs font-medium text-brand-600">{s.subject_code}</span>,
    },
    {
      key: 'name',
      header: 'Subject Name',
      render: (s: SubjectRow) => (
        <div>
          <p className="font-medium text-slate-800">{s.name}</p>
          <p className="text-xs text-slate-500">{s.course?.name || 'No course'}</p>
        </div>
      ),
    },
    { key: 'semester', header: 'Semester', render: (s: SubjectRow) => <Badge color="blue">Sem {s.semester}</Badge> },
    { key: 'credits', header: 'Credits', render: (s: SubjectRow) => <Badge color="slate">{s.credits}</Badge> },
    {
      key: 'faculty',
      header: 'Faculty',
      render: (s: SubjectRow) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-medium">
            {s.faculty.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
          </div>
          <span className="text-sm text-slate-700">{s.faculty}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (s: SubjectRow) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={(e) => { e.stopPropagation(); openEdit(s); }} className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
            <Edit3 size={16} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(s); }} className="p-2 text-slate-500 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Subjects</h1>
          <p className="text-sm text-slate-500 mt-1">{subjects.length} subjects across {courses.length} courses</p>
        </div>
        <Button icon={<Plus size={18} />} onClick={openAdd} disabled={courses.length === 0}>Add Subject</Button>
      </div>

      {courses.length === 0 && (
        <Card>
          <EmptyState
            icon={<BookOpen size={28} />}
            title="Add a course first"
            description="You need at least one course before adding subjects."
          />
        </Card>
      )}

      <div className="md:hidden">
        <Input icon={<Search size={16} />} placeholder="Search subjects..." value={searchValue} onChange={(e) => onSearchChange(e.target.value)} />
      </div>

      <Card noPadding>
        <Table
          columns={columns}
          data={filtered}
          loading={loading}
          emptyState={
            <EmptyState
              icon={<BookOpen size={28} />}
              title="No subjects found"
              description={searchValue ? "No subjects match your search." : "Add your first subject to get started."}
              action={!searchValue && courses.length > 0 && <Button icon={<Plus size={18} />} onClick={openAdd}>Add Subject</Button>}
            />
          }
        />
      </Card>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Edit Subject' : 'Add New Subject'}
        subtitle={editing ? 'Update subject details' : 'Enter subject details below'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Subject'}</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Subject Code *" value={form.subject_code} onChange={(e) => setForm({ ...form, subject_code: e.target.value })} placeholder="e.g. CS301" />
          <Input label="Subject Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Operating Systems" />
          <Select label="Course *" value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}>
            <option value="">Select course</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select label="Semester" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })}>
            {[1,2,3,4,5,6,7,8].map((n) => <option key={n} value={n}>Semester {n}</option>)}
          </Select>
          <Input label="Credits" type="number" value={form.credits} onChange={(e) => setForm({ ...form, credits: e.target.value })} />
          <Input label="Faculty *" value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })} placeholder="e.g. Dr. Rajesh Kumar" icon={<User size={16} />} />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Subject"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will also remove related attendance, marks, and assignment records. This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
