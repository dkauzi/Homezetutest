// src/pages/EmployerDashboard.jsx
import { useEffect, useState } from 'react';
import { useSupabase } from '../context/SupabaseContext';

const EmployerDashboard = () => {
  const { user, getEmployerJobs, getApplications } = useSupabase();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [jobsData, appsData] = await Promise.all([
          getEmployerJobs(),
          getApplications()
        ]);

        setJobs(jobsData || []);
        setApplications(appsData || []);
      } catch (error) {
        console.error('Data loading error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) loadData();
  }, [user, getEmployerJobs, getApplications]); // Proper dependencies

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-pulse text-gray-500">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg mx-4">
        <p>Error loading dashboard: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-100 rounded hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Welcome {user.user_metadata?.full_name || 'Employer'}
      </h1>
      
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Your Job Postings ({jobs.length})
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map(job => (
            <div 
              key={job.id}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {job.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {job.description}
              </p>
              <div className="text-sm text-gray-500">
                <p>Location: {job.location || 'Not specified'}</p>
                <p>Salary: {job.salary_range || 'Not specified'}</p>
              </div>
            </div>
          ))}
          {jobs.length === 0 && (
            <div className="text-gray-500 italic">
              No job postings found
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Applications ({applications.length})
        </h2>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Applicant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Applied
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map(app => (
                <tr key={app.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.profiles?.email || 'Unknown applicant'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.jobs?.title || 'Position not available'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {app.status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(app.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    No applications found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default EmployerDashboard;