// src/pages/EmployerDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useSupabase } from '../context/SupabaseContext';
import JobPostForm from '../components/JobPostForm';

export default function EmployerDashboard() {
  const { getApplications, loading, user, supabase } = useSupabase();
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);

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

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  // Group applications by job
  const jobsMap = {};
  applications.forEach(app => {
    if (!jobsMap[app.jobs.id]) {
      jobsMap[app.jobs.id] = {
        job: app.jobs,
        applicants: []
      };
    }
    jobsMap[app.jobs.id].applicants.push(app);
  });

  // Accept/Reject handler
  const handleStatusChange = async (appId, status) => {
    await supabase.from('applications').update({ status }).eq('id', appId);
    setApplications(apps =>
      apps.map(a => a.id === appId ? { ...a, status } : a)
    );
    if (selectedApp && selectedApp.id === appId) {
      setSelectedApp({ ...selectedApp, status });
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <JobPostForm />
      <h1 className="text-2xl font-bold mb-6">Your Job Postings & Applicants</h1>
      {Object.keys(jobsMap).length === 0 ? (
        <div>No jobs or applications found.</div>
      ) : (
        Object.values(jobsMap).map(({ job, applicants }) => (
          <div key={job.id} className="mb-8 bg-white rounded-xl shadow border border-trust-mid p-6">
            <h2 className="text-xl font-semibold text-primary mb-2">{job.title}</h2>
            <p className="mb-2 text-gray-700">{job.description}</p>
            <h3 className="font-semibold mb-2">Applicants:</h3>
            {applicants.length === 0 ? (
              <div className="text-gray-500 mb-2">No applications yet.</div>
            ) : (
              <table className="min-w-full bg-white rounded shadow">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Applicant Email</th>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Company</th>
                    <th className="px-4 py-2 text-left">Submitted</th>
                    <th className="px-4 py-2 text-left">Resume</th>
                    <th className="px-4 py-2 text-left">PDF</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.map(app => (
                    <tr
                      key={app.id}
                      className="hover:bg-blue-50 cursor-pointer"
                      onClick={() => setSelectedApp(app)}
                    >
                      <td className="border px-4 py-2">{app.profiles?.email}</td>
                      <td className="border px-4 py-2">{app.profiles?.full_name || '-'}</td>
                      <td className="border px-4 py-2">{app.profiles?.company || '-'}</td>
                      <td className="border px-4 py-2">{new Date(app.created_at).toLocaleString()}</td>
                      <td className="border px-4 py-2 whitespace-pre-wrap max-w-xs">{app.original_resume?.slice(0, 30)}...</td>
                      <td className="border px-4 py-2">
                        {app.pdf_resume ? (
                          <a
                            href={app.pdf_resume}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                            onClick={e => e.stopPropagation()}
                          >
                            View PDF
                          </a>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="border px-4 py-2">
                        {app.status || 'Submitted'}
                      </td>
                      <td className="border px-4 py-2" onClick={e => e.stopPropagation()}>
                        {app.status === 'Accepted' ? (
                          <span className="text-green-600 font-semibold">Accepted</span>
                        ) : app.status === 'Rejected' ? (
                          <span className="text-red-600 font-semibold">Rejected</span>
                        ) : (
                          <>
                            <button
                              className="bg-green-600 text-white px-2 py-1 rounded mr-2"
                              onClick={() => handleStatusChange(app.id, 'Accepted')}
                            >
                              Accept
                            </button>
                            <button
                              className="bg-red-600 text-white px-2 py-1 rounded"
                              onClick={() => handleStatusChange(app.id, 'Rejected')}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))
      )}

      {/* Applicant Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => setSelectedApp(null)}
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4">Applicant Details</h3>
            <div className="mb-2"><strong>Email:</strong> {selectedApp.profiles?.email}</div>
            <div className="mb-2"><strong>Name:</strong> {selectedApp.profiles?.full_name || '-'}</div>
            <div className="mb-2"><strong>Company:</strong> {selectedApp.profiles?.company || '-'}</div>
            <div className="mb-2"><strong>Status:</strong> {selectedApp.status || 'Submitted'}</div>
            <div className="mb-2"><strong>Submitted:</strong> {new Date(selectedApp.created_at).toLocaleString()}</div>
            <div className="mb-2"><strong>Resume:</strong>
              <div className="bg-gray-100 rounded p-2 mt-1 whitespace-pre-wrap max-h-40 overflow-auto">
                {selectedApp.original_resume}
              </div>
            </div>
            {selectedApp.pdf_resume && (
              <div className="mb-2">
                <strong>PDF Resume:</strong>{' '}
                <a
                  href={selectedApp.pdf_resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View PDF
                </a>
              </div>
            )}
            {selectedApp.answers && Array.isArray(selectedApp.answers) && selectedApp.answers.length > 0 && (
              <div className="mb-2">
                <strong>Answers to Additional Questions:</strong>
                <ul className="list-disc ml-6">
                  {selectedApp.answers.map((ans, idx) => (
                    <li key={idx}>{ans}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-4 flex gap-2">
              {selectedApp.status !== 'Accepted' && (
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded"
                  onClick={() => handleStatusChange(selectedApp.id, 'Accepted')}
                >
                  Accept
                </button>
              )}
              {selectedApp.status !== 'Rejected' && (
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded"
                  onClick={() => handleStatusChange(selectedApp.id, 'Rejected')}
                >
                  Reject
                </button>
              )}
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setSelectedApp(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}