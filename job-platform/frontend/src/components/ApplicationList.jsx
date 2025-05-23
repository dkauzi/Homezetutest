// src/components/ApplicationList.jsx
import { useState } from 'react';

export default function ApplicationList({ applications }) {
  const [selectedApp, setSelectedApp] = useState(null);

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold mb-6">Recent Applications</h2>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.map(app => (
              <tr 
                key={app.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedApp(app)}
              >
                <td className="px-6 py-4 whitespace-nowrap">{app.profiles?.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{app.jobs?.title}</td>
                <td className="px-6 py-4">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    New
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(app.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Application Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-xl font-bold mb-4">Application Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Original Resume</h4>
                <p className="text-gray-600 whitespace-pre-wrap">{selectedApp.original_resume}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Optimized Resume</h4>
                <p className="text-gray-600 whitespace-pre-wrap">{selectedApp.optimized_resume}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedApp(null)}
              className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}