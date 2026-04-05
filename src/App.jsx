import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider }           from '@/context/AuthContext';
import { ActivityProvider }       from '@/context/ActivityContext';
import ProtectedRoute             from '@/components/ui/ProtectedRoute';

import LandingPage                from './pages/LandingPage';
import LoginPage                  from './pages/LoginPage';
import SignupPage                 from './pages/SignupPage';
import StudentDashboard           from './pages/StudentDashboard';
import ActivitiesPage             from './pages/ActivitiesPage';
import ActivityDetailPage         from './pages/ActivityDetailPage';
import ParticipationTrackerPage   from './pages/ParticipationTrackerPage';
import AdminDashboard             from './pages/AdminDashboard';
import NotificationsPage          from './pages/NotificationsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/"       element={<LandingPage />} />
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Student routes — ActivityProvider scoped here so it only fetches for students */}
          <Route path="/activities"    element={<ActivityProvider><ProtectedRoute element={<ActivitiesPage />} /></ActivityProvider>} />
          <Route path="/activity/:id"  element={<ActivityProvider><ProtectedRoute element={<ActivityDetailPage />} /></ActivityProvider>} />

          {/* Student-only */}
          <Route path="/student/dashboard"     element={<ActivityProvider><ProtectedRoute requiredRole="STUDENT" element={<StudentDashboard />} /></ActivityProvider>} />
          <Route path="/student/participation" element={<ProtectedRoute requiredRole="STUDENT" element={<ParticipationTrackerPage />} />} />
          <Route path="/student/notifications" element={<ProtectedRoute requiredRole="STUDENT" element={<NotificationsPage />} />} />

          {/* Admin-only — no ActivityProvider needed */}
          <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="ADMIN" element={<AdminDashboard />} />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
