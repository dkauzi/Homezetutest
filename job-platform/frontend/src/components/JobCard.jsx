// src/components/JobCard.jsx
import { Link } from 'react-router-dom';

export default function JobCard({ job }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            <Link to={`/jobs/${job.id}`} className="hover:text-blue-600">
              {job.title}
            </Link>
          </h3>
          <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>
          <div className="flex gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {job.location}
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {job.salary_range}
            </span>
            {job.featured && (
              <span className="ml-2 px-2 py-1 bg-yellow-300 text-yellow-900 rounded text-xs">
                Featured
              </span>
            )}
          </div>
        </div>
        <div className="text-right min-w-[120px]">
          <p className="text-sm text-gray-500">
            <Link to={`/company/${job.company_id}`} className="hover:text-blue-600">
              {job.profiles?.company_name}
            </Link>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(job.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      <Link
        to={`/jobs/${job.id}`}
        className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium"
      >
        View Details →
      </Link>
    </div>
  );
}