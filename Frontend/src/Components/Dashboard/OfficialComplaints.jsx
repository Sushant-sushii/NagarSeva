import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Flame, Filter } from 'lucide-react';

const INITIAL_COMPLAINTS = [
  { id: 'CP-1042', ward: 'Ward 3', issue: 'Main Road Water Logging', date: '2026-07-18', status: 'Open' },
  { id: 'CP-1043', ward: 'Ward 8', issue: 'Street Light Failure near Square', date: '2026-07-17', status: 'Resolved' },
  { id: 'CP-1044', ward: 'Ward 14', issue: 'Garbage Dump Overflow', date: '2026-07-15', status: 'Escalated' },
  { id: 'CP-1045', ward: 'Ward 3', issue: 'Pothole Hazard near School', date: '2026-07-14', status: 'Open' },
  { id: 'CP-1046', ward: 'Ward 12', issue: 'Drainage Blockage', date: '2026-07-12', status: 'Resolved' },
];

export default function OfficialComplaints() {
  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);
  const [selectedWardFilter, setSelectedWardFilter] = useState('All');

  // स्टेटस अपडेट हैंडलर
  const handleStatusChange = (id, newStatus) => {
    setComplaints(prev => 
      prev.map(c => c.id === id ? { ...c, status: newStatus } : c)
    );
  };

  const statusColors = {
    Open: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
    Resolved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    Escalated: 'text-red-400 bg-red-500/10 border-red-500/30',
  };

  const filteredComplaints = selectedWardFilter === 'All' 
    ? complaints 
    : complaints.filter(c => c.ward === selectedWardFilter);

  return (
    <div className="w-full space-y-6 text-white">
      {/* Upper Title Row */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-slate-500">
            Nagar Seva Operations
          </span>
          <h2 className="font-display text-4xl font-black tracking-wider text-white mt-0.5 uppercase">
            Ward Complaints Section
          </h2>
        </div>

        {/* Filter Widget */}
        <div className="flex items-center gap-2 bg-[#0b1329]/40 border border-slate-800 px-3 py-1.5 rounded-xl self-end">
          <Filter size={14} className="text-slate-400" />
          <select 
            value={selectedWardFilter}
            onChange={(e) => setSelectedWardFilter(e.target.value)}
            className="bg-transparent text-xs font-mono text-slate-300 outline-none cursor-pointer"
          >
            <option value="All" className="bg-[#060A14]">All Wards</option>
            <option value="Ward 3" className="bg-[#060A14]">Ward 3</option>
            <option value="Ward 8" className="bg-[#060A14]">Ward 8</option>
            <option value="Ward 12" className="bg-[#060A14]">Ward 12</option>
            <option value="Ward 14" className="bg-[#060A14]">Ward 14</option>
          </select>
        </div>
      </div>

      {/* Main Grid/Table Shell */}
      <div className="bg-[#0b1329]/20 border border-slate-800/80 rounded-2xl p-5 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                <th className="pb-3 pl-2">ID</th>
                <th className="pb-3">Ward Node</th>
                <th className="pb-3 w-1/3">Issue Description</th>
                <th className="pb-3">Filed Date</th>
                <th className="pb-3">Current Status</th>
                <th className="pb-3 pr-2 text-right">Change Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-sm">
              {filteredComplaints.map((c) => (
                <tr key={c.id} className="hover:bg-[#0b1329]/30 transition-colors">
                  <td className="py-4 pl-2 font-mono text-amber-500 font-semibold">{c.id}</td>
                  <td className="py-4 font-bold text-slate-200">{c.ward}</td>
                  <td className="py-4 text-slate-300 pr-4">{c.issue}</td>
                  <td className="py-4 font-mono text-xs text-slate-400">{c.date}</td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-semibold border ${statusColors[c.status]}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-4 pr-2 text-right">
                    {/* Status Modifiers Dropdown */}
                    <select
                      value={c.status}
                      onChange={(e) => handleStatusChange(c.id, e.target.value)}
                      className="bg-[#060A14] border border-slate-800 text-xs font-mono text-slate-300 rounded-lg px-2 py-1 outline-none cursor-pointer focus:border-amber-500/50"
                    >
                      {['Open', 'Resolved', 'Escalated'].map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}