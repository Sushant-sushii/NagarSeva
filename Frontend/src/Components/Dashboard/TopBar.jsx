import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Clock, Shield, Navigation, BarChart3, Bell, FileText, Layers } from 'lucide-react';

export default function TopBar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();

  // रोल के आधार पर नेविगेशन आइटम्स तय करना
  const citizenItems = [
    { id: 'report', label: 'Report Issue', icon: Plus },
    { id: 'track', label: 'Track', icon: Clock },
    { id: 'announcements', label: 'Announcements', icon: Bell },
    { id: 'safety-map', label: 'Safety Map', icon: Shield },
    { id: 'safe-routes', label: 'Safe Routes', icon: Navigation },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  ];

  const officialItems = [
    { id: 'complaints', label: 'Complaints', icon: FileText },
    { id: 'total-complaints', label: 'Total Complaints', icon: Layers },
    { id: 'announcements', label: 'Announcements', icon: Bell },
    { id: 'safety-map', label: 'Safety Map', icon: Shield },
    { id: 'safe-routes', label: 'Safe Routes', icon: Navigation },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  ];

  const navItems = user?.role === 'official' ? officialItems : citizenItems;

  return (
    <header className="w-full bg-[#060A14]/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-md border border-amber-500/40 flex items-center justify-center text-amber-500 bg-amber-500/5">
          <Shield size={14} className="text-amber-500" />
        </div>
        <div>
          <h1 className="font-display text-sm font-bold tracking-widest leading-none text-white uppercase">
            CIVICPULSE
          </h1>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mt-0.5">
            Civic Grievance & Safety Agent
          </span>
        </div>
      </div>

      {/* Dynamic Navigation Layer */}
      <nav className="hidden md:flex items-center gap-6 h-full self-stretch pt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab && setActiveTab(item.id)}
              className="flex items-center gap-2 px-1 pb-2 font-mono text-xs font-medium tracking-wide transition-all cursor-pointer relative border-b-2 bg-transparent"
              style={{
                borderColor: isActive ? '#f59e0b' : 'transparent', // Match the yellow/amber indicator line
                color: isActive ? '#f59e0b' : '#94a3b8',
              }}
            >
              <Icon size={14} className={isActive ? 'text-amber-500' : 'text-slate-400'} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Control Actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-mono text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          AI Active
        </div>

        <button className="p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white relative border border-slate-800 cursor-pointer">
          <Bell size={14} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
        </button>

        <button 
          onClick={logout}
          className="font-mono text-[10px] uppercase text-red-400 border border-red-500/20 px-2 py-1 rounded-lg hover:bg-red-500/10 transition-all cursor-pointer ml-2"
        >
          Exit
        </button>
      </div>
    </header>
  );
}