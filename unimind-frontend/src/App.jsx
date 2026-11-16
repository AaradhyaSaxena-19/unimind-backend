import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import MobileNav from './components/layout/MobileNav';
import Footer from './components/layout/Footer';

// Pages
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import ParentDashboard from './pages/ParentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ChatPage from './pages/ChatPage';
import TeacherPaperStudio from './pages/TeacherPaperStudio';
import TimetablePage from './pages/TimetablePage';
import AttendancePage from './pages/AttendancePage';
import AssignmentsPage from './pages/AssignmentsPage';
import AssessmentsPage from './pages/AssessmentsPage';
import ExamsPage from './pages/ExamsPage';
import ResultsPage from './pages/ResultsPage';
import FeesPage from './pages/FeesPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import EventsPage from './pages/EventsPage';
import StudyMaterialPage from './pages/StudyMaterialPage';
import MessagesPage from './pages/MessagesPage';
import DocumentsPage from './pages/DocumentsPage';
import ProfilePage from './pages/ProfilePage';
import FacultyAttendancePage from './pages/FacultyAttendancePage';
import CoursesPage from './pages/CoursesPage';
import TeacherDashboard from './pages/TeacherDashboard';
import NotFound from './pages/NotFound';
import LoadingSpinner from './components/common/LoadingSpinner';

// Route protector for authenticated sessions
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner label="Authenticating session..." fullPage />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'student') return <Navigate to="/dashboard" replace />;
    if (role === 'parent') return <Navigate to="/parent/dashboard" replace />;
    if (role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
    if (role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Root redirect based on role
const RootRedirect = () => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner label="Loading UniMind..." fullPage />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'parent') return <Navigate to="/parent/dashboard" replace />;
  if (role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
  if (role === 'admin') return <Navigate to="/admin" replace />;

  return <Navigate to="/dashboard" replace />;
};

function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7FC] text-slate-900">
      <Navbar onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)} />

      <div className="flex-1 flex w-full">
        {user && !isLoginPage && (
          <Sidebar
            isMobileOpen={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
          />
        )}

        <main className={`flex-1 overflow-x-hidden ${user && !isLoginPage ? 'pb-24 lg:pb-8' : ''}`}>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Login />} />

            {/* Student & Shared Academic Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student', 'admin', 'teacher']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/parent/dashboard"
              element={
                <ProtectedRoute allowedRoles={['parent', 'admin']}>
                  <ParentDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/chat"
              element={
                <ProtectedRoute allowedRoles={['student', 'admin', 'teacher']}>
                  <ChatPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/timetable"
              element={
                <ProtectedRoute>
                  <TimetablePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/attendance"
              element={
                <ProtectedRoute>
                  <AttendancePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/assignments"
              element={
                <ProtectedRoute>
                  <AssignmentsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/assessments"
              element={
                <ProtectedRoute>
                  <AssessmentsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/exams"
              element={
                <ProtectedRoute>
                  <ExamsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/results"
              element={
                <ProtectedRoute>
                  <ResultsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/fees"
              element={
                <ProtectedRoute>
                  <FeesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/announcements"
              element={
                <ProtectedRoute>
                  <AnnouncementsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <EventsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/study-material"
              element={
                <ProtectedRoute>
                  <StudyMaterialPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <MessagesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/documents"
              element={
                <ProtectedRoute>
                  <DocumentsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Courses & Curriculum Route */}
            <Route
              path="/courses"
              element={
                <ProtectedRoute>
                  <CoursesPage />
                </ProtectedRoute>
              }
            />

            {/* Teacher & Faculty Routes */}
            <Route
              path="/teacher/dashboard"
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/attendance"
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <FacultyAttendancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/papers"
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <TeacherPaperStudio />
                </ProtectedRoute>
              }
            />

            {/* Admin Hub Route */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>

      {user && !isLoginPage && (
        <MobileNav onOpenSidebar={() => setMobileSidebarOpen(true)} />
      )}

      <div className={user && !isLoginPage ? 'hidden lg:block' : ''}>
        <Footer />
      </div>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
