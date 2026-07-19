import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CitizenDashboard from './CitizenDashboard';
import OfficialDashboard from './OfficialDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  const role = user?.role || 'citizen';
  
  // Load tab from localStorage depending on role
  const getInitialTab = () => {
    const saved = localStorage.getItem(`activeTab_${role}`);
    if (saved) return saved;
    return role === 'official' ? 'complaints' : 'report';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  // Sync activeTab to localStorage on change
  useEffect(() => {
    localStorage.setItem(`activeTab_${role}`, activeTab);
  }, [activeTab, role]);

  if (user?.role === 'official') {
    return <OfficialDashboard user={user} activeTab={activeTab} setActiveTab={setActiveTab} />;
  }

  return <CitizenDashboard user={user} activeTab={activeTab} setActiveTab={setActiveTab} />;
};

export default Dashboard;