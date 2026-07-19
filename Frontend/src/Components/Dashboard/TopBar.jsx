import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Clock, Shield, Navigation, BarChart3, Bell, FileText, Layers, Menu, X } from 'lucide-react';

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
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  ];

  const [isOpen, setIsOpen] = useState(false);
  const navItems = user?.role === 'official' ? officialItems : citizenItems;

  return (
    <header className="w-full bg-[#060A14]/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger toggle */}
        <button
          onClick={() => setIsOpen(true)}
          className="flex md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 border border-slate-800 cursor-pointer"
        >
          <Menu size={16} />
        </button>

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
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] hidden sm:flex">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          AI Active
        </div>

        <button className="p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white relative border border-slate-800 cursor-pointer">
          <Bell size={14} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
        </button>

        <button 
          onClick={logout}
          className="font-mono text-[10px] uppercase text-red-400 border border-red-500/20 px-2 py-1 rounded-lg hover:bg-red-500/10 transition-all cursor-pointer ml-2 hidden sm:block"
        >
          Exit
        </button>
      </div>

      {/* Sliding Mobile Navigation Tray */}
      {isOpen && (
        <div className="fixed inset-0 flex" style={{ zIndex: 99999 }}>
          {/* Backdrop Blur Overlay */}
          <div 
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 transition-opacity"
            style={{ 
              backgroundColor: 'rgba(2, 4, 8, 0.75)', 
              backdropFilter: 'blur(6px)',
              zIndex: 99998
            }}
          />

          {/* Sliding Menu Tray */}
          <div 
            className="animate-slideInLeft text-left"
            style={{ 
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              height: '100vh',
              width: '260px',
              backgroundColor: '#000000', 
              color: '#ffffff',
              borderRight: '1px solid #334155',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              zIndex: 99999 
            }}
          >
            <div className="space-y-6">
              {/* Brand Identity / Close */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-white" />
                  <span className="font-display text-xs font-black tracking-wider text-white uppercase">CIVICPULSE</span>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white p-1 hover:bg-slate-900 rounded-lg cursor-pointer"
                  style={{ color: '#ffffff' }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Vertical Navigation Items */}
              <nav className="flex flex-col gap-2.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab && setActiveTab(item.id);
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-mono text-xs font-bold tracking-wide transition-all cursor-pointer w-full text-left bg-transparent"
                      style={{
                        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                        border: isActive ? '1px solid rgba(255, 255, 255, 0.4)' : '1px solid transparent',
                        color: isActive ? '#ffffff' : '#cbd5e1',
                      }}
                    >
                      <Icon size={14} className={isActive ? 'text-white' : 'text-slate-400'} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Exit Signature */}
            <div className="border-t border-slate-800 pt-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 px-1 text-[10px] font-mono text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                AI System Active
              </div>
              <button 
                onClick={() => { logout(); setIsOpen(false); }}
                className="w-full py-2 border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all font-mono text-xs uppercase font-bold rounded-xl cursor-pointer"
                style={{
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.4)'
                }}
              >
                Exit Session
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}