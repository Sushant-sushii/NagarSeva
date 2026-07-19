import React from 'react';
import TopBar from './Dashboard/TopBar';
import ReportIssue from './Dashboard/ReportIssue';
import Track from './Dashboard/Track';
import SafetyMap from './Dashboard/SafetyMap';
import SafeRoutes from './Dashboard/SafeRoutes';
import Announcements from './Dashboard/Announcements';
import WardAnalytics from './Dashboard/WardAnalytics';

export default function CitizenDashboard({ user, activeTab, setActiveTab }) {
  // एक्टिव टैब के आधार पर पेज लोड करने का हेल्पर
  const renderContent = () => {
    switch (activeTab) {
      case 'report':
        return <ReportIssue setActiveTab={setActiveTab} />;
      case 'track':
        return <Track setActiveTab={setActiveTab} />;
      case 'announcements':
        return <Announcements user={user} />;
      case 'safety-map':
        return <SafetyMap />;
      case 'safe-routes':
        return <SafeRoutes />;
      case 'dashboard':
        return <WardAnalytics />;
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