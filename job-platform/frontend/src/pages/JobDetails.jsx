import { useParams } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { SupabaseContext } from '../context/SupabaseContext';

export default function JobDetails() {
  const { id } = useParams();
  const { fetchJobs, applyToJob } = useContext(SupabaseContext);
  const { user } = useContext(SupabaseContext);
  const [job, setJob] = useState(null);
  const [showApply, setShowApply] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Application form state
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    coverLetter: '',
    resumeFile: null,
  });

  useEffect(() => {
    fetchJobs().then(jobs => {
      setJob(jobs.find(j => String(j.id) === String(id)));
    });
  }, [id, fetchJobs]);

  // Resume parsing (very basic, for demo)
  const parseResume = async (file) => {
    // Only parse text-based PDFs or DOCs for demo
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'pdf' || ext === 'doc' || ext === 'docx') {
      const text = await file.text();
      // Try to find name/email in the first 500 chars
      const nameMatch = text.match(/Name[:\s]+([A-Za-z\s]+)/i);
      const emailMatch = text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
      setForm(f => ({
        ...f,
        fullName: nameMatch ? nameMatch[1].trim() : f.fullName,
        email: emailMatch ? emailMatch[0] : f.email,
      }));
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setForm(f => ({ ...f, resumeFile: file }));
    if (file) await parseResume(file);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Convert resume file to base64
    let resumeBase64 = '';
    if (form.resumeFile) {
      const reader = new FileReader();
      resumeBase64 = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(form.resumeFile);
      });
    }

    try {
      const result = await applyToJob(
        job.id,
        form.coverLetter,
        resumeBase64,
        form.fullName,
        form.email,
        form.phone
      );
      if (result && result.error) {
        setApplyMessage('There was a problem submitting your application.');
      } else {
        setApplyMessage('Application submitted successfully!');
        setShowApply(false);
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

  const isExpired = job.expiry_date && new Date(job.expiry_date) < new Date();
  const hasExternalApply = !!job.external_apply_url;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">{job.title}</h1>
      <p className="mb-4">{job.description}</p>
      {hasExternalApply ? (
        <a
          href={job.external_apply_url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-600 text-white rounded inline-block"
        >
          Apply (External)
        </a>
      ) : (
        !isJobOwner && !isExpired && (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => setShowApply(!showApply)}
          >
            {showApply ? 'Hide Application Form' : 'Apply'}
          </button>
        )
      )}
      {isJobOwner && (
        <div className="text-gray-500 italic mb-4">
          You cannot apply to your own job posting.
        </div>
      )}

      {!isExpired && showApply && !hasExternalApply && (
        <form className="mt-8 max-w-xl bg-white rounded shadow p-6" onSubmit={handleApply}>
          <h3 className="text-xl font-bold mb-4">Application Details</h3>
          <div className="mb-3">
            <label className="block mb-1 font-medium">Full Name *</label>
            <input
              type="text"
              required
              className="w-full border rounded p-2"
              value={form.fullName}
              onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
            />
          </div>
          <div className="mb-3">
            <label className="block mb-1 font-medium">Email *</label>
            <input
              type="email"
              required
              className="w-full border rounded p-2"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div className="mb-3">
            <label className="block mb-1 font-medium">Phone</label>
            <input
              type="tel"
              className="w-full border rounded p-2"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div className="mb-3">
            <label className="block mb-1 font-medium">Resume/CV (PDF or DOC) *</label>
            <input
              type="file"
              required
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="w-full"
              onChange={handleFileChange}
            />
          </div>
          <div className="mb-3">
            <label className="block mb-1 font-medium">Cover Letter</label>
            <textarea
              className="w-full border rounded p-2"
              rows={4}
              value={form.coverLetter}
              onChange={e => setForm(f => ({ ...f, coverLetter: e.target.value }))}
            />
          </div>
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
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 rounded"
              onClick={() => setShowApply(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}