import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import './App.css';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_KEY
);

function JobSeekerDashboard() {
  const [resume, setResume] = useState('');
  const [optimizedResume, setOptimizedResume] = useState('');
  const [jobs, setJobs] = useState([]);

  // Fetch jobs from Supabase
  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*');
      
      if (!error) setJobs(data);
    };
    fetchJobs();
  }, []);

  // Optimize Resume
  const handleOptimize = async () => {
    try {
      const response = await fetch('http://localhost:8080/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume })
      });
      
      const { optimized } = await response.json();
      setOptimizedResume(optimized);
    } catch (error) {
      console.error('Optimization failed:', error);
    }
  };

  return (
    <div className="app-container">
      <h1>AI Resume Optimizer</h1>
      
      <div className="resume-section">
        <textarea
          value={resume}
          onChange={(e) => setResume(e.target.value)}
          placeholder="Paste your resume here..."
        />
        <button onClick={handleOptimize}>Optimize with AI</button>
        <div className="optimized-resume">
          {optimizedResume}
        </div>
      </div>

      <div className="job-listings">
        <h2>Recent Job Postings</h2>
        {jobs.map(job => (
          <div key={job.id} className="job-card">
            <h3>{job.title}</h3>
            <p>{job.company}</p>
            <p>{job.description.slice(0, 100)}...</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <JobSeekerDashboard />
    </div>
  );
}

export default App;