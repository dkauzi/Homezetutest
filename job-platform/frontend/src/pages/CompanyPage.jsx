import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSupabase } from '../context/SupabaseContext';

export default function CompanyPage() {
  const { companyId } = useParams();
  const { supabase } = useSupabase();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    supabase.from('companies').select('*').eq('id', companyId).single().then(({ data }) => setCompany(data));
    supabase.from('jobs').select('*').eq('company_id', companyId).eq('status', 'active').then(({ data }) => setJobs(data || []));
  }, [companyId, supabase]);

  if (!company) return <div>Loading...</div>;
  return (
    <div className="max-w-3xl mx-auto p-8">
      <img src={company.logo_url} alt={company.name} className="h-24 mb-4" />
      <h1 className="text-3xl font-bold mb-2">{company.name}</h1>
      <p className="mb-4">{company.description}</p>
      <h2 className="text-xl font-bold mb-2">Open Jobs</h2>
      <ul>
        {jobs.map(job => (
          <li key={job.id}>{job.title}</li>
        ))}
      </ul>
    </div>
  );
}