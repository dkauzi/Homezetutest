import React, { useEffect, useState } from 'react';
import { useSupabase } from '../context/SupabaseContext';
import { useNavigate } from 'react-router-dom';
import JobPostForm from '../components/JobPostForm';

export default function AdminDashboard() {
  const { supabase, user } = useSupabase();
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const navigate = useNavigate();

  // Redirect non-admins
  useEffect(() => {
    if (user?.user_metadata?.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch all users
  useEffect(() => {
    if (user?.user_metadata?.role === 'admin') {
      supabase
        .from('profiles')
        .select('*')
        .then(({ data }) => setUsers(data || []));
    }
  }, [supabase, user]);

  // Fetch all applications with applicant and job info
  useEffect(() => {
    if (user?.user_metadata?.role === 'admin') {
      supabase
        .from('applications')
        .select('*, profiles(*), jobs(*)')
        .then(({ data }) => setApplications(data || []));
    }
  }, [supabase, user]);

  const setStatus = async (userId, isActive) => {
    await supabase.from('profiles').update({ is_active: isActive }).eq('id', userId);
    setUsers(users => users.map(u => u.id === userId ? { ...u, is_active: isActive } : u));
  };

  // Split users by role
  const employers = users.filter(u => u.role === 'employer');
  const employees = users.filter(u => u.role === 'jobseeker');

  // Group applications by job
  const jobsMap = {};
  applications.forEach(app => {
    if (app.jobs) {
      if (!jobsMap[app.jobs.id]) {
        jobsMap[app.jobs.id] = {
          job: app.jobs,
          applicants: []
        };
      }
      jobsMap[app.jobs.id].applicants.push(app);
    }
  });

  // Helper to get employer email for a job
  const getEmployerEmail = (employerId) => {
    const employer = users.find(u => u.id === employerId);
    return employer ? employer.email : employerId;
  };

  // Helper to render status badge
  const StatusBadge = ({ status }) => (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      {status}
    </span>
  );

  // Helper to render application status badge
  const AppStatusBadge = ({ status }) => (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${status === 'Submitted' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );

  // Accept/Reject handler for applications
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
    <div className="max-w-6xl mx-auto p-8">
      <JobPostForm />
      <h1 className="text-2xl font-bold mb-6">Admin: User Management</h1>

      <h2 className="text-xl font-bold mb-4">Employers</h2>
      <table className="min-w-full bg-white rounded shadow mb-8">
        <thead>
          <tr>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Role</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {employers.map(u => (
            <tr key={u.id}>
              <td className="border px-4 py-2">{u.email}</td>
              <td className="border px-4 py-2">{u.role}</td>
              <td className="border px-4 py-2"><StatusBadge status={u.is_active ? 'Active' : 'Disabled'} /></td>
              <td className="border px-4 py-2">
                {u.is_active ? (
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded"
                    onClick={() => setStatus(u.id, false)}
                  >
                    Disable
                  </button>
                ) : (
                  <button
                    className="bg-green-600 text-white px-3 py-1 rounded"
                    onClick={() => setStatus(u.id, true)}
                  >
                    Enable
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-xl font-bold mb-4">Employees</h2>
      <table className="min-w-full bg-white rounded shadow mb-12">
        <thead>
          <tr>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Role</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(u => (
            <tr key={u.id}>
              <td className="border px-4 py-2">{u.email}</td>
              <td className="border px-4 py-2">{u.role}</td>
              <td className="border px-4 py-2"><StatusBadge status={u.is_active ? 'Active' : 'Disabled'} /></td>
              <td className="border px-4 py-2">
                {u.is_active ? (
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded"
                    onClick={() => setStatus(u.id, false)}
                  >
                    Disable
                  </button>
                ) : (
                  <button
                    className="bg-green-600 text-white px-3 py-1 rounded"
                    onClick={() => setStatus(u.id, true)}
                  >
                    Enable
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-xl font-bold mb-4">Jobs & Applicants</h2>
      {Object.keys(jobsMap).length === 0 ? (
        <div className="mb-8">No jobs or applications found.</div>
      ) : (
        Object.values(jobsMap).map(({ job, applicants }) => (
          <div key={job.id} className="mb-8 bg-white rounded-xl shadow border border-trust-mid p-6">
            <h3 className="text-lg font-semibold text-primary mb-2">{job.title}</h3>
            <p className="mb-2 text-gray-700">{job.description}</p>
            <div className="mb-2 text-sm text-gray-500">
              Posted by: <span className="font-semibold">{getEmployerEmail(job.employer_id)}</span>
            </div>
            <h4 className="font-semibold mb-2">Applicants:</h4>
            {applicants.length === 0 ? (
              <div className="text-gray-500 mb-2">No applications yet.</div>
            ) : (
              <table className="min-w-full bg-white rounded shadow mb-4">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Applicant Email</th>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Company</th>
                    <th className="px-4 py-2 text-left">Applicant Status</th>
                    <th className="px-4 py-2 text-left">Application Status</th>
                    <th className="px-4 py-2 text-left">Submitted</th>
                    <th className="px-4 py-2 text-left">Resume</th>
                    <th className="px-4 py-2 text-left">PDF</th>
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
                      <td className="border px-4 py-2"><StatusBadge status={app.profiles?.is_active ? 'Active' : 'Disabled'} /></td>
                      <td className="border px-4 py-2"><AppStatusBadge status={app.status || 'Submitted'} /></td>
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

      <h2 className="text-xl font-bold mb-4">All Applications</h2>
      <table className="min-w-full bg-white rounded shadow">
        <thead>
          <tr>
            <th className="px-4 py-2">Applicant Email</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Company</th>
            <th className="px-4 py-2">Applicant Status</th>
            <th className="px-4 py-2">Job Title</th>
            <th className="px-4 py-2">Application Status</th>
            <th className="px-4 py-2">Submitted</th>
            <th className="px-4 py-2">Resume</th>
            <th className="px-4 py-2">PDF</th>
            <th className="px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {applications.map(app => (
            <tr
              key={app.id}
              className="hover:bg-blue-50 cursor-pointer"
              onClick={() => setSelectedApp(app)}
            >
              <td className="border px-4 py-2">{app.profiles?.email}</td>
              <td className="border px-4 py-2">{app.profiles?.full_name || '-'}</td>
              <td className="border px-4 py-2">{app.profiles?.company || '-'}</td>
              <td className="border px-4 py-2">
                <StatusBadge status={app.profiles?.is_active ? 'Active' : 'Disabled'} />
              </td>
              <td className="border px-4 py-2">{app.jobs?.title}</td>
              <td className="border px-4 py-2">
                <AppStatusBadge status={app.status || 'Submitted'} />
              </td>
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
            <div className="mb-2"><strong>Job Title:</strong> {selectedApp.jobs?.title || '-'}</div>
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