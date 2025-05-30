import { useEffect, useState, useContext } from 'react';
import { SupabaseContext } from '../context/SupabaseContext';

export default function JobSeekerDashboard() {
  const { fetchMyApplications, user, supabase } = useContext(SupabaseContext);
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch applications
    fetchMyApplications().then(apps => {
      setApplications(apps);
      setLoading(false);
    });
    // Fetch user profile
    if (user) {
      supabase.from('profiles').select('*').eq('id', user.id).single()
        .then(({ data }) => setProfile(data));
    }
  }, [fetchMyApplications, supabase, user]);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      {profile ? (
        <div className="mb-8 bg-white rounded shadow p-6">
          <div><strong>Name:</strong> {profile.full_name || '-'}</div>
          <div><strong>Email:</strong> {profile.email || '-'}</div>
          <div><strong>Company:</strong> {profile.company || '-'}</div>
          <div><strong>Bio:</strong> {profile.bio || '-'}</div>
          <div className="mt-4">
            <strong>Your CV:</strong>
            {profile.cv_url ? (
              <a
                href={profile.cv_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline ml-2"
              >
                View CV
              </a>
            ) : (
              <span className="ml-2 text-gray-500">No CV uploaded</span>
            )}
          </div>
        </div>
      ) : (
        <div className="mb-8">Profile not found.</div>
      )}

      <h2 className="text-xl font-semibold mb-4">Jobs You've Applied For</h2>
      <div className="grid grid-cols-1 gap-4">
        {applications.length === 0 ? (
          <div className="text-gray-500">You haven't applied for any jobs yet.</div>
        ) : (
          applications.map(app => (
            <div key={app.id} className="border rounded p-4 shadow">
              <h3 className="font-bold">{app.jobs?.title || 'Job Title'}</h3>
              <p className="text-gray-600">{app.jobs?.description || ''}</p>
              <div className="text-sm text-gray-500 mt-2">
                Applied on: {new Date(app.created_at).toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-500">
                Status: {app.status || 'Submitted'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}