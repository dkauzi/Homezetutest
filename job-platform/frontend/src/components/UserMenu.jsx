import { Link, useNavigate } from 'react-router-dom';
import { useSupabase } from '../context/SupabaseContext';

export default function UserMenu() {
  const { user, logout } = useSupabase();
  const navigate = useNavigate();

  if (!user) return null;

  const role = user.user_metadata?.role;
  const fullName = user.user_metadata?.full_name || user.email;

  const dashboardPath = role === 'employer' ? '/employer' : '/jobseeker';

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <div className="flex items-center gap-4">
      <span className="text-gray-700 font-medium">{fullName}</span>
      <Link
        to={dashboardPath}
        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
      >
        Dashboard
      </Link>
      <button
        onClick={handleLogout}
        className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors"
      >
        Logout
      </button>
    </div>
  );
}