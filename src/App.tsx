import { useState } from 'react';
import Sidebar, { TopBar, type Page } from '@/components/Layout';
import { ToastContainer } from '@/components/ui/Toast';
import Dashboard from '@/pages/Dashboard';
import StudentsList from '@/pages/StudentsList';
import StudentProfile from '@/pages/StudentProfile';
import CoursesPage from '@/pages/CoursesPage';
import SubjectsPage from '@/pages/SubjectsPage';

const pageMeta: Record<Page, { title: string; subtitle: string; search?: boolean }> = {
  dashboard: { title: 'Dashboard', subtitle: 'College administration overview' },
  students: { title: 'Students', subtitle: 'Manage student records', search: true },
  'student-profile': { title: 'Student Profile', subtitle: 'Detailed student information' },
  courses: { title: 'Courses', subtitle: 'Manage courses and departments', search: true },
  subjects: { title: 'Subjects', subtitle: 'Manage subjects and faculty', search: true },
};

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [studentId, setStudentId] = useState<string | null>(null);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [search, setSearch] = useState('');

  function navigate(p: Page, params?: { studentId?: string }) {
    if (params?.studentId) setStudentId(params.studentId);
    setPage(p);
    setSearch('');
  }

  const meta = pageMeta[page];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        currentPage={page}
        onNavigate={navigate}
        mobileOpen={mobileSidebar}
        onCloseMobile={() => setMobileSidebar(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          title={meta.title}
          subtitle={meta.subtitle}
          onOpenSidebar={() => setMobileSidebar(true)}
          onNavigate={navigate}
          searchPlaceholder={meta.search ? 'Search...' : undefined}
          searchValue={search}
          onSearchChange={meta.search ? setSearch : undefined}
        />
        <main className="flex-1 overflow-y-auto scrollbar-thin p-4 lg:p-6">
          {page === 'dashboard' && <Dashboard onNavigate={navigate} />}
          {page === 'students' && <StudentsList onNavigate={navigate} searchValue={search} onSearchChange={setSearch} />}
          {page === 'student-profile' && studentId && <StudentProfile studentId={studentId} onNavigate={navigate} />}
          {page === 'courses' && <CoursesPage searchValue={search} onSearchChange={setSearch} />}
          {page === 'subjects' && <SubjectsPage searchValue={search} onSearchChange={setSearch} />}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
