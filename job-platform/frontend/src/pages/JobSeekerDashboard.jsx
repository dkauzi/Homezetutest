import { useEffect, useState, useContext } from 'react';
import { SupabaseContext } from '../context/SupabaseContext';
import ApplicationList from '../components/ApplicationList';

export default function JobSeekerDashboard() {
  const { fetchJobs, fetchMyApplications, applyToJob, user } = useContext(SupabaseContext);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [resume, setResume] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [applyMessage, setApplyMessage] = useState('');

  useEffect(() => {
    fetchJobs().then(setJobs);
    fetchMyApplications().then(setApplications);
  }, []);

  // Get job IDs the user has already applied for
  const appliedJobIds = new Set(applications.map(app => app.job_id));

  const handleApply = async () => {
    setLoading(true);

    let pdfBase64 = '';
    if (pdfFile) {
      pdfBase64 = await toBase64(pdfFile);
    }

    try {
      await applyToJob(selectedJob.id, resume, pdfBase64);
      setApplyMessage('Application submitted successfully!');
      fetchMyApplications().then(setApplications);
    } catch (err) {
      setApplyMessage('There was a problem submitting your application.');
    }
    setLoading(false);
    setSelectedJob(null);
    setResume('');
    setPdfFile(null);
    setTimeout(() => setApplyMessage(''), 4000);
  };

  const handleAnswerChange = (index, value) => {
    setAnswers(prev => ({ ...prev, [index]: value }));
  };

  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  // Split jobs into applied and not applied
  const appliedJobs = jobs.filter(job => appliedJobIds.has(job.id));
  const availableJobs = jobs.filter(job => !appliedJobIds.has(job.id));

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Job Seeker Dashboard</h1>

      {/* Show global success message */}
      {applyMessage && (
        <div
          className={`mb-6 p-3 rounded ${
            applyMessage.includes('success')
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {applyMessage}
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">Available Jobs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {availableJobs.length === 0 && (
          <div className="col-span-2 text-gray-500">No available jobs to apply for.</div>
        )}
        {availableJobs.map(job => (
          <div key={job.id} className="border rounded p-4 shadow">
            <h3 className="font-bold">{job.title}</h3>
            <p className="text-gray-600">{job.description}</p>
            <button
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
              onClick={() => {
                setSelectedJob(job);
                setResume('');
                setPdfFile(null);
              }}
            >
              Apply
            </button>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-4">Jobs You've Applied For</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {appliedJobs.length === 0 && (
          <div className="col-span-2 text-gray-500">You haven't applied for any jobs yet.</div>
        )}
        {appliedJobs.map(job => (
          <div key={job.id} className="border rounded p-4 shadow opacity-60">
            <h3 className="font-bold">{job.title}</h3>
            <p className="text-gray-600">{job.description}</p>
            <button
              className="mt-2 px-4 py-2 bg-gray-400 text-white rounded cursor-not-allowed"
              disabled
            >
              Already Applied
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
              onChange={e => setResume(e.target.value)}
              disabled={loading}
            />
            <div className="mb-4">
              <label className="block mb-1 font-medium">Upload PDF Resume (optional):</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={e => setPdfFile(e.target.files[0])}
                disabled={loading}
              />
              {pdfFile && (
                <div className="text-sm text-gray-600 mt-1">{pdfFile.name}</div>
              )}
            </div>

            {/* Additional Questions */}
            {selectedJob?.additional_questions && selectedJob.additional_questions.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Additional Questions</h4>
                {selectedJob.additional_questions.map((q, idx) => (
                  <div key={idx} className="mb-2">
                    <label className="block mb-1">{q}</label>
                    <input
                      type="text"
                      className="w-full border rounded p-2"
                      value={answers[idx] || ''}
                      onChange={e => handleAnswerChange(idx, e.target.value)}
                    />
                  </div>
                ))}
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
                onClick={() => setSelectedJob(null)}
                disabled={loading}
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