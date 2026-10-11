import { useEffect, useState } from 'react';
import { Users, GraduationCap, BookOpen, ClipboardList, TrendingUp, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Student, Course, Subject } from '@/types';
import Card, { CardHeader } from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import { type Page } from '@/components/Layout';

interface DashboardProps {
  onNavigate: (page: Page, params?: { studentId?: string }) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    async function load() {
      const [s, c, sub] = await Promise.all([
        supabase.from('students').select('*'),
        supabase.from('courses').select('*'),
        supabase.from('subjects').select('*'),
      ]);
      setStudents(s.data || []);
      setCourses(c.data || []);
      setSubjects(sub.data || []);
      setLoading(false);
    }
    load();
  }, []);

  const stats = [
    { label: 'Total Students', value: students.length, icon: <Users size={22} />, color: 'bg-brand-50 text-brand-600', page: 'students' as Page },
    { label: 'Active Courses', value: courses.length, icon: <GraduationCap size={22} />, color: 'bg-success-50 text-success-600', page: 'courses' as Page },
    { label: 'Subjects', value: subjects.length, icon: <BookOpen size={22} />, color: 'bg-warning-50 text-warning-600', page: 'subjects' as Page },
    { label: 'Departments', value: new Set(courses.map((c) => c.department)).size, icon: <ClipboardList size={22} />, color: 'bg-purple-50 text-purple-600', page: 'courses' as Page },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Welcome back, Admin</h1>
        <p className="text-sm text-slate-500 mt-1">Here's what's happening at your college today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow cursor-pointer" >
            <div className="flex items-center justify-between" onClick={() => onNavigate(stat.page)}>
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">
                  {loading ? <span className="inline-block w-12 h-8 bg-slate-100 rounded animate-pulse" /> : stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Recent Students"
            subtitle="Recently enrolled students"
            icon={<Users size={20} />}
            action={
              <button onClick={() => onNavigate('students')} className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                View all <ArrowRight size={14} />
              </button>
            }
          />
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-slate-100" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-slate-100 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : students.length === 0 ? (
            <EmptyState icon={<Users size={28} />} title="No students yet" description="Students will appear here once added." />
          ) : (
            <div className="space-y-1">
              {students.slice(0, 5).map((student) => (
                <button
                  key={student.id}
                  onClick={() => onNavigate('student-profile', { studentId: student.id })}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                    {student.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 truncate">{student.name}</p>
                    <p className="text-xs text-slate-500 truncate">{student.student_id} · Semester {student.semester}</p>
                  </div>
                  <ArrowRight size={16} className="text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Courses Overview"
            subtitle="All active courses"
            icon={<GraduationCap size={20} />}
            action={
              <button onClick={() => onNavigate('courses')} className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                Manage <ArrowRight size={14} />
              </button>
            }
          />
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <EmptyState icon={<GraduationCap size={28} />} title="No courses yet" description="Courses will appear here once added." />
          ) : (
            <div className="space-y-2">
              {courses.slice(0, 5).map((course) => {
                const count = students.filter((s) => s.course_id === course.id).length;
                return (
                  <div key={course.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{course.name}</p>
                      <p className="text-xs text-slate-500 truncate">{course.course_id} · {course.department}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-white px-2 py-1 rounded-md">
                        <TrendingUp size={12} /> {count} students
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
