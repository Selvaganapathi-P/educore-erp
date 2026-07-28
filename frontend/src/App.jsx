import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

// Public website
import PublicLayout   from './layouts/PublicLayout';
import HomePage       from './pages/public/HomePage';
import AboutPage      from './pages/public/AboutPage';
import FacilitiesPage from './pages/public/FacilitiesPage';
import GalleryPage    from './pages/public/GalleryPage';
import ContactPage    from './pages/public/ContactPage';

// Auth
import LoginPage from './pages/auth/LoginPage';

// Admin portal
import AdminLayout         from './layouts/AdminLayout';
import AdminDashboard      from './pages/admin/AdminDashboard';
import StudentsPage        from './pages/admin/StudentsPage';
import StudentFormPage     from './pages/admin/StudentFormPage';
import StudentDetailPage   from './pages/admin/StudentDetailPage';
import AttendancePage      from './pages/admin/AttendancePage';
import ResultsPage         from './pages/admin/ResultsPage';
import FeesPage            from './pages/admin/FeesPage';
import AnnouncementsPage   from './pages/admin/AnnouncementsPage';

// Student portal
import StudentLayout      from './layouts/StudentLayout';
import StudentDashboard   from './pages/student/StudentDashboard';
import StudentProfilePage from './pages/student/ProfilePage';
import StudentAttendance  from './pages/student/AttendancePage';
import StudentResults     from './pages/student/ResultsPage';
import StudentFees        from './pages/student/FeesPage';

function RequireAuth({ role, children }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public website */}
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about"       element={<AboutPage />} />
        <Route path="facilities"  element={<FacilitiesPage />} />
        <Route path="gallery"     element={<GalleryPage />} />
        <Route path="contact"     element={<ContactPage />} />
      </Route>

      {/* Auth */}
      <Route path="login" element={<LoginPage />} />

      {/* Admin portal */}
      <Route path="admin" element={<RequireAuth role="admin"><AdminLayout /></RequireAuth>}>
        <Route index                    element={<AdminDashboard />} />
        <Route path="students"          element={<StudentsPage />} />
        <Route path="students/new"      element={<StudentFormPage />} />
        <Route path="students/:id"      element={<StudentDetailPage />} />
        <Route path="students/:id/edit" element={<StudentFormPage />} />
        <Route path="attendance"        element={<AttendancePage />} />
        <Route path="results"           element={<ResultsPage />} />
        <Route path="fees"              element={<FeesPage />} />
        <Route path="announcements"     element={<AnnouncementsPage />} />
      </Route>

      {/* Student portal */}
      <Route path="student" element={<RequireAuth role="student"><StudentLayout /></RequireAuth>}>
        <Route index             element={<StudentDashboard />} />
        <Route path="profile"    element={<StudentProfilePage />} />
        <Route path="attendance" element={<StudentAttendance />} />
        <Route path="results"    element={<StudentResults />} />
        <Route path="fees"       element={<StudentFees />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
