// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SupabaseProvider } from './context/SupabaseContext';
import HomePage from './pages/HomePage';
import EmployerDashboard from './pages/EmployerDashboard';
import JobSeekerDashboard from './pages/JobSeekerDashboard';
import JobDetails from './pages/JobDetails';
import AuthPage from './pages/AuthPage';
import ProtectedRoute from './components/ProtectedRoute'; // Changed to default import

function App() {
  return (
    <SupabaseProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          
          {/* Updated ProtectedRoute usage */}
          <Route element={
            <ProtectedRoute allowedRoles={['employer']}>
              <EmployerDashboard />
            </ProtectedRoute>
          }>
            <Route path="/employer/*" element={<EmployerDashboard />} />
          </Route>

          <Route element={
            <ProtectedRoute allowedRoles={['jobseeker']}>
              <JobSeekerDashboard />
            </ProtectedRoute>
          }>
            <Route path="/jobseeker/*" element={<JobSeekerDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </SupabaseProvider>
  );
}

export default App;