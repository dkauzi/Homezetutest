import React, { useEffect, useState, useCallback } from 'react';
import { useSupabase } from '../context/SupabaseContext';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { supabase, user } = useSupabase();
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [editJobData, setEditJobData] = useState({});
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const navigate = useNavigate();

  // Redirect non-admins
  useEffect(() => {
    if (user?.user_metadata?.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    const { data, error } = await supabase.from('profiles').select('*');
    setUsers(data || []);
  }, [supabase]);

  useEffect(() => {
    if (user?.user_metadata?.role === 'admin') {
      fetchUsers();
    }
  }, [supabase, user, fetchUsers]);

  // Fetch all jobs
  useEffect(() => {
    if (user?.user_metadata?.role === 'admin') {
      supabase
        .from('jobs')
        .select('*')
        .then(({ data }) => setJobs(data || []));
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

  // Enable/disable user
  const setStatus = async (userId, isActive) => {
    const token = await supabase.auth.getSession().then(({ data }) => data.session?.access_token);
    await fetch(`/api/users/${userId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ is_active: isActive }),
    });
    setUsers(users => users.map(u => u.id === userId ? { ...u, is_active: isActive } : u));
  };

  // Role change handler
  const setRole = async (userId, role) => {
    const token = await supabase.auth.getSession().then(({ data }) => data.session?.access_token);
    await fetch(`/api/users/${userId}/role`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role }),
    });
    setUsers(users => users.map(u => u.id === userId ? { ...u, role } : u));
  };

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

  // Edit job handlers
  const handleEditJob = (job) => {
    setEditingJob(job);
    setEditJobData({ ...job });
  };

  const handleSaveJob = async () => {
    await supabase.from('jobs').update(editJobData).eq('id', editingJob.id);
    setEditingJob(null);
    setJobs(jobs => jobs.map(j => j.id === editingJob.id ? { ...j, ...editJobData } : j));
  };

  // Set job status (e.g., archive)
  const setJobStatus = async (jobId, status) => {
    await supabase.from('jobs').update({ status }).eq('id', jobId);
    setJobs(jobs => jobs.map(j => j.id === jobId ? { ...j, status } : j));
  };

  // Helper to render status badge
  const StatusBadge = ({ status }) => (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      {status}
    </span>
  );

  // User Management Table
  const renderUserTable = (users, title) => (
    <>
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="mb-4">
        <button
          className="bg-red-600 text-white px-3 py-1 rounded mr-2"
          onClick={() => bulkSetStatus(false)}
        >
          Disable Selected
        </button>
        <button
          className="bg-green-600 text-white px-3 py-1 rounded"
          onClick={() => bulkSetStatus(true)}
        >
          Enable Selected
        </button>
      </div>
      <table className="min-w-full bg-white rounded shadow mb-8">
        <thead>
          <tr>
            <th className="px-4 py-2">Select</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Role</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {(Array.isArray(users) ? users : []).map(u => (
            <tr key={u.id}>
              <td className="border px-4 py-2">
                <input
                  type="checkbox"
                  checked={selectedUserIds.includes(u.id)}
                  onChange={e => {
                    setSelectedUserIds(e.target.checked
                      ? [...selectedUserIds, u.id]
                      : selectedUserIds.filter(id => id !== u.id));
                  }}
                />
              </td>
              <td className="border px-4 py-2">{u.email}</td>
              <td className="border px-4 py-2 capitalize">
                <select
                  value={u.role}
                  onChange={e => setRole(u.id, e.target.value)}
                  className="border rounded p-1"
                >
                  <option value="admin">Admin</option>
                  <option value="employer">Employer</option>
                  <option value="jobseeker">Jobseeker</option>
                </select>
              </td>
              <td className="border px-4 py-2">
                <StatusBadge status={u.is_active ? 'Active' : 'Disabled'} />
              </td>
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
    </>
  );

  // Jobs Table
  const renderJobsTable = () => (
    <>
      <h2 className="text-xl font-bold mb-4">All Job Posts</h2>
      <table className="min-w-full bg-white rounded shadow mb-8">
        <thead>
          <tr>
            <th className="px-4 py-2">Title</th>
            <th className="px-4 py-2">Company</th>
            <th className="px-4 py-2">Location</th>
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">Salary</th>
            <th className="px-4 py-2">Employer</th>
            <th className="px-4 py-2">Edit</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map(job => (
            <tr key={job.id}>
              <td className="border px-4 py-2">{job.title}</td>
              <td className="border px-4 py-2">{job.company || '-'}</td>
              <td className="border px-4 py-2">{job.location || '-'}</td>
              <td className="border px-4 py-2">{job.type || '-'}</td>
              <td className="border px-4 py-2">{job.salary || job.salary_range || '-'}</td>
              <td className="border px-4 py-2">
                {users.find(u => u.id === job.employer_id)?.email || job.employer_id}
              </td>
              <td className="border px-4 py-2">
                <button
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                  onClick={() => handleEditJob(job)}
                >
                  Edit
                </button>
                <button
                  className="ml-2 bg-gray-400 text-white px-3 py-1 rounded"
                  onClick={() => setJobStatus(job.id, 'archived')}
                >
                  Archive
                </button>
                {job.status === 'pending' && (
                  <>
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded mr-2"
                      onClick={() => setJobStatus(job.id, 'active')}
                    >
                      Approve
                    </button>
                    <button
                      className="bg-red-600 text-white px-3 py-1 rounded"
                      onClick={() => setJobStatus(job.id, 'rejected')}
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
    </>
  );

  // Applications Table
  const renderApplicationsTable = () => (
    <>
      <h2 className="text-xl font-bold mb-4">All Applications</h2>
      <table className="min-w-full bg-white rounded shadow mb-8">
        <thead>
          <tr>
            <th className="px-4 py-2">Applicant</th>
            <th className="px-4 py-2">Job Title</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {applications.map(app => (
            <tr key={app.id}>
              <td className="border px-4 py-2">{app.profiles?.email}</td>
              <td className="border px-4 py-2">{app.jobs?.title}</td>
              <td className="border px-4 py-2">{app.status || 'Submitted'}</td>
              <td className="border px-4 py-2">{new Date(app.created_at).toLocaleString()}</td>
              <td className="border px-4 py-2">
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                  onClick={() => setSelectedApp(app)}
                >
                  View
                </button>
                <button
                  className="ml-2 bg-green-600 text-white px-3 py-1 rounded"
                  onClick={() => handleStatusChange(app.id, 'Accepted')}
                >
                  Accept
                </button>
                <button
                  className="ml-2 bg-red-600 text-white px-3 py-1 rounded"
                  onClick={() => handleStatusChange(app.id, 'Rejected')}
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );

  // Bulk status update for users
  const bulkSetStatus = async (isActive) => {
    await Promise.all(selectedUserIds.map(id =>
      fetch(`/api/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive }),
      })
    ));
    setUsers(users => users.map(u =>
      selectedUserIds.includes(u.id) ? { ...u, is_active: isActive } : u
    ));
    setSelectedUserIds([]);
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded shadow p-4">
          <div className="text-2xl font-bold">{users.length}</div>
          <div className="text-gray-600">Users</div>
        </div>
        <div className="bg-white rounded shadow p-4">
          <div className="text-2xl font-bold">{jobs.length}</div>
          <div className="text-gray-600">Jobs</div>
        </div>
        <div className="bg-white rounded shadow p-4">
          <div className="text-2xl font-bold">{applications.length}</div>
          <div className="text-gray-600">Applications</div>
        </div>
      </div>

      {renderUserTable(users, "All Users")}
      {renderJobsTable()}
      {renderApplicationsTable()}

      {/* Edit Job Modal */}
      {editingJob && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">Edit Job</h3>
            <input
              className="w-full border rounded p-2 mb-2"
              value={editJobData.title}
              onChange={e => setEditJobData({ ...editJobData, title: e.target.value })}
              placeholder="Job Title"
            />
            <textarea
              className="w-full border rounded p-2 mb-2"
              value={editJobData.description}
              onChange={e => setEditJobData({ ...editJobData, description: e.target.value })}
              placeholder="Description"
            />
            <input
              className="w-full border rounded p-2 mb-2"
              value={editJobData.location}
              onChange={e => setEditJobData({ ...editJobData, location: e.target.value })}
              placeholder="Location"
            />
            <input
              className="w-full border rounded p-2 mb-2"
              value={editJobData.salary}
              onChange={e => setEditJobData({ ...editJobData, salary: e.target.value })}
              placeholder="Salary"
            />
            <input
              className="w-full border rounded p-2 mb-2"
              value={editJobData.type}
              onChange={e => setEditJobData({ ...editJobData, type: e.target.value })}
              placeholder="Type"
            />
            <input
              type="checkbox"
              checked={!!editJobData.featured}
              onChange={e => setEditJobData({ ...editJobData, featured: e.target.checked })}
              className="mr-2"
            />
            <label className="mr-4">Featured</label>
            <input
              type="date"
              value={editJobData.expiry_date ? editJobData.expiry_date.slice(0, 10) : ''}
              onChange={e => setEditJobData({ ...editJobData, expiry_date: e.target.value })}
              className="border rounded p-2 mb-2"
            />
            <label>Expiry Date</label>
            <label className="block mb-2 font-medium">External Apply Link (optional)</label>
            <input
              type="url"
              className="w-full border rounded p-2 mb-4"
              placeholder="https://company.com/apply"
              value={editJobData.external_apply_url || ''}
              onChange={e => setEditJobData({ ...editJobData, external_apply_url: e.target.value })}
            />
            <div className="flex gap-2 mt-4">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={handleSaveJob}
              >
                Save
              </button>
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setEditingJob(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Application Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => setSelectedApp(null)}
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4">Application Details</h3>
            <div className="mb-2"><strong>Applicant:</strong> {selectedApp.profiles?.email}</div>
            <div className="mb-2"><strong>Job:</strong> {selectedApp.jobs?.title}</div>
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