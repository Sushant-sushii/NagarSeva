import React from 'react';
import TopBar from './Dashboard/TopBar';
import WardAnalytics from './Dashboard/WardAnalytics';
import OfficialComplaints from './Dashboard/OfficialComplaints';
import TotalComplaints from './Dashboard/TotalComplaints';
import Announcements from './Dashboard/Announcements';

export default function OfficialDashboard({ user, activeTab, setActiveTab }) {
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <WardAnalytics />;
      case 'complaints':
        return <OfficialComplaints user={user} />;
      case 'total-complaints':
        return <TotalComplaints user={user} />;
      case 'announcements':
        return <Announcements user={user} />;
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