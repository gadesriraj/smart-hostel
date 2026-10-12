import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';

// Warden Pages
import { WardenDashboard } from './pages/warden/WardenDashboard';
import { RoomManagement } from './pages/warden/RoomManagement';
import { ComplaintsManagement } from './pages/warden/ComplaintsManagement';
import { VisitorManagement } from './pages/warden/VisitorManagement';
import { NoticeManagement } from './pages/warden/NoticeManagement';
import { MessFeedbackView } from './pages/warden/MessFeedbackView';
import { StaffManagement } from './pages/warden/StaffManagement';
import { ReportsPage } from './pages/warden/ReportsPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentRoomView } from './pages/student/StudentRoomView';
import { StudentComplaints } from './pages/student/StudentComplaints';
import { StudentVisitors } from './pages/student/StudentVisitors';
import { StudentMessFeedback } from './pages/student/StudentMessFeedback';
import { StudentNotices } from './pages/student/StudentNotices';

// Staff Pages
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { StaffVisitorDesk } from './pages/staff/StaffVisitorDesk';

import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, loading, quickLoginAs } = useAuth();
  const [authView, setAuthView] = useState<'landing' | 'login' | 'register'>('landing');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-600">Loading Smart Hostel Platform...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated routing
  if (!user) {
    if (authView === 'login') {
      return (
        <LoginPage
          onBackToHome={() => setAuthView('landing')}
          onGoToRegister={() => setAuthView('register')}
        />
      );
    }
    if (authView === 'register') {
      return (
        <RegisterPage
          onBackToHome={() => setAuthView('landing')}
          onGoToLogin={() => setAuthView('login')}
        />
      );
    }
    return (
      <LandingPage
        onGoToLogin={() => setAuthView('login')}
        onGoToRegister={() => setAuthView('register')}
        onQuickDemo={async (role) => {
          await quickLoginAs(role);
        }}
      />
    );
  }

  // Active Tab Title Lookup
  const getTabTitle = () => {
    const titles: Record<string, string> = {
      dashboard: user.role === 'warden' ? 'Administrative Dashboard' : user.role === 'staff' ? 'Staff Work Board' : 'Student Overview',
      rooms: 'Hostel Rooms & Allocation',
      room: 'My Room & Roommates',
      complaints: 'Maintenance Complaints',
      visitors: user.role === 'staff' ? 'Security Gate Desk' : 'Visitor Management',
      notices: 'Hostel Digital Notices',
      mess: 'Mess Dining Feedback',
      staff: 'Hostel Staff Directory',
      reports: 'Reports & Analytics',
    };
    return titles[currentTab] || 'Smart Hostel Management';
  };

  // Render role-specific tab content
  const renderTabContent = () => {
    // 1. Warden Views
    if (user.role === 'warden') {
      switch (currentTab) {
        case 'dashboard':
          return <WardenDashboard onNavigateTab={setCurrentTab} />;
        case 'rooms':
          return <RoomManagement />;
        case 'complaints':
          return <ComplaintsManagement />;
        case 'visitors':
          return <VisitorManagement />;
        case 'notices':
          return <NoticeManagement />;
        case 'mess':
          return <MessFeedbackView />;
        case 'staff':
          return <StaffManagement />;
        case 'reports':
          return <ReportsPage />;
        default:
          return <WardenDashboard onNavigateTab={setCurrentTab} />;
      }
    }

    // 2. Staff Views
    if (user.role === 'staff') {
      switch (currentTab) {
        case 'dashboard':
          return <StaffDashboard />;
        case 'visitors':
          return <StaffVisitorDesk />;
        case 'notices':
          return <StudentNotices />;
        default:
          return <StaffDashboard />;
      }
    }

    // 3. Student Views
    switch (currentTab) {
      case 'dashboard':
        return <StudentDashboard onNavigateTab={setCurrentTab} />;
      case 'room':
        return <StudentRoomView />;
      case 'complaints':
        return <StudentComplaints />;
      case 'visitors':
        return <StudentVisitors />;
      case 'mess':
        return <StudentMessFeedback />;
      case 'notices':
        return <StudentNotices />;
      default:
        return <StudentDashboard onNavigateTab={setCurrentTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(true)}
          activeTabTitle={getTabTitle()}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{renderTabContent()}</div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
