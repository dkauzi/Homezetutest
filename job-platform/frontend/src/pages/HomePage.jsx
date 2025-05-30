import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSupabase } from '../context/SupabaseContext';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage = () => {
  const { user, supabase, logout, loading } = useSupabase();
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(8);

        if (error) throw error;
        setFeaturedJobs(data || []);
      } catch (err) {
        setError(err.message);
      }
    };

    if (supabase) fetchJobs();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <LoadingSpinner size={12} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 bg-white rounded shadow max-w-xl mx-auto mt-8">
        Error loading jobs: {error}
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="mb-16 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1">
          <h2 className="text-4xl md:text-5xl font-extrabold text-blue-800 mb-4 leading-tight">
            Find Your <span className="text-blue-500">Dream Job</span> Today
          </h2>
          <p className="text-lg text-blue-900 mb-6">
            Explore thousands of job opportunities from top companies. Apply easily and get hired fast!
          </p>
          {!user && (
            <div className="flex gap-4">
              <Link
                to="/auth?mode=signup&role=jobseeker"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700 transition-colors font-semibold shadow"
              >
                Find Jobs
              </Link>
              <Link
                to="/auth?mode=signup&role=employer"
                className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-green-700 transition-colors font-semibold shadow"
              >
                Post Jobs
              </Link>
            </div>
          )}
        </div>
        <div className="flex-1 flex justify-center">
          <img
            src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80"
            alt="Job search"
            className="rounded-2xl shadow-lg w-full max-w-md"
          />
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-blue-800 mb-6">
          Featured Job Opportunities
        </h2>
        {featuredJobs.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size={12} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {featuredJobs.map((job) => (
              <div 
                key={job.id}
                className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl transition-shadow flex flex-col"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600">
                    {job.company?.[0] || '🏢'}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">{job.title}</h3>
                    <p className="text-gray-500">{job.company}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                    {job.location}
                  </span>
                  <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                    {job.type}
                  </span>
                </div>
                <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>
                <Link
                  to={`/jobs/${job.id}`}
                  className="mt-auto inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;