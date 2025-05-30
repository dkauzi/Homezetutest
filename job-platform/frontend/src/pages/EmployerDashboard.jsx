import React, { useEffect, useState } from 'react';
import { useSupabase } from '../context/SupabaseContext';
import JobPostForm from '../components/JobPostForm';

export default function EmployerDashboard() {
  const { user, supabase, loading } = useSupabase();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);

  // Fetch all jobs posted by this employer
  useEffect(() => {
    if (!user) return;
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('employer_id', user.id);
      if (error) setError(error.message);
      else setJobs(data || []);
    };
    fetchJobs();
  }, [supabase, user]);

  // Fetch all applications for this employer's jobs
  useEffect(() => {
    if (!user) return;
    const fetchApplications = async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('*, profiles(*)')
        .in('job_id', jobs.map(j => j.id));
      if (error) setError(error.message);
      else setApplications(data || []);
    };
    if (jobs.length > 0) fetchApplications();
    else setApplications([]);
  }, [supabase, user, jobs]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  // Group applications by job id
  const appsByJob = {};
  applications.forEach(app => {
    if (!appsByJob[app.job_id]) appsByJob[app.job_id] = [];
    appsByJob[app.job_id].push(app);
  });

  return (
    <div className="max-w-5xl mx-auto p-8">
      <JobPostForm />
      <h1 className="text-2xl font-bold mb-6">Your Job Postings & Applicants</h1>
      {jobs.length === 0 ? (
        <div>No jobs posted yet.</div>
      ) : (
        jobs.map(job => (
          <div key={job.id} className="mb-8 bg-white rounded-xl shadow border p-6">
            <h2 className="text-xl font-semibold text-primary mb-2">{job.title}</h2>
            <p className="mb-2 text-gray-700">{job.description}</p>
            <h3 className="font-semibold mb-2">Applicants:</h3>
            {(appsByJob[job.id]?.length ?? 0) === 0 ? (
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
                  </tr>
                </thead>
                <tbody>
                  {appsByJob[job.id].map(app => (
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
                      <td className="border px-4 py-2">{app.status || 'Submitted'}</td>
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