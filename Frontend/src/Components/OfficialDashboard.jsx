import React from 'react';
import TopBar from './Dashboard/TopBar';
import WardAnalytics from './Dashboard/WardAnalytics';
import OfficialComplaints from './Dashboard/OfficialComplaints';

export default function OfficialDashboard({ user, activeTab, setActiveTab }) {
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <WardAnalytics />;
      case 'complaints':
        return <OfficialComplaints />;
      case 'total-complaints':
        return (
          <div className="space-y-4">
            <h2 className="font-display text-3xl font-bold text-white uppercase">Total Complaints Hub</h2>
            <p className="text-slate-400 text-sm">Comprehensive multi-ward operational aggregates view.</p>
            <div className="p-8 border border-slate-800 rounded-xl bg-[#0b1329]/20 text-center text-slate-500 font-mono text-xs">
              [SLA Compliance Core Engine Operational]
            </div>
          </div>
        );
      case 'safety-map':
      case 'safe-routes':
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-2">
            <h3 className="text-xl font-bold font-display uppercase tracking-wider text-amber-500">
              Official: {activeTab.replace('-', ' ')}
            </h3>
            <p className="text-sm text-slate-400 max-w-sm">
              Live mapping overlays running under agency clearance standard.
            </p>
          </div>
        );
      default:
        return <OfficialComplaints />;
    }
  };

  return (
    <div className="min-h-screen bg-[#060A14] text-white flex flex-col">
      <TopBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
}