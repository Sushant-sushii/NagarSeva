import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CitizenDashboard from './CitizenDashboard';
import OfficialDashboard from './OfficialDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  
  // ऑफिशियल के लिए डिफ़ॉल्ट 'complaints' और सिटिजन के लिए 'report'
  const defaultTab = user?.role === 'official' ? 'complaints' : 'report';
  const [activeTab, setActiveTab] = useState(defaultTab);

  if (user?.role === 'official') {
    return <OfficialDashboard user={user} activeTab={activeTab} setActiveTab={setActiveTab} />;
  }

  return <CitizenDashboard user={user} activeTab={activeTab} setActiveTab={setActiveTab} />;
};

export default Dashboard;