// src/pages/EmployerDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useSupabase } from '../context/SupabaseContext';

export default function EmployerDashboard() {
  const { getApplications, loading } = useSupabase();
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const apps = await getApplications();
        setApplications(apps);
      } catch (err) {
        setError(err.message || 'Failed to load applications');
      }
    };
    loadData();
  }, [getApplications]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Submitted Applications</h1>
      {applications.length === 0 ? (
        <div>No applications found for your jobs.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Applicant Email</th>
                <th className="px-4 py-2 text-left">Job Title</th>
                <th className="px-4 py-2 text-left">Submitted</th>
                <th className="px-4 py-2 text-left">Original Resume</th>
                <th className="px-4 py-2 text-left">Optimized Resume</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app.id}>
                  <td className="border px-4 py-2">{app.profiles?.email}</td>
                  <td className="border px-4 py-2">{app.jobs?.title}</td>
                  <td className="border px-4 py-2">{new Date(app.created_at).toLocaleString()}</td>
                  <td className="border px-4 py-2 whitespace-pre-wrap max-w-xs">{app.original_resume}</td>
                  <td className="border px-4 py-2 whitespace-pre-wrap max-w-xs">{app.optimized_resume}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}