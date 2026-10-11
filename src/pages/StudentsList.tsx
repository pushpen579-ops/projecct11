import { useEffect, useState, useMemo } from 'react';
import { Users, Search, Eye, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Student, Course } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Table from '@/components/ui/Table';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toast';
import { type Page } from '@/components/Layout';
import { getInitials } from '@/lib/utils';

interface StudentsListProps {
  onNavigate: (page: Page, params?: { studentId?: string }) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export default function StudentsList({ onNavigate, searchValue, onSearchChange }: StudentsListProps) {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<(Student & { course?: Course })[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', student_id: '', enrollment_no: '',
    date_of_birth: '', gender: 'Male', address: '', course_id: '',
    semester: '1', section: 'A',
  });

  async function loadData() {
    setLoading(true);
    const { data } = await supabase
      .from('students')
      .select('*, course:courses(*)')
      .order('name');
    const { data: courseData } = await supabase.from('courses').select('*').order('name');
    setStudents((data as (Student & { course?: Course })[]) || []);
    setCourses(courseData || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    const q = searchValue.toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.student_id.toLowerCase().includes(q) ||
        s.enrollment_no.toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q)
    );
  }, [students, searchValue]);

  async function handleAdd() {
    if (!form.name || !form.student_id || !form.enrollment_no) {
      toast('error', 'Please fill in name, student ID, and enrollment number.');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('students').insert({
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      student_id: form.student_id,
      enrollment_no: form.enrollment_no,
      date_of_birth: form.date_of_birth || null,
      gender: form.gender,
      address: form.address || null,
      course_id: form.course_id || null,
      semester: parseInt(form.semester) || 1,
      section: form.section,
    });
    setSaving(false);
    if (error) {
      toast('error', error.message.includes('duplicate') ? 'A student with this ID or enrollment number already exists.' : error.message);
      return;
    }
    toast('success', 'Student added successfully.');
    setShowAdd(false);
    setForm({ name: '', email: '', phone: '', student_id: '', enrollment_no: '', date_of_birth: '', gender: 'Male', address: '', course_id: '', semester: '1', section: 'A' });
    loadData();
  }

  const columns = [
    {
      key: 'name',
      header: 'Student',
      render: (s: Student & { course?: Course }) => (
        <div className="flex items-center gap-3">
          {s.photo_url ? (
            <img src={s.photo_url} alt={s.name} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-semibold text-xs shrink-0">
              {getInitials(s.name)}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-medium text-slate-800 truncate">{s.name}</p>
            <p className="text-xs text-slate-500 truncate">{s.email || '—'}</p>
          </div>
        </div>
      ),
    },
    { key: 'student_id', header: 'Student ID', render: (s: Student) => <span className="font-mono text-xs">{s.student_id}</span> },
    { key: 'course', header: 'Course', render: (s: Student & { course?: Course }) => <span className="text-sm">{s.course?.name || '—'}</span> },
    { key: 'semester', header: 'Semester', render: (s: Student) => <Badge color="blue">Sem {s.semester}</Badge> },
    { key: 'section', header: 'Section', render: (s: Student) => <span className="text-sm">{s.section || '—'}</span> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (s: Student) => (
        <div className="flex items-center justify-end gap-2">
          <button
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-brand-600 hover:bg-brand-50 transition-colors"
            onClick={(e) => { e.stopPropagation(); onNavigate('student-profile', { studentId: s.id }); }}
          >
            <Eye size={14} /> View
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Students</h1>
          <p className="text-sm text-slate-500 mt-1">{students.length} students enrolled</p>
        </div>
        <Button icon={<UserPlus size={18} />} onClick={() => setShowAdd(true)}>Add Student</Button>
      </div>

      <div className="md:hidden">
        <Input icon={<Search size={16} />} placeholder="Search students..." value={searchValue} onChange={(e) => onSearchChange(e.target.value)} />
      </div>

      <Card noPadding>
        <Table
          columns={columns}
          data={filtered}
          loading={loading}
          onRowClick={(s) => onNavigate('student-profile', { studentId: s.id })}
          emptyState={
            <EmptyState
              icon={<Users size={28} />}
              title="No students found"
              description={searchValue ? "No students match your search." : "Add your first student to get started."}
              action={!searchValue && <Button icon={<UserPlus size={18} />} onClick={() => setShowAdd(true)}>Add Student</Button>}
            />
          }
        />
      </Card>

      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add New Student"
        subtitle="Enter the student's details below"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={saving}>{saving ? 'Saving...' : 'Save Student'}</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. John Doe" />
          <Input label="Student ID *" value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} placeholder="e.g. STU007" />
          <Input label="Enrollment No. *" value={form.enrollment_no} onChange={(e) => setForm({ ...form, enrollment_no: e.target.value })} placeholder="e.g. ENR2024007" />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="student@college.edu" />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
          <Input label="Date of Birth" type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
          <Select label="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </Select>
          <Select label="Course" value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}>
            <option value="">Select course</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select label="Semester" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })}>
            {[1,2,3,4,5,6,7,8].map((n) => <option key={n} value={n}>Semester {n}</option>)}
          </Select>
          <Select label="Section" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })}>
            {['A','B','C','D'].map((s) => <option key={s} value={s}>Section {s}</option>)}
          </Select>
          <div className="sm:col-span-2">
            <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, City, State" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
