import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export const SupabaseContext = createContext();

export function SupabaseProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data?.session || null);
        setUser(data?.session?.user || null);
        setLoading(false);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    });
    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Fetch all jobs
  const fetchJobs = async () => {
    let { data, error } = await supabase.from('jobs').select('*');
    return data || [];
  };

  // Fetch applications for the logged-in user
  const fetchMyApplications = async () => {
    if (!user) return [];
    let { data, error } = await supabase
      .from('applications')
      .select('*, jobs(*), profiles(email)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    return data || [];
  };

  // Fetch jobs posted by the logged-in employer
  const getEmployerJobs = async () => {
    if (!user) return [];
    let { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('employer_id', user.id)
      .order('created_at', { ascending: false });
    return data || [];
  };

  // Fetch all applications for jobs posted by the logged-in employer
  const getApplications = async () => {
    if (!user) return [];
    // Get all job IDs for this employer
    const { data: jobs } = await supabase
      .from('jobs')
      .select('id')
      .eq('employer_id', user.id);

    const jobIds = jobs?.map(job => job.id) || [];
    if (jobIds.length === 0) return [];

    // Get all applications for those jobs
    const { data: applications } = await supabase
      .from('applications')
      .select('*, jobs(*), profiles(email)')
      .in('job_id', jobIds)
      .order('created_at', { ascending: false });

    return applications || [];
  };

  // Apply to a job
  const applyToJob = async (jobId, resume, pdfBase64) => {
    if (!user) return;
    const { data, error } = await supabase.from('applications').insert([
      {
        job_id: jobId,
        applicant_id: user.id,
        original_resume: resume,
        pdf_resume: pdfBase64 || null
      }
    ]);
    return data;
  };

  // Logout function
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  // Login function
  const login = async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  // Register function
  const register = async ({ email, password, role, company_name }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          company_name: company_name || null,
        },
      },
    });

    if (error) {
      // If user already registered, try to log them in
      if (error.message && error.message.toLowerCase().includes('already registered')) {
        // Try to log in
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) {
          throw loginError;
        } else {
          alert('Account already exists. You have been logged in.');
          return;
        }
      }
      throw error;
    }
  };

  return (
    <SupabaseContext.Provider
      value={{
        user,
        session,
        supabase,
        loading,
        fetchJobs,
        fetchMyApplications,
        getEmployerJobs,
        getApplications,
        applyToJob,
        logout,
        login,
        register,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
}

export const useSupabase = () => useContext(SupabaseContext);