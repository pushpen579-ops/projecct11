import { useEffect, useState, useMemo } from 'react';
import {
  ArrowLeft, Edit3, Mail, Phone, Calendar, MapPin, User, IdCard,
  GraduationCap, BookOpen, ClipboardList, CheckCircle2, Clock, Award,
  TrendingUp, Users,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type {
  Student, Course, Subject, Attendance, Marks, Assignment,
  AttendanceWithSubject, MarksWithSubject, AssignmentWithSubject,
} from '@/types';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Input, Select, TextArea } from '@/components/ui/Input';
import EmptyState from '@/components/ui/EmptyState';
import { toast } from '@/components/ui/Toast';
import { type Page } from '@/components/Layout';
import { calculateGrade, gradeColor, attendanceColor, formatDate, getInitials } from '@/lib/utils';

type Tab = 'overview' | 'attendance' | 'marks' | 'subjects' | 'assignments';

interface StudentProfileProps {
  studentId: string;
  onNavigate: (page: Page, params?: { studentId?: string }) => void;
}

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <User size={16} /> },
  { id: 'attendance', label: 'Attendance', icon: <CheckCircle2 size={16} /> },
  { id: 'marks', label: 'Marks', icon: <Award size={16} /> },
  { id: 'subjects', label: 'Subjects', icon: <BookOpen size={16} /> },
  { id: 'assignments', label: 'Assignments', icon: <ClipboardList size={16} /> },
];

export default function StudentProfile({ studentId, onNavigate }: StudentProfileProps) {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<(Student & { course?: Course }) | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [attendance, setAttendance] = useState<AttendanceWithSubject[]>([]);
  const [marks, setMarks] = useState<MarksWithSubject[]>([]);
  const [assignments, setAssignments] = useState<AssignmentWithSubject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showEdit, setShowEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, string>>({});

  async function loadData() {
    setLoading(true);
    const { data: sData } = await supabase
      .from('students')
      .select('*, course:courses(*)')
      .eq('id', studentId)
      .maybeSingle();
    const studentData = sData as (Student & { course?: Course }) | null;
    setStudent(studentData);

    if (studentData?.course_id) {
      const { data: subData } = await supabase
        .from('subjects')
        .select('*')
        .eq('course_id', studentData.course_id)
        .eq('semester', studentData.semester)
        .order('name');
      setSubjects(subData || []);
    }

    const { data: attData } = await supabase
      .from('attendance')
      .select('*, subject:subjects(*)')
      .eq('student_id', studentId);
    setAttendance((attData as AttendanceWithSubject[]) || []);

    const { data: marksData } = await supabase
      .from('marks')
      .select('*, subject:subjects(*)')
      .eq('student_id', studentId);
    setMarks((marksData as MarksWithSubject[]) || []);

    const { data: asgData } = await supabase
      .from('assignments')
      .select('*, subject:subjects(*)')
      .eq('student_id', studentId)
      .order('due_date');
    setAssignments((asgData as AssignmentWithSubject[]) || []);

    const { data: cData } = await supabase.from('courses').select('*').order('name');
    setCourses(cData || []);

    if (studentData) {
      setEditForm({
        name: studentData.name || '',
        email: studentData.email || '',
        phone: studentData.phone || '',
        student_id: studentData.student_id || '',
        enrollment_no: studentData.enrollment_no || '',
        date_of_birth: studentData.date_of_birth || '',
        gender: studentData.gender || 'Male',
        address: studentData.address || '',
        course_id: studentData.course_id || '',
        semester: String(studentData.semester || 1),
        section: studentData.section || 'A',
        photo_url: studentData.photo_url || '',
      });
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [studentId]);

  const overallPercentage = useMemo(() => {
    if (marks.length === 0) return 0;
    let total = 0;
    marks.forEach((m) => {
      total += (m.internal_marks + m.assignment_marks + m.exam_marks) / 3;
    });
    return Math.round(total);
  }, [marks]);

  const overallAttendance = useMemo(() => {
    if (attendance.length === 0) return 0;
    const totalClasses = attendance.reduce((sum, a) => sum + a.total_classes, 0);
    const attended = attendance.reduce((sum, a) => sum + a.attended_classes, 0);
    if (totalClasses === 0) return 0;
    return Math.round((attended / totalClasses) * 100);
  }, [attendance]);

  const grade = calculateGrade(overallPercentage);

  async function handleSave() {
    if (!student) return;
    setSaving(true);
    const { error } = await supabase
      .from('students')
      .update({
        name: editForm.name,
        email: editForm.email || null,
        phone: editForm.phone || null,
        student_id: editForm.student_id,
        enrollment_no: editForm.enrollment_no,
        date_of_birth: editForm.date_of_birth || null,
        gender: editForm.gender,
        address: editForm.address || null,
        course_id: editForm.course_id || null,
        semester: parseInt(editForm.semester) || 1,
        section: editForm.section,
        photo_url: editForm.photo_url || null,
      })
      .eq('id', student.id);
    setSaving(false);
    if (error) {
      toast('error', error.message.includes('duplicate') ? 'A student with this ID or enrollment number already exists.' : error.message);
      return;
    }
    toast('success', 'Student profile updated successfully.');
    setShowEdit(false);
    loadData();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="animate-fade-in">
        <EmptyState
          icon={<User size={28} />}
          title="Student not found"
          description="This student may have been removed."
          action={<Button variant="secondary" onClick={() => onNavigate('students')}>Back to Students</Button>}
        />
      </div>
    );
  }

  const infoItems = [
    { icon: <IdCard size={16} />, label: 'Student ID', value: student.student_id },
    { icon: <IdCard size={16} />, label: 'Enrollment No.', value: student.enrollment_no },
    { icon: <Mail size={16} />, label: 'Email', value: student.email },
    { icon: <Phone size={16} />, label: 'Phone', value: student.phone },
    { icon: <Calendar size={16} />, label: 'Date of Birth', value: formatDate(student.date_of_birth) },
    { icon: <User size={16} />, label: 'Gender', value: student.gender },
    { icon: <MapPin size={16} />, label: 'Address', value: student.address },
    { icon: <GraduationCap size={16} />, label: 'Course', value: student.course?.name },
    { icon: <BookOpen size={16} />, label: 'Semester', value: `Semester ${student.semester}` },
    { icon: <Users size={16} />, label: 'Section', value: `Section ${student.section}` },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <button
        onClick={() => onNavigate('students')}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 font-medium"
      >
        <ArrowLeft size={16} /> Back to Students
      </button>

      {/* Profile Header */}
      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {student.photo_url ? (
            <img src={student.photo_url} alt={student.name} className="w-20 h-20 rounded-2xl object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-2xl shrink-0">
              {getInitials(student.name)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-800">{student.name}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{student.course?.name || 'No course assigned'} · Semester {student.semester} · Section {student.section}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge color="slate">{student.student_id}</Badge>
              <Badge color="blue">{student.enrollment_no}</Badge>
            </div>
          </div>
          <Button variant="outline" icon={<Edit3 size={16} />} onClick={() => setShowEdit(true)}>
            Edit Profile
          </Button>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-xs text-slate-500 mb-1">Overall Percentage</p>
          <p className="text-2xl font-bold text-slate-800">{overallPercentage}%</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-slate-500 mb-1">Grade</p>
          <p className={`text-2xl font-bold inline-block px-3 py-0.5 rounded-lg ${gradeColor(grade)}`}>{grade}</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-slate-500 mb-1">Attendance</p>
          <p className={`text-2xl font-bold ${attendanceColor(overallAttendance)}`}>{overallAttendance}%</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-slate-500 mb-1">Subjects</p>
          <p className="text-2xl font-bold text-slate-800">{subjects.length}</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto scrollbar-thin">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="lg:col-span-2">
            <CardHeader title="Student Information" icon={<User size={20} />} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {infoItems.map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">{item.label}</p>
                    <p className="text-sm font-medium text-slate-800 mt-0.5 break-words">{item.value || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Academic Summary" icon={<TrendingUp size={20} />} />
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-600">Overall Percentage</span>
                  <span className="text-sm font-semibold text-slate-800">{overallPercentage}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-600 rounded-full transition-all duration-500" style={{ width: `${overallPercentage}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-600">Attendance</span>
                  <span className={`text-sm font-semibold ${attendanceColor(overallAttendance)}`}>{overallAttendance}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${overallAttendance >= 75 ? 'bg-success-500' : overallAttendance >= 60 ? 'bg-warning-500' : 'bg-danger-500'}`} style={{ width: `${overallAttendance}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-sm text-slate-600">Grade</span>
                <span className={`text-sm font-bold px-2.5 py-0.5 rounded-md ${gradeColor(grade)}`}>{grade}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Assignments</span>
                <span className="text-sm font-semibold text-slate-800">{assignments.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Subjects Enrolled</span>
                <span className="text-sm font-semibold text-slate-800">{subjects.length}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'attendance' && (
        <Card noPadding>
          <div className="p-5 border-b border-slate-100">
            <CardHeader title="Attendance Records" subtitle="Per-subject attendance" icon={<CheckCircle2 size={20} />} />
          </div>
          {attendance.length === 0 ? (
            <EmptyState icon={<CheckCircle2 size={28} />} title="No attendance records" description="Attendance data will appear here once recorded." />
          ) : (
            <div className="divide-y divide-slate-100">
              {attendance.map((a) => {
                const pct = a.total_classes > 0 ? Math.round((a.attended_classes / a.total_classes) * 100) : 0;
                return (
                  <div key={a.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{a.subject?.name || 'Unknown subject'}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{a.subject?.subject_code} · {a.attended_classes} / {a.total_classes} classes</p>
                    </div>
                    <div className="w-24 hidden sm:block">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${pct >= 75 ? 'bg-success-500' : pct >= 60 ? 'bg-warning-500' : 'bg-danger-500'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <Badge color={pct >= 75 ? 'green' : pct >= 60 ? 'amber' : 'red'}>{pct}%</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'marks' && (
        <Card noPadding>
          <div className="p-5 border-b border-slate-100">
            <CardHeader title="Marks Breakdown" subtitle="Internal, assignment, and exam marks per subject" icon={<Award size={20} />} />
          </div>
          {marks.length === 0 ? (
            <EmptyState icon={<Award size={28} />} title="No marks recorded" description="Marks will appear here once entered." />
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Subject</th>
                    <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Internal</th>
                    <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Assignment</th>
                    <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Exam</th>
                    <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Total</th>
                    <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {marks.map((m) => {
                    const total = m.internal_marks + m.assignment_marks + m.exam_marks;
                    const pct = Math.round(total / 3);
                    return (
                      <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3.5">
                          <p className="text-sm font-medium text-slate-800">{m.subject?.name || '—'}</p>
                          <p className="text-xs text-slate-500">{m.subject?.subject_code}</p>
                        </td>
                        <td className="px-4 py-3.5 text-center text-sm text-slate-700">{m.internal_marks}<span className="text-slate-400 text-xs">/20</span></td>
                        <td className="px-4 py-3.5 text-center text-sm text-slate-700">{m.assignment_marks}<span className="text-slate-400 text-xs">/10</span></td>
                        <td className="px-4 py-3.5 text-center text-sm text-slate-700">{m.exam_marks}<span className="text-slate-400 text-xs">/70</span></td>
                        <td className="px-4 py-3.5 text-center text-sm font-semibold text-slate-800">{total}<span className="text-slate-400 text-xs">/100</span></td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold ${gradeColor(calculateGrade(pct))}`}>{calculateGrade(pct)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'subjects' && (
        <Card noPadding>
          <div className="p-5 border-b border-slate-100">
            <CardHeader title="Enrolled Subjects" subtitle={`Semester ${student.semester}`} icon={<BookOpen size={20} />} />
          </div>
          {subjects.length === 0 ? (
            <EmptyState icon={<BookOpen size={28} />} title="No subjects found" description="No subjects are assigned to this student's course and semester." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-5">
              {subjects.map((sub) => (
                <div key={sub.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-brand-300 hover:bg-brand-50/30 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                    <BookOpen size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 truncate">{sub.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{sub.subject_code} · {sub.credits} credits</p>
                  </div>
                  <Badge color="slate">{sub.faculty}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'assignments' && (
        <Card noPadding>
          <div className="p-5 border-b border-slate-100">
            <CardHeader title="Assignments" subtitle="All assignments across subjects" icon={<ClipboardList size={20} />} />
          </div>
          {assignments.length === 0 ? (
            <EmptyState icon={<ClipboardList size={28} />} title="No assignments" description="Assignments will appear here once assigned." />
          ) : (
            <div className="divide-y divide-slate-100">
              {assignments.map((a) => (
                <div key={a.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    a.status === 'graded' ? 'bg-success-50 text-success-600' :
                    a.status === 'submitted' ? 'bg-brand-50 text-brand-600' :
                    'bg-warning-50 text-warning-600'
                  }`}>
                    {a.status === 'graded' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{a.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{a.subject?.name} · Due {formatDate(a.due_date)}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {a.score !== null && <span className="text-sm font-semibold text-slate-700">{a.score}/{a.max_score}</span>}
                    <Badge color={a.status === 'graded' ? 'green' : a.status === 'submitted' ? 'blue' : 'amber'}>
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Edit Modal */}
      <Modal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        title="Edit Student Profile"
        subtitle="Update student information"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Full Name" value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          <Input label="Photo URL" value={editForm.photo_url || ''} onChange={(e) => setEditForm({ ...editForm, photo_url: e.target.value })} placeholder="https://..." />
          <Input label="Student ID" value={editForm.student_id || ''} onChange={(e) => setEditForm({ ...editForm, student_id: e.target.value })} />
          <Input label="Enrollment No." value={editForm.enrollment_no || ''} onChange={(e) => setEditForm({ ...editForm, enrollment_no: e.target.value })} />
          <Input label="Email" type="email" value={editForm.email || ''} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
          <Input label="Phone" value={editForm.phone || ''} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
          <Input label="Date of Birth" type="date" value={editForm.date_of_birth || ''} onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })} />
          <Select label="Gender" value={editForm.gender || 'Male'} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </Select>
          <Select label="Course" value={editForm.course_id || ''} onChange={(e) => setEditForm({ ...editForm, course_id: e.target.value })}>
            <option value="">Select course</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select label="Semester" value={editForm.semester || '1'} onChange={(e) => setEditForm({ ...editForm, semester: e.target.value })}>
            {[1,2,3,4,5,6,7,8].map((n) => <option key={n} value={n}>Semester {n}</option>)}
          </Select>
          <Select label="Section" value={editForm.section || 'A'} onChange={(e) => setEditForm({ ...editForm, section: e.target.value })}>
            {['A','B','C','D'].map((s) => <option key={s} value={s}>Section {s}</option>)}
          </Select>
          <div className="sm:col-span-2">
            <TextArea label="Address" value={editForm.address || ''} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
