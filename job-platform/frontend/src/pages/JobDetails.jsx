import { useParams } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { SupabaseContext } from '../context/SupabaseContext';

export default function JobDetails() {
  const { id } = useParams();
  const { fetchJobs, applyToJob } = useContext(SupabaseContext);
  const { user } = useContext(SupabaseContext);
  const [job, setJob] = useState(null);
  const [resume, setResume] = useState('');
  const [showApply, setShowApply] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);

  useEffect(() => {
    fetchJobs().then(jobs => {
      setJob(jobs.find(j => String(j.id) === String(id)));
    });
  }, [id, fetchJobs]);

  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
  });

  const handleApply = async () => {
    setLoading(true);
    let pdfBase64 = '';
    if (pdfFile) {
      pdfBase64 = await toBase64(pdfFile);
    }
    try {
      const result = await applyToJob(job.id, resume, pdfBase64);
      if (result && result.error) {
        setApplyMessage('There was a problem submitting your application.');
      } else {
        setApplyMessage('Application submitted successfully!');
      }
    } catch (err) {
      setApplyMessage('There was a problem submitting your application.');
    }
    setLoading(false);
    setTimeout(() => setApplyMessage(''), 4000);
  };

  if (!job) return <div>Loading...</div>;

  // Check if the logged-in user is the employer who posted the job
  const isEmployer = user?.user_metadata?.role === 'employer';
  const isJobOwner = isEmployer && job?.employer_id === user.id;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">{job.title}</h1>
      <p className="mb-4">{job.description}</p>
      {!isJobOwner && (
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => setShowApply(true)}
        >
          Apply
        </button>
      )}
      {isJobOwner && (
        <div className="text-gray-500 italic mb-4">
          You cannot apply to your own job posting.
        </div>
      )}

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
            <input
              type="file"
              accept="application/pdf"
              onChange={e => setPdfFile(e.target.files[0])}
              className="mb-4"
            />
            {applyMessage && (
              <div
                className={`mb-4 p-2 rounded ${
                  applyMessage.includes('success')
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {applyMessage}
              </div>
            )}
            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handleApply}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Application'}
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