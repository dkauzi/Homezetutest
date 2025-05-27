import { useState } from 'react';

export default function ResumeOptimizer() {
  const [resume, setResume] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [optimized, setOptimized] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOptimize = async () => {
    setLoading(true);
    const res = await fetch('/api/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume, job_description: jobDesc })
    });
    const data = await res.json();
    setOptimized(data.optimized_resume);
    setLoading(false);
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-lg font-bold mb-2">Resume Optimizer</h2>
      <textarea
        className="w-full border rounded p-2 mb-2"
        rows={4}
        placeholder="Paste your resume here..."
        value={resume}
        onChange={e => setResume(e.target.value)}
      />
      <textarea
        className="w-full border rounded p-2 mb-2"
        rows={4}
        placeholder="Paste job description here..."
        value={jobDesc}
        onChange={e => setJobDesc(e.target.value)}
      />
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={handleOptimize}
        disabled={loading}
      >
        {loading ? 'Optimizing...' : 'Optimize Resume'}
      </button>
      {optimized && (
        <div className="mt-4">
          <h3 className="font-semibold">Optimized Resume:</h3>
          <pre className="bg-gray-100 p-2 rounded">{optimized}</pre>
        </div>
      )}
    </div>
  );
}