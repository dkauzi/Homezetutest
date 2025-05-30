import { Outlet } from 'react-router-dom';
import UserMenu from './UserMenu';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-blue-100 font-sans">
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <a href="/" className="text-3xl font-extrabold text-blue-700 tracking-tight">TrueQuestJobs</a>
          <UserMenu />
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto px-4 py-12 w-full">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-blue-100 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">Powered by</span>
            <span className="font-bold text-blue-700 text-base">TrueQuestJobs</span>
          </div>
          <UserMenu />
        </div>
      </footer>
    </div>
  );
}