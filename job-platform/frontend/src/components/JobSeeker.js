// src/components/JobSeeker.js
import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function JobSeeker() {
  const [resume, setResume] = useState('');
  const [optimized, setOptimized] = useState('');

  const handleOptimize = async () => {
    const { data, error } = await supabase.functions.invoke('optimize', {
      body: { resume }
    });
    
    if (!error) setOptimized(data.optimized);
  };

  return (
    <div className="container">
      <h1>AI Resume Optimizer</h1>
      <div className="grid">
        <div>
          <h3>Original Resume</h3>
          <textarea 
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            rows="20"
          />
        </div>
        <div>
          <h3>Optimized Resume</h3>
          <pre>{optimized}</pre>
        </div>
      </div>
      <button onClick={handleOptimize}>Optimize Now</button>
    </div>
  );
}