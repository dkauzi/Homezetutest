import { useEffect, useState, useContext } from 'react';
import { SupabaseContext } from '../context/SupabaseContext';
import ApplicationList from '../components/ApplicationList';

export default function JobSeekerDashboard() {
  const { fetchJobs, fetchMyApplications, applyToJob, user } = useContext(SupabaseContext);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [resume, setResume] = useState('');
  const [optimizedResume, setOptimizedResume] = useState('');
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);

  useEffect(() => {
    fetchJobs().then(setJobs);
    fetchMyApplications().then(setApplications);
  }, []);

  const handleOptimize = async () => {
    setOptimizing(true);
    try {
      const res = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume,
          job_description: selectedJob.description,
        }),
      });
      const data = await res.json();
      setOptimizedResume(data.optimized_resume || '');
    } catch (err) {
      setOptimizedResume('Failed to optimize resume.');
    }
    setOptimizing(false);
  };

  const handleApply = async () => {
    setLoading(true);
    await applyToJob(selectedJob.id, optimizedResume || resume);
    setLoading(false);
    setSelectedJob(null);
    setResume('');
    setOptimizedResume('');
    fetchMyApplications().then(setApplications);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Job Seeker Dashboard</h1>
      <h2 className="text-xl font-semibold mb-4">Available Jobs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {jobs.map(job => (
          <div key={job.id} className="border rounded p-4 shadow">
            <h3 className="font-bold">{job.title}</h3>
            <p className="text-gray-600">{job.description}</p>
            <button
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
              onClick={() => {
                setSelectedJob(job);
                setResume('');
                setOptimizedResume('');
              }}
            >
              Apply
            </button>
          </div>
        ))}
      </div>
      <ApplicationList applications={applications} />

      {/* Apply Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-xl font-bold mb-4">Apply to {selectedJob.title}</h3>
            <textarea
              className="w-full border rounded p-2 mb-4"
              rows={6}
              placeholder="Paste your resume here..."
              value={resume}
              onChange={e => {
                setResume(e.target.value);
                setOptimizedResume('');
              }}
              disabled={optimizing || loading}
            />
            <div className="flex gap-2 mb-4">
              <button
                className="px-4 py-2 bg-green-600 text-white rounded"
                onClick={handleOptimize}
                disabled={optimizing || !resume}
              >
                {optimizing ? 'Optimizing...' : 'Optimize Resume'}
              </button>
            </div>
            {optimizedResume && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Optimized Resume Preview</h4>
                <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap max-h-48 overflow-auto">{optimizedResume}</pre>
                <div className="flex gap-2 mt-2">
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                    onClick={handleApply}
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Submit Optimized Resume'}
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-200 rounded"
                    onClick={() => setOptimizedResume('')}
                  >
                    Edit Original
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-200 rounded"
                    onClick={() => setSelectedJob(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {!optimizedResume && (
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 bg-gray-200 rounded"
                  onClick={() => setSelectedJob(null)}
                  disabled={loading || optimizing}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}