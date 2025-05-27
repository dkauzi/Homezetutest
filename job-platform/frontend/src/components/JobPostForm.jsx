import React, { useState } from 'react';
import { useSupabase } from '../context/SupabaseContext';

const JobPostForm = () => {
  const { supabase, session } = useSupabase();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    salary: '',
    type: 'full-time'
  });
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('jobs')
        .insert({
          ...formData,
          employer_id: session.user.id,
          company: session.user.user_metadata?.full_name || 'Our Company'
        });

      if (error) throw error;
      
      setMessage('Job posted successfully!');
      setFormData({
        title: '',
        description: '',
        location: '',
        salary: '',
        type: 'full-time'
      });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Post New Job</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Form fields */}
        <div>
          <label className="block mb-2">Job Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        {/* Other form fields... */}

        {message && (
          <div className={`p-3 rounded-md ${
            message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
        >
          Post Job
        </button>
      </form>
    </div>
  );
};

export default JobPostForm;