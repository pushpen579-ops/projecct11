import { useEffect, useState, useMemo } from 'react';
import { GraduationCap, Plus, Edit3, Trash2, Search, Layers } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Course, Subject } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Table from '@/components/ui/Table';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toast';

interface CoursesPageProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export default function CoursesPage({ searchValue, onSearchChange }: CoursesPageProps) {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<(Course & { subject_count?: number })[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    course_id: '', name: '', department: '', duration_years: '4', num_semesters: '8',
  });

  async function loadData() {
    setLoading(true);
    const { data } = await supabase.from('courses').select('*').order('name');
    const { data: subjects } = await supabase.from('subjects').select('course_id');
    const subjectCounts = new Map<string, number>();
    (subjects || []).forEach((s: { course_id: string }) => {
      subjectCounts.set(s.course_id, (subjectCounts.get(s.course_id) || 0) + 1);
    });
    setCourses((data || []).map((c: Course) => ({ ...c, subject_count: subjectCounts.get(c.id) || 0 })));
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    const q = searchValue.toLowerCase();
    return courses.filter(
      (c) => c.name.toLowerCase().includes(q) || c.course_id.toLowerCase().includes(q) || c.department.toLowerCase().includes(q)
    );
  }, [courses, searchValue]);

  function openAdd() {
    setEditing(null);
    setForm({ course_id: '', name: '', department: '', duration_years: '4', num_semesters: '8' });
    setShowForm(true);
  }

  function openEdit(course: Course) {
    setEditing(course);
    setForm({
      course_id: course.course_id,
      name: course.name,
      department: course.department,
      duration_years: String(course.duration_years),
      num_semesters: String(course.num_semesters),
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name || !form.course_id || !form.department) {
      toast('error', 'Please fill in course ID, name, and department.');
      return;
    }
    setSaving(true);
    const payload = {
      course_id: form.course_id,
      name: form.name,
      department: form.department,
      duration_years: parseInt(form.duration_years) || 4,
      num_semesters: parseInt(form.num_semesters) || 8,
    };
    if (editing) {
      const { error } = await supabase.from('courses').update(payload).eq('id', editing.id);
      if (error) { setSaving(false); toast('error', error.message); return; }
      toast('success', 'Course updated successfully.');
    } else {
      const { error } = await supabase.from('courses').insert(payload);
      if (error) { setSaving(false); toast('error', error.message.includes('duplicate') ? 'A course with this ID already exists.' : error.message); return; }
      toast('success', 'Course added successfully.');
    }
    setSaving(false);
    setShowForm(false);
    loadData();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from('courses').delete().eq('id', deleteTarget.id);
    setDeleting(false);
    if (error) { toast('error', error.message); return; }
    toast('success', 'Course deleted successfully.');
    setDeleteTarget(null);
    loadData();
  }

  const columns = [
    {
      key: 'course_id',
      header: 'Course ID',
      render: (c: Course) => <span className="font-mono text-xs font-medium text-brand-600">{c.course_id}</span>,
    },
    {
      key: 'name',
      header: 'Course Name',
      render: (c: Course) => (
        <div>
          <p className="font-medium text-slate-800">{c.name}</p>
          <p className="text-xs text-slate-500">{c.department}</p>
        </div>
      ),
    },
    { key: 'duration_years', header: 'Duration', render: (c: Course) => <span className="text-sm">{c.duration_years} years</span> },
    { key: 'num_semesters', header: 'Semesters', render: (c: Course) => <Badge color="blue">{c.num_semesters}</Badge> },
    { key: 'subject_count', header: 'Subjects', render: (c: Course & { subject_count?: number }) => <Badge color="slate">{c.subject_count || 0}</Badge> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (c: Course) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={(e) => { e.stopPropagation(); openEdit(c); }} className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
            <Edit3 size={16} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(c); }} className="p-2 text-slate-500 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors">
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
          <h1 className="text-2xl font-bold text-slate-800">Courses</h1>
          <p className="text-sm text-slate-500 mt-1">{courses.length} courses · {new Set(courses.map((c) => c.department)).size} departments</p>
        </div>
        <Button icon={<Plus size={18} />} onClick={openAdd}>Add Course</Button>
      </div>

      <div className="md:hidden">
        <Input icon={<Search size={16} />} placeholder="Search courses..." value={searchValue} onChange={(e) => onSearchChange(e.target.value)} />
      </div>

      <Card noPadding>
        <Table
          columns={columns}
          data={filtered}
          loading={loading}
          emptyState={
            <EmptyState
              icon={<GraduationCap size={28} />}
              title="No courses found"
              description={searchValue ? "No courses match your search." : "Add your first course to get started."}
              action={!searchValue && <Button icon={<Plus size={18} />} onClick={openAdd}>Add Course</Button>}
            />
          }
        />
      </Card>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Edit Course' : 'Add New Course'}
        subtitle={editing ? 'Update course details' : 'Enter course details below'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Course'}</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Course ID *" value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })} placeholder="e.g. BTECH-CS" />
          <Input label="Course Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. B.Tech Computer Science" />
          <Input label="Department *" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Computer Science & Engineering" />
          <Input label="Duration (Years)" type="number" value={form.duration_years} onChange={(e) => setForm({ ...form, duration_years: e.target.value })} />
          <Input label="Number of Semesters" type="number" value={form.num_semesters} onChange={(e) => setForm({ ...form, num_semesters: e.target.value })} />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Course"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will also delete all subjects, and student course assignments will be removed. This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
