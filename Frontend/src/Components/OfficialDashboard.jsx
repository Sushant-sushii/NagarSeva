import React, { useState } from 'react';
import Sidebar from './Dashboard/Sidebar';
import MetricsCard from './Dashboard/MetricsCard';
import ComplaintRow from './Dashboard/ComplaintRow';

const OfficialDashboard = ({ user }) => {
  const [currentTab, setCurrentTab] = useState('overview');
  
  const [tickets, setTickets] = useState([
    { id: "904", title: "Drainage back-flooding main avenue route", wardLocation: "Lucknow Sector 4", status: "Pending", reporter: "Sushant Singh", date: "2026-07-19" },
    { id: "905", title: "Broken concrete sidewalk divider structures", wardLocation: "Chowk Area Main Rd", status: "In Progress", reporter: "Amit Verma", date: "2026-07-16" }
  ]);

  const handleStatusChange = (id, newStatus) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        role="Official Panel" 
        metadata={user?.department || "Public Infrastructure Board"} 
      />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8 border-b border-slate-800 pb-5">
          <h1 className="text-2xl font-bold text-white">Administrative Console ({user?.firstName || 'Officer'})</h1>
          <p className="text-sm text-gray-400">Manage internal resolution tracking workflows and operations dispatch pipelines.</p>
        </div>

        {currentTab === 'overview' ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricsCard title="Assigned Backlog" value={tickets.filter(t => t.status === 'Pending').length} change="Unattended Action Items" color="red" />
              <MetricsCard title="In-Execution Queue" value={tickets.filter(t => t.status === 'In Progress').length} change="Field Units Deployed" color="amber" />
              <MetricsCard title="Archived Resolutions" value={tickets.filter(t => t.status === 'Resolved').length} change="Performance Targets Met" color="green" />
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4">⚡ Incoming Department Operations Workorders</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700 text-gray-400 text-xs font-semibold uppercase">
                      <th className="pb-3 pl-4">Ticket ID</th>
                      <th className="pb-3">Grievance Description Narrative</th>
                      <th className="pb-3 hidden md:table-cell">Filing Reporter</th>
                      <th className="pb-3">Reporting Area Location</th>
                      <th className="pb-3">Filing Date</th>
                      <th className="pb-3 text-right pr-4">Update Operation Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {tickets.map((ticket) => (
                      <ComplaintRow 
                        key={ticket.id} 
                        complaint={ticket} 
                        isOfficial={true} 
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">📁 Department Archive Logs</h3>
            <p className="text-sm text-gray-400">Historical performance metrics logs mapped inside your current department jurisdiction scope.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default OfficialDashboard;