import React, { useState, useEffect } from 'react';
import { Menu, Clock, Calendar, ShieldCheck, UserPlus, Camera } from 'lucide-react';
import { NavTab } from './Sidebar';

interface HeaderProps {
  currentTab: NavTab;
  onOpenMobileSidebar: () => void;
  onNavigate: (tab: NavTab) => void;
  onShowPrivacy: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileSidebar,
  onNavigate,
  onShowPrivacy,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const titles: Record<NavTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Attendance Dashboard',
      subtitle: 'Real-time overview of student attendance & daily analytics',
    },
    students: {
      title: 'Student Directory',
      subtitle: 'Manage enrolled students and biometric registration profiles',
    },
    'add-student': {
      title: 'Add New Student',
      subtitle: 'Register student details into the institutional database',
    },
    'student-details': {
      title: 'Student Profile & Records',
      subtitle: 'Comprehensive attendance history and percentage analytics',
    },
    'register-face': {
      title: 'Register Student Face',
      subtitle: 'Capture camera samples to generate ArcFace/SFace deep embeddings',
    },
    'mark-attendance': {
      title: 'Mark Attendance (Live AI Recognition)',
      subtitle: 'Automated biometric attendance matching via camera stream',
    },
    attendance: {
      title: 'Attendance Log',
      subtitle: 'Verified attendance history, date filters, and records',
    },
    reports: {
      title: 'Reports & Export',
      subtitle: 'Daily & student-wise reports with one-click CSV export',
    },
    profile: {
      title: 'User Profile & System Info',
      subtitle: 'Account details and BSc IT project architecture configuration',
    },
    documentation: {
      title: 'Project Documentation',
      subtitle: 'Complete BSc IT Project report, system flow & viva notes',
    },
  };

  const current = titles[currentTab] || { title: 'AI Attendance System', subtitle: 'Academic Attendance System' };

  return (
    <header
      id="app-top-header"
      className="bg-white border-b border-neutral-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs"
    >
      <div className="flex items-center gap-3">
        <button
          id="open-mobile-sidebar-button"
          onClick={onOpenMobileSidebar}
          className="md:hidden text-neutral-600 hover:text-neutral-900 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-neutral-900 tracking-tight leading-tight">
            {current.title}
          </h2>
          <p className="text-xs text-neutral-500 hidden sm:block leading-none mt-0.5">
            {current.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live Clock & Calendar */}
        <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-600">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            <span className="font-medium text-neutral-700">{dateStr}</span>
          </div>
          <span className="text-neutral-300">|</span>
          <div className="flex items-center gap-1.5 font-mono text-neutral-800">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-semibold">{timeStr}</span>
          </div>
        </div>

        {/* Quick action buttons on header if not already on that tab */}
        {currentTab !== 'add-student' && (
          <button
            id="header-add-student-button"
            onClick={() => onNavigate('add-student')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg shadow-2xs transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5 text-neutral-500" />
            <span>Add Student</span>
          </button>
        )}

        {currentTab !== 'mark-attendance' && (
          <button
            id="header-mark-attendance-button"
            onClick={() => onNavigate('mark-attendance')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Mark Attendance</span>
          </button>
        )}

        {/* Privacy Notice trigger */}
        <button
          id="header-privacy-button"
          onClick={onShowPrivacy}
          title="Biometric Privacy Notice"
          className="text-neutral-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
          aria-label="View Privacy Policy"
        >
          <ShieldCheck className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
