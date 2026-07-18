import React, { useState } from 'react';
import Sidebar from './Dashboard/Sidebar';
import MetricsCard from './Dashboard/MetricsCard';

const OfficialDashboard = ({ user }) => {
  const [currentTab, setCurrentTab] = useState('overview');
  
  // Sample administrative incoming logs data
  const [tickets, setTickets] = useState([
    { id: "T-904", title: "Drainage back-flooding main avenue route", location: "Sector 4 Block B", status: "Pending", reporter: "Sushant Singh" },
    { id: "T-905", title: "Broken concrete sidewalk divider structures", location: "Chowk Substation Way", status: "In Progress", reporter: "Amit Verma" }
  ]);

  const handleStatusChange = (id, newStatus) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      {/* Structural Sidebar Menu */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        role="Official Panel" 
        metadata={user?.department || "General Administration"} 
      />

      {/* Main Execution Board Content area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8 border-b border-slate-800 pb-5">
          <h1 className="text-2xl font-bold text-white">Administrative Console ({user?.firstName || 'Officer'})</h1>
          <p className="text-sm text-gray-400">Manage internal resolution tracking workflows and operations dispatch pipelines.</p>
        </div>

        {currentTab === 'overview' ? (
          <div className="space-y-8">
            {/* Quantitative Overview Stat Panels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricsCard title="Assigned Backlog" value={tickets.filter(t => t.status === 'Pending').length} change="Unattended Action Items" color="red" />
              <MetricsCard title="In-Execution Queue" value={tickets.filter(t => t.status === 'In Progress').length} change="Field Units Deployed" color="amber" />
              <MetricsCard title="Archived Resolutions" value="14" change="Performance Targets Met" color="green" />
            </div>

            {/* Comprehensive Operational Interactive Grid Board */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4">⚡ Incoming Department Operations Workorders</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700 text-gray-400 text-xs font-semibold uppercase">
                      <th className="pb-3">Ticket ID</th>
                      <th className="pb-3">Grievance Description Narrative</th>
                      <th className="pb-3">Reporting Area Location</th>
                      <th className="pb-3">Filing Reporter</th>
                      <th className="pb-3 text-right">Update Operation Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50 text-sm">
                    {tickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-slate-700/20 transition-colors">
                        <td className="py-4 font-mono text-amber-400 font-bold">{ticket.id}</td>
                        <td className="py-4 font-medium text-white">{ticket.title}</td>
                        <td className="py-4 text-gray-400">{ticket.location}</td>
                        <td className="py-4 text-gray-400">{ticket.reporter}</td>
                        <td className="py-4 text-right">
                          <select
                            value={ticket.status}
                            onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-700 border text-white cursor-pointer focus:outline-none ${
                              ticket.status === 'Pending' ? 'border-red-500/50 text-red-300' :
                              ticket.status === 'In Progress' ? 'border-amber-500/50 text-amber-300' : 'border-emerald-500/50 text-emerald-300'
                            }`}
                          >
                            <option value="Pending" className="bg-slate-800 text-red-400 font-semibold">🛑 Pending</option>
                            <option value="In Progress" className="bg-slate-800 text-amber-400 font-semibold">⚙️ In Progress</option>
                            <option value="Resolved" className="bg-slate-800 text-emerald-400 font-semibold">✅ Resolved</option>
                          </select>
                        </td>
                      </tr>
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