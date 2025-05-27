// src/context/SupabaseContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

const SupabaseContext = createContext();

export function SupabaseProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Remove the local supabase client creation
  // const supabase = createClient(...); ❌ Delete this line

  // Auth state management
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Initial check
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    
    getSession();
    return () => subscription?.unsubscribe();
  }, []);

  // Registration with automatic profile creation via trigger
  const register = useCallback(async ({ email, password, role, company_name }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          company_name: role === 'employer' ? company_name : null
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) throw error;
    return data.user;
  }, []);

  // Login handler
  const login = useCallback(async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data.user;
  }, []);

  // Get employer jobs with RLS
  const getEmployerJobs = useCallback(async () => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('employer_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Jobs fetch error:', error);
    throw error;
  }
  return data;
}, [user?.id]);

const getApplications = useCallback(async () => {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      jobs (*),
      profiles!applications_applicant_id_fkey (email)
    `)
    .eq('jobs.employer_id', user.id);

  if (error) {
    console.error('Applications fetch error:', error);
    throw error;
  }
  return data;
}, [user?.id]);

  // Logout handler
  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  }, []);

  return (
    <SupabaseContext.Provider value={{
      user,
      loading,
      register,
      login,
      logout,
      getEmployerJobs,
      getApplications,
      supabase
    }}>
      {!loading && children}
    </SupabaseContext.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};