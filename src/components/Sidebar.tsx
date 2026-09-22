import React from 'react';
import {
  LayoutDashboard,
  Users,
  ScanFace,
  Camera,
  ClipboardCheck,
  FileSpreadsheet,
  UserCheck,
  LogOut,
  GraduationCap,
  BookOpen,
  Shield,
  X
} from 'lucide-react';
import { User } from '../types';

export type NavTab =
  | 'dashboard'
  | 'students'
  | 'add-student'
  | 'student-details'
  | 'register-face'
  | 'mark-attendance'
  | 'attendance'
  | 'reports'
  | 'profile'
  | 'documentation';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentUser: User | null;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onLogout,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students' as NavTab, label: 'Students', icon: Users },
    { id: 'register-face' as NavTab, label: 'Register Face', icon: ScanFace },
    { id: 'mark-attendance' as NavTab, label: 'Mark Attendance', icon: Camera },
    { id: 'attendance' as NavTab, label: 'Attendance', icon: ClipboardCheck },
    { id: 'reports' as NavTab, label: 'Reports', icon: FileSpreadsheet },
    { id: 'profile' as NavTab, label: 'Profile', icon: UserCheck },
    { id: 'documentation' as NavTab, label: 'Project Docs', icon: BookOpen },
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          id="sidebar-mobile-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-neutral-900 text-neutral-200 flex flex-col border-r border-neutral-800 transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header Branding */}
        <div className="p-5 border-b border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/90 text-white flex items-center justify-center shadow-md">
              <ScanFace className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-white flex items-center gap-1.5">
                AI Attendance
                <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  BSc IT
                </span>
              </h1>
              <p className="text-[11px] text-neutral-400 truncate max-w-[170px]">
                Face Recognition System
              </p>
            </div>
          </div>
          <button
            id="close-mobile-sidebar-button"
            onClick={onCloseMobile}
            className="md:hidden text-neutral-400 hover:text-white p-1 rounded-md"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Academic Context Badge */}
        <div className="px-5 py-3 bg-neutral-950/40 border-b border-neutral-800/60 flex items-center gap-2.5 text-xs text-neutral-400">
          <GraduationCap className="w-4 h-4 text-neutral-400 shrink-0" />
          <span className="truncate">Dept. of Information Technology</span>
        </div>

        {/* Navigation Items */}
        <nav id="sidebar-navigation" className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentTab === item.id ||
              (item.id === 'students' && (currentTab === 'add-student' || currentTab === 'student-details'));

            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                <span>{item.label}</span>
                {item.id === 'mark-attendance' && (
                  <span className="ml-auto flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Footer & Logout */}
        <div className="p-4 border-t border-neutral-800/80 bg-neutral-950/50">
          {currentUser && (
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-semibold text-indigo-300 shrink-0">
                  {currentUser.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white truncate">{currentUser.full_name}</p>
                  <p className="text-[10px] text-neutral-400 flex items-center gap-1">
                    <Shield className="w-2.5 h-2.5 text-indigo-400" />
                    {currentUser.role}
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            id="sidebar-logout-button"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-neutral-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg border border-neutral-800 hover:border-rose-900/40 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
