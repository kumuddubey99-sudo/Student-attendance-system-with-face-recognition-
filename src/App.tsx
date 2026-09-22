import React, { useState, useEffect, useCallback } from 'react';
import { User } from './types';
import { getStoredToken, getStoredUser, clearAuth, api } from './services/api';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { ToastContainer, ToastMessage } from './components/Toast';
import { PrivacyNotice } from './components/PrivacyNotice';
import { ProjectDocsModal } from './pages/ProjectDocsModal';

// Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import { AddStudentPage } from './pages/AddStudentPage';
import { StudentDetailsPage } from './pages/StudentDetailsPage';
import { RegisterFacePage } from './pages/RegisterFacePage';
import { MarkAttendancePage } from './pages/MarkAttendancePage';
import { AttendancePage } from './pages/AttendancePage';
import { ReportsPage } from './pages/ReportsPage';
import { ProfilePage } from './pages/ProfilePage';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser());
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [navParams, setNavParams] = useState<any>(null);

  // Modals & Drawers
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isPrivacyNoticeOpen, setIsPrivacyNoticeOpen] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (type: 'success' | 'error' | 'info', title: string, message: string) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
      setToasts((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Verify auth on mount
  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      api.getCurrentUser()
        .then((user) => setCurrentUser(user))
        .catch(() => {
          clearAuth();
          setCurrentUser(null);
        });
    }

    const handleAuthLogout = () => {
      setCurrentUser(null);
      setAuthView('login');
    };

    window.addEventListener('auth_logout', handleAuthLogout);
    return () => window.removeEventListener('auth_logout', handleAuthLogout);
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentTab('dashboard');
    addToast('success', 'Welcome Back', `Logged in as ${user.full_name} (${user.role})`);
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setAuthView('login');
    addToast('info', 'Logged Out', 'You have been signed out.');
  };

  const handleNavigate = (tab: NavTab, params?: any) => {
    if (tab === 'documentation') {
      setIsDocsModalOpen(true);
      return;
    }
    setNavParams(params || null);
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Unauthenticated view
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-neutral-900 font-sans text-neutral-100 antialiased selection:bg-indigo-500 selection:text-white">
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        <PrivacyNotice
          isOpen={isPrivacyNoticeOpen}
          onClose={() => setIsPrivacyNoticeOpen(false)}
        />
        <ProjectDocsModal
          isOpen={isDocsModalOpen}
          onClose={() => setIsDocsModalOpen(false)}
        />

        {authView === 'login' ? (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onNavigateRegister={() => setAuthView('register')}
            onShowDocs={() => setIsDocsModalOpen(true)}
          />
        ) : (
          <RegisterPage
            onNavigateLogin={() => setAuthView('login')}
            onShowNotification={addToast}
          />
        )}
      </div>
    );
  }

  // Authenticated Dashboard Suite
  return (
    <div className="min-h-screen bg-neutral-100/60 font-sans text-neutral-900 antialiased flex selection:bg-indigo-500 selection:text-white">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Modals */}
      <PrivacyNotice
        isOpen={isPrivacyNoticeOpen}
        onClose={() => setIsPrivacyNoticeOpen(false)}
      />
      <ProjectDocsModal
        isOpen={isDocsModalOpen}
        onClose={() => setIsDocsModalOpen(false)}
      />

      {/* Sidebar navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleNavigate}
        currentUser={currentUser}
        onLogout={handleLogout}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          currentTab={currentTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onNavigate={handleNavigate}
          onShowPrivacy={() => setIsPrivacyNoticeOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardPage
              onNavigate={handleNavigate}
              onShowNotification={addToast}
            />
          )}

          {currentTab === 'students' && (
            <StudentsPage
              onNavigate={handleNavigate}
              onShowNotification={addToast}
            />
          )}

          {currentTab === 'add-student' && (
            <AddStudentPage
              onNavigate={handleNavigate}
              onShowNotification={addToast}
            />
          )}

          {currentTab === 'student-details' && (
            <StudentDetailsPage
              studentId={navParams?.studentId ?? null}
              onNavigate={handleNavigate}
              onShowNotification={addToast}
            />
          )}

          {currentTab === 'register-face' && (
            <RegisterFacePage
              initialStudentId={navParams?.studentId ?? null}
              onNavigate={handleNavigate}
              onShowNotification={addToast}
            />
          )}

          {currentTab === 'mark-attendance' && (
            <MarkAttendancePage
              onNavigate={handleNavigate}
              onShowNotification={addToast}
            />
          )}

          {currentTab === 'attendance' && (
            <AttendancePage
              onNavigate={handleNavigate}
              onShowNotification={addToast}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsPage
              onNavigate={handleNavigate}
              onShowNotification={addToast}
            />
          )}

          {currentTab === 'profile' && (
            <ProfilePage
              currentUser={currentUser}
              onNavigate={handleNavigate}
              onShowDocs={() => setIsDocsModalOpen(true)}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
