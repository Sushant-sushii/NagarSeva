import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, FileText, CheckCircle, Flame, BarChart3, TrendingUp, ShieldAlert, ArrowRight, MapPin, Calendar, Clock, X } from 'lucide-react';

const MUNICIPAL_DEPARTMENTS = [
  "Public Works Department (PWD) / Infrastructure",
  "Water & Sewage Bureau",
  "Electricity Supply Board",
  "Sanitation & Waste Management Division",
  "Urban Forestry & Parks Bureau",
  "Traffic & Street Light Management"
];

export default function TotalComplaints({ user }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Aggregated data list
  const [departmentStats, setDepartmentStats] = useState([]);
  const [overallTotals, setOverallTotals] = useState({
    total: 0,
    open: 0,
    resolved: 0,
    escalated: 0,
    complianceRate: 0
  });

  // Access Control selection states
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDeptComplaints, setSelectedDeptComplaints] = useState([]);
  const [accessDeniedError, setAccessDeniedError] = useState('');

  const statusColors = {
    Open: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
    Resolved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    Escalated: 'text-red-400 bg-red-500/10 border-red-500/30',
  };

  useEffect(() => {
    fetchTotalComplaints();
  }, []);

  const fetchTotalComplaints = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/complains?limit=1000', {
        method: 'GET',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to query system grievance database.');
      }

      const data = result.complaints || [];
      setComplaints(data);
      calculateAggregates(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching total complaints aggregates:', err);
      setError(err.message || 'Error connecting to municipal grievance registry.');
      setLoading(false);
    }
  };

  const calculateAggregates = (allComplaints) => {
    const statsMap = {};
    MUNICIPAL_DEPARTMENTS.forEach(dept => {
      statsMap[dept] = { name: dept, total: 0, open: 0, resolved: 0, escalated: 0 };
    });

    let overallTotal = 0;
    let overallOpen = 0;
    let overallResolved = 0;
    let overallEscalated = 0;

    allComplaints.forEach(c => {
      let deptName = c.department;
      
      if (!deptName || !MUNICIPAL_DEPARTMENTS.includes(deptName)) {
        deptName = 'Other / Municipal Services';
      }

      if (!statsMap[deptName]) {
        statsMap[deptName] = { name: deptName, total: 0, open: 0, resolved: 0, escalated: 0 };
      }

      statsMap[deptName].total += 1;
      overallTotal += 1;

      const status = c.status || 'Open';
      if (status === 'Open') {
        statsMap[deptName].open += 1;
        overallOpen += 1;
      } else if (status === 'Resolved') {
        statsMap[deptName].resolved += 1;
        overallResolved += 1;
      } else if (status === 'Escalated') {
        statsMap[deptName].escalated += 1;
        overallEscalated += 1;
      }
    });

    const statsArray = Object.values(statsMap);
    statsArray.sort((a, b) => b.total - a.total);
    setDepartmentStats(statsArray);

    const rate = overallTotal > 0 ? Math.round((overallResolved / overallTotal) * 100) : 0;

    setOverallTotals({
      total: overallTotal,
      open: overallOpen,
      resolved: overallResolved,
      escalated: overallEscalated,
      complianceRate: rate
    });
  };

  // Click Handler for Access Control
  const handleDepartmentClick = (deptName) => {
    // Clear previous feedback states
    setAccessDeniedError('');
    setSelectedDept('');
    setSelectedDeptComplaints([]);

    // Check if clicked department matches the official user's department
    const officialDept = user?.department || '';

    if (officialDept.toLowerCase() === deptName.toLowerCase()) {
      // Access granted: Filter and show complaints
      const filtered = complaints.filter(c => {
        let cDept = c.department;
        if (!cDept || !MUNICIPAL_DEPARTMENTS.includes(cDept)) {
          cDept = 'Other / Municipal Services';
        }
        return cDept.toLowerCase() === deptName.toLowerCase();
      });
      
      setSelectedDeptComplaints(filtered);
      setSelectedDept(deptName);
    } else {
      // Access Denied: Set error statement
      setAccessDeniedError(`Access Denied: You belong to "${officialDept}" and do not have access privileges to view grievance records for "${deptName}".`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="text-amber-500 animate-spin" size={32} />
        <span className="font-mono text-xs uppercase text-slate-500 tracking-wider">Compiling Department Aggregates Metrics...</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 text-white text-left animate-fadeIn">
      {/* Header Block */}
      <div className="border-b border-slate-900 pb-4">
        <span className="font-mono text-xs uppercase tracking-widest text-slate-500 block">Municipal Operations Summaries</span>
        <h2 className="font-display text-4xl font-black tracking-wider text-white mt-0.5 uppercase">Total Complaints Hub</h2>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={16} />
          <p className="text-red-400 font-mono text-xs font-medium">{error}</p>
        </div>
      )}

      {/* Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-[#0b1329]/30 border border-slate-800/80 p-5 rounded-2xl">
          <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500 block mb-1">TOTAL DOCKETS</span>
          <span className="text-3xl font-display font-black text-white">{overallTotals.total}</span>
        </div>
        
        <div className="bg-[#0b1329]/30 border border-slate-800/80 p-5 rounded-2xl">
          <span className="font-mono text-[9px] uppercase tracking-wider text-amber-500 block mb-1">OPEN GRIDS</span>
          <span className="text-3xl font-display font-black text-amber-500">{overallTotals.open}</span>
        </div>

        <div className="bg-[#0b1329]/30 border border-slate-800/80 p-5 rounded-2xl">
          <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-400 block mb-1">RESOLVED TASKS</span>
          <span className="text-3xl font-display font-black text-emerald-400">{overallTotals.resolved}</span>
        </div>

        <div className="bg-[#0b1329]/30 border border-slate-800/80 p-5 rounded-2xl">
          <span className="font-mono text-[9px] uppercase tracking-wider text-red-400 block mb-1">ESCALATED DELAYS</span>
          <span className="text-3xl font-display font-black text-red-400">{overallTotals.escalated}</span>
        </div>

        <div className="bg-[#0b1329]/30 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-wider text-cyan-400 block mb-1">SLA RESOLVED RATE</span>
            <span className="text-3xl font-display font-black text-cyan-400">{overallTotals.complianceRate}%</span>
          </div>
          <TrendingUp className="text-cyan-500/40" size={24} />
        </div>
      </div>

      {/* Aggregates Table Container */}
      <div className="bg-[#0b1329]/20 border border-slate-800/80 rounded-2xl p-5 overflow-hidden shadow-xl">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-900 pb-3">
          <BarChart3 className="text-amber-500" size={16} />
          <span className="font-mono text-xs uppercase tracking-wider font-bold text-slate-300">Department Metrics Aggregation Matrix</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                <th className="pb-3 pl-2 w-2/5">Municipal Department</th>
                <th className="pb-3 text-center">Total filed</th>
                <th className="pb-3 text-center text-amber-500">Open</th>
                <th className="pb-3 text-center text-emerald-400">Resolved</th>
                <th className="pb-3 text-center text-red-400">Escalated</th>
                <th className="pb-3 pr-2 text-right">Resolve rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-sm">
              {departmentStats.map((stat, index) => {
                const rate = stat.total > 0 ? Math.round((stat.resolved / stat.total) * 100) : 0;
                
                return (
                  <tr 
                    key={index} 
                    onClick={() => handleDepartmentClick(stat.name)}
                    className="hover:bg-[#0b1329]/50 transition-colors cursor-pointer"
                    title={`Click to query ${stat.name} records`}
                  >
                    <td className="py-4 pl-2 font-bold text-slate-200 hover:text-amber-400 transition-colors">{stat.name}</td>
                    
                    <td className="py-4 text-center font-mono text-slate-300 font-semibold">{stat.total}</td>
                    
                    <td className="py-4 text-center font-mono text-amber-500 font-semibold">{stat.open}</td>
                    
                    <td className="py-4 text-center font-mono text-emerald-400 font-semibold">{stat.resolved}</td>
                    
                    <td className="py-4 text-center font-mono text-red-400 font-semibold">{stat.escalated}</td>
                    
                    <td className="py-4 pr-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-mono text-xs text-slate-400">{rate}%</span>
                        <div className="w-16 h-1.5 bg-slate-850 rounded-full overflow-hidden hidden sm:block">
                          <div 
                            className={`h-full rounded-full ${
                              rate >= 80 ? 'bg-emerald-500' : rate >= 50 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${rate}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ACCESS WARNING BLOCK */}
      {accessDeniedError && (
        <div className="p-5 bg-red-950/45 border border-red-500/30 rounded-3xl flex items-start gap-3.5 animate-fadeIn max-w-2xl mx-auto shadow-lg">
          <ShieldAlert className="text-red-400 shrink-0 mt-0.5" size={20} />
          <div className="space-y-1">
            <h4 className="font-mono text-xs uppercase font-bold text-red-400 tracking-wider">Access Clearance Rejection</h4>
            <p className="text-red-300/80 text-xs font-semibold leading-relaxed font-mono">
              {accessDeniedError}
            </p>
          </div>
        </div>
      )}

      {/* DETAILED GRIDS BLOCK IF PERMITTED */}
      {selectedDept && (
        <div className="bg-[#0b1329]/20 border border-slate-800/80 rounded-3xl p-6 overflow-hidden shadow-2xl animate-fadeIn space-y-4">
          <div className="flex justify-between items-center border-b border-slate-900 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="text-emerald-400" size={16} />
              <span className="font-mono text-xs uppercase tracking-wider font-bold text-slate-300">
                Department Grid Records: {selectedDept}
              </span>
            </div>
            <button 
              onClick={() => { setSelectedDept(''); setSelectedDeptComplaints([]); }}
              className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-900 transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {selectedDeptComplaints.length === 0 ? (
            <div className="text-center py-10 font-mono text-xs text-slate-500">
              [ No dockets currently logged in this department ]
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                    <th className="pb-3 pl-2">Ticket ID</th>
                    <th className="pb-3">Citizen</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3 w-1/3">Issue description</th>
                    <th className="pb-3">Local Area</th>
                    <th className="pb-3">Pincode</th>
                    <th className="pb-3">Filed Date</th>
                    <th className="pb-3 pr-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-sm">
                  {selectedDeptComplaints.map((c, index) => {
                    const citizenName = c.citizenId 
                      ? `${c.citizenId.firstName} ${c.citizenId.LastName}` 
                      : 'Anonymous';
                      
                    return (
                      <tr key={index} className="hover:bg-[#0b1329]/30 transition-colors">
                        <td className="py-3 pl-2 font-mono text-xs text-amber-500 font-semibold">
                          CMP-{c._id.substring(18).toUpperCase()}
                        </td>
                        <td className="py-3 font-semibold text-slate-300">{citizenName}</td>
                        <td className="py-3 text-slate-300">{c.category}</td>
                        <td className="py-3 text-slate-400 text-xs leading-relaxed max-w-xs">{c.description}</td>
                        <td className="py-3 text-slate-300 font-mono text-xs">{c.localArea || 'N/A'}</td>
                        <td className="py-3 text-slate-300 font-mono text-xs">{c.wardNumber}</td>
                        <td className="py-3 font-mono text-xs text-slate-500">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 pr-2 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase ${statusColors[c.status || 'Open']}`}>
                            {c.status || 'Open'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
