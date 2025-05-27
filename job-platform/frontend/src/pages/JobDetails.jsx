import { useParams } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { SupabaseContext } from '../context/SupabaseContext';

export default function JobDetails() {
  const { id } = useParams();
  const { fetchJobs, applyToJob } = useContext(SupabaseContext);
  const [job, setJob] = useState(null);
  const [resume, setResume] = useState('');
  const [showApply, setShowApply] = useState(false);

  useEffect(() => {
    fetchJobs().then(jobs => {
      setJob(jobs.find(j => String(j.id) === String(id)));
    });
  }, [id, fetchJobs]);

  if (!job) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">{job.title}</h1>
      <p className="mb-4">{job.description}</p>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => setShowApply(true)}
      >
        Apply
      </button>

      {showApply && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-xl font-bold mb-4">Apply to {job.title}</h3>
            <textarea
              className="w-full border rounded p-2 mb-4"
              rows={6}
              placeholder="Paste your resume here..."
              value={resume}
              onChange={e => setResume(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={async () => {
                  await applyToJob(job.id, resume);
                  setShowApply(false);
                  setResume('');
                }}
              >
                Submit Application
              </button>
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => setShowApply(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}