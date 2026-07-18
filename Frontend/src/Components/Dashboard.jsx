import React from 'react';
import { useAuth } from '../context/AuthContext';
import CitizenDashboard from './CitizenDashboard';
import OfficialDashboard from './OfficialDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  // Route to the appropriate specific UI layout depending on account type
  if (user?.role === 'official') {
    return <OfficialDashboard user={user} />;
  }

  return <CitizenDashboard user={user} />;
};

export default Dashboard;