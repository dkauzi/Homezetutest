import React, { useState } from 'react';
import { useSupabase } from '../context/SupabaseContext';

const JobPostForm = () => {
  const { supabase, session, user } = useSupabase();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    salary: '',
    type: 'full-time',
    company: '',
    additional_questions: [''],
    external_apply_url: ''
  });
  const [message, setMessage] = useState(null);

  const isAdmin = user?.user_metadata?.role === 'admin';
  const isEmployer = user?.user_metadata?.role === 'employer';

  const handleQuestionChange = (idx, value) => {
    const updated = [...formData.additional_questions];
    updated[idx] = value;
    setFormData({ ...formData, additional_questions: updated });
  };

  const addQuestion = () => {
    setFormData({ ...formData, additional_questions: [...formData.additional_questions, ''] });
  };

  const removeQuestion = (idx) => {
    const updated = formData.additional_questions.filter((_, i) => i !== idx);
    setFormData({ ...formData, additional_questions: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let companyValue = formData.company;
    if (isEmployer) {
      companyValue = user.user_metadata?.company || user.user_metadata?.full_name || '';
    }
    try {
      const { error } = await supabase
        .from('jobs')
        .insert({
  //           ...form,
  // external_apply_url: form.external_apply_url || null,
          title: formData.title,
          description: formData.description,
          location: formData.location,
          salary: formData.salary,
          type: formData.type,
          employer_id: session.user.id,
          company: companyValue,
          additional_questions: formData.additional_questions.filter(q => q.trim() !== ''),
          external_apply_url: formData.external_apply_url
        });

      if (error) throw error;

      setMessage('Job posted successfully!');
      setFormData({
        title: '',
        description: '',
        location: '',
        salary: '',
        type: 'full-time',
        company: '',
        additional_questions: [''],
        external_apply_url: ''
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
        <div>
          <label className="block mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full p-2 border rounded-md"
            required
            rows={3}
          />
        </div>
        <div>
          <label className="block mb-2">Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block mb-2">Salary</label>
          <input
            type="text"
            value={formData.salary}
            onChange={(e) => setFormData({...formData, salary: e.target.value})}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block mb-2">Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>
        </div>
        {isAdmin && (
          <div>
            <label className="block mb-2">Company</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full p-2 border rounded-md"
              placeholder="Enter company name"
              required
            />
          </div>
        )}
        <div>
          <label className="block mb-2">Additional Questions for Applicants</label>
          {formData.additional_questions.map((q, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={q}
                onChange={e => handleQuestionChange(idx, e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder={`Question ${idx + 1}`}
              />
              {formData.additional_questions.length > 1 && (
                <button type="button" onClick={() => removeQuestion(idx)} className="text-red-500">Remove</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addQuestion} className="text-blue-600">+ Add Question</button>
        </div>
        <div>
          <label className="block mb-2 font-medium">External Apply Link (optional)</label>
          <input
            type="url"
            className="w-full border rounded p-2 mb-4"
            placeholder="https://company.com/apply"
            value={formData.external_apply_url || ''}
            onChange={e => setFormData({ ...formData, external_apply_url: e.target.value })}
/>
        </div>

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