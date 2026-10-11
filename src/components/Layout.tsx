import { type ReactNode, useState } from 'react';
import { LayoutDashboard, Users, GraduationCap, BookOpen, Menu, X, ClipboardList } from 'lucide-react';

export type Page = 'dashboard' | 'students' | 'student-profile' | 'courses' | 'subjects';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const navItems: { id: Page; label: string; icon: ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'students', label: 'Students', icon: <Users size={20} /> },
  { id: 'courses', label: 'Courses', icon: <GraduationCap size={20} /> },
  { id: 'subjects', label: 'Subjects', icon: <BookOpen size={20} /> },
];

export default function Sidebar({ currentPage, onNavigate, mobileOpen, onCloseMobile }: SidebarProps) {
  const isActive = (id: Page) =>
    currentPage === id || (id === 'students' && currentPage === 'student-profile');

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden" onClick={onCloseMobile} />
      )}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-slate-900 text-white flex flex-col z-40 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shrink-0">
            <GraduationCap size={24} />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold leading-tight truncate">College Admin</h1>
            <p className="text-xs text-slate-400">Management System</p>
          </div>
          <button onClick={onCloseMobile} className="ml-auto lg:hidden text-slate-400">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Menu</p>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive(item.id)
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/50">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-semibold text-sm">
              AD
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin User</p>
              <p className="text-xs text-slate-400 truncate">Administrator</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

interface TopBarProps {
  title: string;
  subtitle?: string;
  onOpenSidebar: () => void;
  onNavigate: (page: Page) => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export function TopBar({ title, subtitle, onOpenSidebar, onNavigate, searchPlaceholder, searchValue, onSearchChange }: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onOpenSidebar} className="lg:hidden text-slate-600 hover:text-slate-900">
            <Menu size={22} />
          </button>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-800 truncate">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 truncate hidden sm:block">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {onSearchChange && (
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder || 'Search...'}
              className="hidden md:block w-56 lg:w-64 rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            />
          )}
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
            title="Dashboard"
          >
            <LayoutDashboard size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
