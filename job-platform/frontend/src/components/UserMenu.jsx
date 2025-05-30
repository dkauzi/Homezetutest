import { Link } from 'react-router-dom';
import { useSupabase } from '../context/SupabaseContext';
import { useState } from 'react';
import ProfileModal from '../components/ProfileModal';

export default function UserMenu() {
  const { user, logout } = useSupabase();
  const [showProfile, setShowProfile] = useState(false);

  if (!user) {
    return (
      <div className="space-x-4">
        <Link to="/auth" className="text-blue-700 hover:text-blue-900 font-semibold transition-colors">Login</Link>
        <Link to="/auth?mode=signup" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow">Get Started</Link>
      </div>
    );
  }

  const roles = user.user_metadata?.role;
  const isEmployer = Array.isArray(roles) ? roles.includes('employer') : roles === 'employer';
  const isAdmin = Array.isArray(roles) ? roles.includes('admin') : roles === 'admin';

  let dashboardPath = '/jobseeker';
  if (isEmployer) {
    dashboardPath = '/employer';
  } else if (isAdmin) {
    dashboardPath = '/admin';
  }

  return (
    <div className="flex items-center gap-4">
      <Link to="/" className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors">
        Home
      </Link>
      <span className="text-gray-700 font-medium">{user.email}</span>
      <Link to={dashboardPath} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors">
        Dashboard
      </Link>
      {isAdmin && (
        <Link to="/admin" className="bg-purple-700 text-white px-3 py-1 rounded hover:bg-purple-800 transition-colors">
          Admin Dashboard
        </Link>
      )}
      <Link to="#" onClick={() => setShowProfile(true)} className="text-blue-700 hover:underline">Profile</Link>
      <ProfileModal open={showProfile} onClose={() => setShowProfile(false)} />
      <button
        onClick={logout}
        className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors"
      >
        Logout
      </button>
    </div>
  );
}