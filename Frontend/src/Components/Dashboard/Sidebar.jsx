import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ currentTab, setCurrentTab, role, metadata }) => {
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col justify-between h-screen sticky top-0">
      <div className="p-6">
        {/* Branding Logo Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a.75.75 0 00-1.788 0l-7 140a.75.75 0 001.721.894l1.591-7.955h6.952l1.591 7.955a.75.75 0 101.721-.894l-7-140zM12.798 7H7.202L10 2.5l2.798 4.5z" />
            </svg>
          </div>
          <div>
            <h2 className="text-md font-bold text-white tracking-wide">CIVICPULSE</h2>
            <p className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">{role}</p>
          </div>
        </div>

        {/* Scope Info Container */}
        {metadata && (
          <div className="mb-6 p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-xs">
            <span className="text-gray-400 block mb-0.5 font-medium">Scope Area:</span>
            <span className="text-amber-400 font-semibold truncate block">{metadata}</span>
          </div>
        )}

        {/* Navigation Item Links */}
        <nav className="space-y-1.5">
          <button
            onClick={() => setCurrentTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all text-left ${
              currentTab === 'overview'
                ? 'bg-amber-400 text-slate-900 shadow-lg shadow-amber-400/10'
                : 'text-gray-400 hover:bg-slate-700/60 hover:text-white'
            }`}
          >
            📊 Overview Panel
          </button>
          <button
            onClick={() => setCurrentTab('complaints')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all text-left ${
              currentTab === 'complaints'
                ? 'bg-amber-400 text-slate-900 shadow-lg shadow-amber-400/10'
                : 'text-gray-400 hover:bg-slate-700/60 hover:text-white'
            }`}
          >
            📁 Grievances List
          </button>
        </nav>
      </div>

      {/* Logout Action Footer */}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left"
        >
          🚪 Sign Out Session
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;