// src/pages/EmployerDashboard.jsx
import { useState, useEffect } from 'react';
import { useSupabase } from '../context/SupabaseContext';
import JobPostForm from '../components/JobPostForm';
import DashboardStats from '../components/DashboardStats';
import ApplicationList from '../components/ApplicationList';

export default function EmployerDashboard() {
  const { getEmployerJobs, getApplications } = useSupabase();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showJobForm, setShowJobForm] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const jobs = await getEmployerJobs();
      setJobs(jobs);
      
      const apps = await getApplications();
      setApplications(apps);
    };
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DashboardStats jobs={jobs} applications={applications} />
      
      <div className="mt-8 flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Job Postings</h1>
        <button
          onClick={() => setShowJobForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + New Job Post
        </button>
      </div>

      {showJobForm && (
        <JobPostForm 
          onClose={() => setShowJobForm(false)}
          onJobCreated={(newJob) => setJobs([newJob, ...jobs])}
        />
      )}

      <div className="grid gap-6">
        {jobs.map(job => (
          <div key={job.id} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
            <p className="text-gray-600 mb-4">{job.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {job.applications?.length || 0} applications
              </span>
              <button className="text-blue-600 hover:text-blue-800">
                View Applications
              </button>
            </div>
          </div>
        ))}
      </div>

      <ApplicationList applications={applications} />
    </div>
  );
}