import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

// Auth pages
import LoginPage          from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage  from './pages/auth/ResetPasswordPage';

// Layouts
import AppLayout         from './components/layout/AppLayout';
import { SuperAdminLayout } from './components/layout/SuperAdminLayout';

// Dashboard
import DashboardPage from './pages/dashboard/DashboardPage';

// Super Admin pages
import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard';
import SchoolsPage         from './pages/super-admin/SchoolsPage';
import SchoolFormPage      from './pages/super-admin/SchoolFormPage';
import SchoolDetailPage    from './pages/super-admin/SchoolDetailPage';

// School Admin pages
import SettingsPage from './pages/school-admin/settings/SettingsPage';

// User & Role management
import UsersPage from './pages/users/UsersPage';
import RolesPage from './pages/users/RolesPage';

// Admissions
import AdmissionsPage      from './pages/admissions/AdmissionsPage';
import AdmissionFormPage   from './pages/admissions/AdmissionFormPage';
import AdmissionDetailPage from './pages/admissions/AdmissionDetailPage';

// Students
import StudentsPage      from './pages/students/StudentsPage';
import StudentDetailPage from './pages/students/StudentDetailPage';
import StudentFormPage   from './pages/students/StudentFormPage';

// Staff
import StaffPage      from './pages/staff/StaffPage';
import StaffDetailPage from './pages/staff/StaffDetailPage';
import StaffFormPage   from './pages/staff/StaffFormPage';

// Academics
import AcademicYearsPage from './pages/academics/AcademicYearsPage';
import ClassesPage       from './pages/academics/ClassesPage';
import SubjectsPage      from './pages/academics/SubjectsPage';
import TimetablePage     from './pages/academics/TimetablePage';

// Attendance
import MarkAttendancePage    from './pages/attendance/MarkAttendancePage';
import AttendanceReportPage      from './pages/attendance/AttendanceReportPage';
import StaffAttendancePage        from './pages/attendance/StaffAttendancePage';

// Exams
import ExamsPage        from './pages/exams/ExamsPage';
import ExamFormPage     from './pages/exams/ExamFormPage';
import MarkEntryPage    from './pages/exams/MarkEntryPage';
import ExamResultsPage  from './pages/exams/ExamResultsPage';

// Homework
import HomeworkPage        from './pages/homework/HomeworkPage';
import HomeworkFormPage    from './pages/homework/HomeworkFormPage';
import HomeworkDetailPage  from './pages/homework/HomeworkDetailPage';
import StudentHomeworkPage from './pages/homework/StudentHomeworkPage';

// Fees
import FeeDashboard      from './pages/fees/FeeDashboard';
import FeeStructuresPage from './pages/fees/FeeStructuresPage';
import FeeCollectionPage from './pages/fees/FeeCollectionPage';
import OutstandingPage   from './pages/fees/OutstandingPage';
import StudentFeePage    from './pages/fees/StudentFeePage';

// Transport
import TransportDashboard    from './pages/transport/TransportDashboard';
import VehiclesPage          from './pages/transport/VehiclesPage';
import RoutesPage            from './pages/transport/RoutesPage';
import StudentTransportPage  from './pages/transport/StudentTransportPage';

// Library
import LibraryDashboard from './pages/library/LibraryDashboard';
import BooksPage        from './pages/library/BooksPage';
import BookIssuePage    from './pages/library/BookIssuePage';

// Communication
import AnnouncementsPage    from './pages/communication/AnnouncementsPage';
import AnnouncementFormPage from './pages/communication/AnnouncementFormPage';
import MessagesPage         from './pages/communication/MessagesPage';

// Hostel
import HostelDashboard  from './pages/hostel/HostelDashboard';
import HostelsPage      from './pages/hostel/HostelsPage';
import RoomsPage        from './pages/hostel/RoomsPage';
import AllotmentsPage   from './pages/hostel/AllotmentsPage';

// Inventory
import InventoryDashboard  from './pages/inventory/InventoryDashboard';
import ItemsPage           from './pages/inventory/ItemsPage';
import StockMovementsPage  from './pages/inventory/StockMovementsPage';

// Health
import HealthDashboard    from './pages/health/HealthDashboard';
import HealthRecordsPage  from './pages/health/HealthRecordsPage';
import MedicalVisitsPage  from './pages/health/MedicalVisitsPage';

// Events & Certificates
import EventsDashboard    from './pages/events/EventsDashboard';
import EventsPage         from './pages/events/EventsPage';
import CertificatesPage   from './pages/events/CertificatesPage';

// Reports
import ReportsDashboard      from './pages/reports/ReportsDashboard';
import AttendanceRptPage     from './pages/reports/AttendanceReportPage';
import FeeReportPage         from './pages/reports/FeeReportPage';
import AcademicReportPage    from './pages/reports/AcademicReportPage';
import StudentReportPage     from './pages/reports/StudentReportPage';

// AI
import AIDashboard         from './pages/ai/AIDashboard';
import AIChatPage          from './pages/ai/AIChatPage';
import AIInsightsPage      from './pages/ai/AIInsightsPage';
import ContentGeneratorPage from './pages/ai/ContentGeneratorPage';

// Error pages
import NotFoundPage  from './pages/errors/NotFoundPage';
import ForbiddenPage from './pages/errors/ForbiddenPage';

const PrivateRoute = ({ children }) => {
  const { accessToken } = useAuthStore();
  return accessToken ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { accessToken } = useAuthStore();
  return !accessToken ? children : <Navigate to="/" replace />;
};

const SuperAdminRoute = ({ children }) => {
  const { accessToken, user } = useAuthStore();
  if (!accessToken) return <Navigate to="/login" replace />;
  if (user?.role !== 'super_admin') return <Navigate to="/403" replace />;
  return children;
};

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"           element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      <Route path="/reset-password"  element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />

      {/* Super Admin console */}
      <Route path="/super-admin" element={<SuperAdminRoute><SuperAdminLayout /></SuperAdminRoute>}>
        <Route index              element={<SuperAdminDashboard />} />
        <Route path="schools"     element={<SchoolsPage />} />
        <Route path="schools/new" element={<SchoolFormPage />} />
        <Route path="schools/:id" element={<SchoolDetailPage />} />
        <Route path="schools/:id/edit" element={<SchoolFormPage />} />
      </Route>

      {/* School portal — inside AppLayout */}
      <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route index              element={<DashboardPage />} />
        <Route path="settings"    element={<SettingsPage />} />
        <Route path="users"       element={<UsersPage />} />
        <Route path="users/roles" element={<RolesPage />} />
        <Route path="admissions"          element={<AdmissionsPage />} />
        <Route path="admissions/new"      element={<AdmissionFormPage />} />
        <Route path="admissions/:id"      element={<AdmissionDetailPage />} />
        <Route path="admissions/:id/edit" element={<AdmissionFormPage />} />

        <Route path="students"          element={<StudentsPage />} />
        <Route path="students/new"      element={<StudentFormPage />} />
        <Route path="students/:id"      element={<StudentDetailPage />} />
        <Route path="students/:id/edit" element={<StudentFormPage />} />

        <Route path="staff"          element={<StaffPage />} />
        <Route path="staff/new"      element={<StaffFormPage />} />
        <Route path="staff/:id"      element={<StaffDetailPage />} />
        <Route path="staff/:id/edit" element={<StaffFormPage />} />

        <Route path="academics/years"     element={<AcademicYearsPage />} />
        <Route path="academics/classes"   element={<ClassesPage />} />
        <Route path="academics/subjects"  element={<SubjectsPage />} />
        <Route path="academics/timetable" element={<TimetablePage />} />

        <Route path="attendance/mark"    element={<MarkAttendancePage />} />
        <Route path="attendance/reports" element={<AttendanceReportPage />} />
        <Route path="attendance/staff"   element={<StaffAttendancePage />} />

        <Route path="exams"                element={<ExamsPage />} />
        <Route path="exams/new"            element={<ExamFormPage />} />
        <Route path="exams/:id"            element={<ExamFormPage />} />
        <Route path="exams/:id/marks"      element={<MarkEntryPage />} />
        <Route path="exams/:id/results"    element={<ExamResultsPage />} />

        <Route path="homework"             element={<HomeworkPage />} />
        <Route path="homework/new"         element={<HomeworkFormPage />} />
        <Route path="homework/student"     element={<StudentHomeworkPage />} />
        <Route path="homework/:id"         element={<HomeworkDetailPage />} />
        <Route path="homework/:id/edit"    element={<HomeworkFormPage />} />

        <Route path="fees"             element={<FeeDashboard />} />
        <Route path="fees/structures"  element={<FeeStructuresPage />} />
        <Route path="fees/collect"     element={<FeeCollectionPage />} />
        <Route path="fees/outstanding" element={<OutstandingPage />} />
        <Route path="fees/my-fees"     element={<StudentFeePage />} />

        <Route path="transport"           element={<TransportDashboard />} />
        <Route path="transport/vehicles" element={<VehiclesPage />} />
        <Route path="transport/routes"   element={<RoutesPage />} />
        <Route path="transport/students" element={<StudentTransportPage />} />

        <Route path="library"         element={<LibraryDashboard />} />
        <Route path="library/books"  element={<BooksPage />} />
        <Route path="library/issue"  element={<BookIssuePage />} />

        <Route path="communication/announcements"          element={<AnnouncementsPage />} />
        <Route path="communication/announcements/new"      element={<AnnouncementFormPage />} />
        <Route path="communication/announcements/:id/edit" element={<AnnouncementFormPage />} />
        <Route path="communication/messages"               element={<MessagesPage />} />

        <Route path="hostel"             element={<HostelDashboard />} />
        <Route path="hostel/hostels"     element={<HostelsPage />} />
        <Route path="hostel/rooms"       element={<RoomsPage />} />
        <Route path="hostel/allotments"  element={<AllotmentsPage />} />

        <Route path="inventory"            element={<InventoryDashboard />} />
        <Route path="inventory/items"      element={<ItemsPage />} />
        <Route path="inventory/movements"  element={<StockMovementsPage />} />

        <Route path="health"          element={<HealthDashboard />} />
        <Route path="health/records"  element={<HealthRecordsPage />} />
        <Route path="health/visits"   element={<MedicalVisitsPage />} />

        <Route path="events"               element={<EventsDashboard />} />
        <Route path="events/list"          element={<EventsPage />} />
        <Route path="events/certificates"  element={<CertificatesPage />} />

        <Route path="reports"               element={<ReportsDashboard />} />
        <Route path="reports/attendance"    element={<AttendanceRptPage />} />
        <Route path="reports/fees"          element={<FeeReportPage />} />
        <Route path="reports/academic"      element={<AcademicReportPage />} />
        <Route path="reports/students"      element={<StudentReportPage />} />

        <Route path="ai"              element={<AIDashboard />} />
        <Route path="ai/chat"         element={<AIChatPage />} />
        <Route path="ai/insights"     element={<AIInsightsPage />} />
        <Route path="ai/content"      element={<ContentGeneratorPage />} />

        <Route path="403"         element={<ForbiddenPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
