import { useState } from 'react';

export default function ApplicationModal({ job, open, onClose, onSubmit, loading }) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    coverLetter: '',
    resumeFile: null,
  });

  // Resume parsing (very basic, for demo)
  const parseResume = async (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'pdf' || ext === 'doc' || ext === 'docx') {
      const text = await file.text();
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  if (!open || !job) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h3 className="text-xl font-bold mb-4">Apply to {job.title}</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block mb-1 font-medium">Full Name *</label>
            <input
              type="text"
              name="fullName"
              required
              className="w-full border rounded p-2"
              value={form.fullName}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <label className="block mb-1 font-medium">Email *</label>
            <input
              type="email"
              name="email"
              required
              className="w-full border rounded p-2"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <label className="block mb-1 font-medium">Phone</label>
            <input
              type="tel"
              name="phone"
              className="w-full border rounded p-2"
              value={form.phone}
              onChange={handleChange}
              disabled={loading}
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
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <label className="block mb-1 font-medium">Cover Letter</label>
            <textarea
              name="coverLetter"
              className="w-full border rounded p-2"
              rows={4}
              value={form.coverLetter}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
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
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}