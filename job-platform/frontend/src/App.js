import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import EmployerDashboard from './pages/EmployerDashboard';
import JobSeekerDashboard from './pages/JobSeekerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import JobDetails from './pages/JobDetails';
import AuthPage from './pages/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';
import ProfilePage from './pages/ProfilePage';
import { Toaster } from 'react-hot-toast';
import CompanyPage from './pages/CompanyPage';

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['employer']} />}>
            <Route path="/employer/*" element={<EmployerDashboard />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['jobseeker']} />}>
            <Route path="/jobseeker/*" element={<JobSeekerDashboard />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/*" element={<AdminDashboard />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;