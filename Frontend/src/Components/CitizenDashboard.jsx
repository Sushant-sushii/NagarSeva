import React, { useState } from 'react';
import Sidebar from './Dashboard/Sidebar';
import MetricsCard from './Dashboard/MetricsCard';
import ComplaintRow from './Dashboard/ComplaintRow';

const CitizenDashboard = ({ user }) => {
  const [currentTab, setCurrentTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [complaints, setComplaints] = useState([
    { id: "101", title: "Streetlight outage near primary square", department: "Electricity & Public Lighting Board", status: "Pending", date: "2026-07-18" },
    { id: "102", title: "Open garbage dump causing blockage", department: "Sanitation & Waste Management", status: "In Progress", date: "2026-07-15" }
  ]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        role="Citizen Portal" 
        metadata={user?.wardLocation || "Lucknow Ward Centric"} 
      />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome Back, {user?.firstName || 'Citizen'}!</h1>
            <p className="text-sm text-gray-400">Track current regional performance metrics and logs for your ward area.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-900 font-bold rounded-lg shadow-lg transition-all text-sm transform hover:-translate-y-0.5"
          >
            ➕ File New Grievance
          </button>
        </div>

        {currentTab === 'overview' ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricsCard title="Total Filed Logs" value={complaints.length} change="Active Records" color="cyan" />
              <MetricsCard title="Resolved Status" value={complaints.filter(c => c.status === 'Resolved').length} change="Awaiting Action" color="green" />
              <MetricsCard title="Open Tracking Enforcements" value={complaints.filter(c => c.status !== 'Resolved').length} change="High Priority" color="amber" />
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">⏱️ Recent Filing Records</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700 text-gray-400 text-xs font-semibold uppercase">
                      <th className="pb-3 pl-4">Ticket ID</th>
                      <th className="pb-3">Grievance Issue Details</th>
                      <th className="pb-3 hidden md:table-cell">Assigned Department Target</th>
                      <th className="pb-3">Filing Date</th>
                      <th className="pb-3 text-right pr-4">Progress Tracking</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {complaints.map((item) => (
                      <ComplaintRow 
                        key={item.id} 
                        complaint={item} 
                        isOfficial={false} 
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">📁 Full Archive Records</h3>
            <p className="text-sm text-gray-400">Historical registry logs verified within your database.</p>
          </div>
        )}
      </main>

      {/* Modal Popup Wrapper */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Create Official Grievance Record</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white text-xl font-bold">&times;</button>
            </div>
            <form className="p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Issue Title Summary</label>
                <input type="text" placeholder="Short description of the fault area" className="w-full px-4 py-2.5 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-400 transition-colors" required />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Category Target Department</label>
                <select className="w-full px-4 py-2.5 bg-slate-700 border-2 border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-400 transition-colors">
                  <option>Public Works Department (PWD)</option>
                  <option>Electricity & Public Lighting Board</option>
                  <option>Sanitation & Waste Management</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Detailed Narrative Evidence</label>
                <textarea rows="4" placeholder="Provide accurate addresses, context, or visual notes..." className="w-full px-4 py-2.5 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-400 transition-colors" required></textarea>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg font-semibold text-sm transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-lg font-bold text-sm transition-colors shadow-lg">Submit Issue File</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenDashboard;