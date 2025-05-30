import { Link } from 'react-router-dom';
import { useSupabase } from '../context/SupabaseContext';

export default function UserMenu() {
  const { user, logout } = useSupabase();

  if (!user) {
    return (
      <div className="space-x-4">
        <Link to="/auth" className="text-blue-700 hover:text-blue-900 font-semibold transition-colors">Login</Link>
        <Link to="/auth?mode=signup" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow">Get Started</Link>
      </div>
    );
  }

  const role = user.user_metadata?.role;
  const dashboardPath =
    role === 'employer'
      ? '/employer'
      : role === 'admin'
      ? '/admin'
      : '/jobseeker';

  return (
    <div className="flex items-center gap-4">
      <span className="text-gray-700 font-medium">{user.email}</span>
      <Link to={dashboardPath} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors">
        Dashboard
      </Link>
      {role === 'admin' && (
        <Link to="/admin" className="bg-purple-700 text-white px-3 py-1 rounded hover:bg-purple-800 transition-colors">
          Admin Dashboard
        </Link>
      )}
      <button
        onClick={logout}
        className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors"
      >
        Logout
      </button>
    </div>
  );
}