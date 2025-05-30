// src/components/Employer.js
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

export default function Employer() {
  const [jobs, setJobs] = useState([]);
  const [newJob, setNewJob] = useState({ title: '', description: '' });

  const fetchJobs = async () => {
    const { data } = await supabase.from('jobs').select('*');
    setJobs(data);
  };

  const postJob = async () => {
    await supabase.from('jobs').insert(newJob);
    fetchJobs();
  };

  useEffect(() => { fetchJobs() }, []);

  return (
    <div>
      <h2>Post New Job</h2>
      <input
        placeholder="Job Title"
        value={newJob.title}
        onChange={e => setNewJob({...newJob, title: e.target.value})}
      />
      <textarea
        placeholder="Description"
        value={newJob.description}
        onChange={e => setNewJob({...newJob, description: e.target.value})}
      />
      <button onClick={postJob}>Post Job</button>

      <h2>Posted Jobs</h2>
      {jobs.map(job => (
        <div key={job.id} className="job-card">
          <h3>{job.title}</h3>
          <p>{job.description}</p>
          <Link to={`/company/${job.company_id}`}>{job.company_id}</Link>
        </div>
      ))}
    </div>
  );
}