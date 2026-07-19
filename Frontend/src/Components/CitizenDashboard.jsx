import React from 'react';
import TopBar from './Dashboard/TopBar';
import ReportIssue from './Dashboard/ReportIssue';

export default function CitizenDashboard({ user, activeTab, setActiveTab }) {
  // एक्टिव टैब के आधार पर पेज लोड करने का हेल्पर
  const renderContent = () => {
    switch (activeTab) {
      case 'report':
        return <ReportIssue />;
      case 'track':
      case 'safety-map':
      case 'safe-routes':
      case 'dashboard':
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-2">
            <h3 className="text-xl font-bold font-display uppercase tracking-wider text-amber-500">
              {activeTab.replace('-', ' ')} Layer Active
            </h3>
            <p className="text-sm text-slate-400 max-w-sm">
              This node profile data is restricted or routing live under current configurations.
            </p>
          </div>
        );
      default:
        return <ReportIssue />;
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