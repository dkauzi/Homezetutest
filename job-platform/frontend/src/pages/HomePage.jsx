import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSupabase } from '../context/SupabaseContext';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage = () => {
  const { user, supabase, logout, loading } = useSupabase();
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;
        setFeaturedJobs(data || []);
      } catch (err) {
        setError(err.message);
      }
    };

    if (supabase) fetchJobs();
  }, [supabase]);

  const getDashboardPath = () => {
    const role = user?.user_metadata?.role;
    return role === 'employer' ? '/employer' : '/jobseeker';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size={12} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Error loading jobs: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">JobPlatform</h1>
          <nav>
            {user ? (
              <div className="flex items-center gap-4">
                <Link 
                  to={getDashboardPath()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-x-4">
                <Link 
                  to="/auth" 
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/auth?mode=signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Featured Job Opportunities
          </h2>

          {featuredJobs.length === 0 ? (
            <div className="flex justify-center items-center h-96">
              <LoadingSpinner size={12} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.map((job) => (
                <div 
                  key={job.id}
                  className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                  <p className="text-gray-600 mb-4">{job.company}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm">
                      {job.location}
                    </span>
                    <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-sm">
                      {job.type}
                    </span>
                  </div>
                  <Link
                    to={`/jobs/${job.id}`}
                    className="inline-block bg-blue-100 text-blue-600 px-4 py-2 rounded hover:bg-blue-200 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {!user && (
          <section className="bg-blue-50 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Start Your Journey Today
            </h2>
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <Link
                to="/auth?mode=signup&role=jobseeker"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700 transition-colors"
              >
                Find Your Dream Job
              </Link>
              <Link
                to="/auth?mode=signup&role=employer"
                className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-green-700 transition-colors"
              >
                Post Job Opportunities
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default HomePage;