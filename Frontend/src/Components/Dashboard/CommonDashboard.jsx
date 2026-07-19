import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Loader2, AlertCircle, FileText, CheckCircle, Flame, BarChart3, TrendingUp, Award, AwardIcon, ShieldAlert, Sparkles, HelpCircle, Activity } from 'lucide-react';

const MUNICIPAL_DEPARTMENTS = [
  "Public Works Department (PWD) / Infrastructure",
  "Water & Sewage Bureau",
  "Electricity Supply Board",
  "Sanitation & Waste Management Division",
  "Urban Forestry & Parks Bureau",
  "Traffic & Street Light Management"
];

export default function CommonDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Analytical stats
  const [metrics, setMetrics] = useState({
    total: 0,
    open: 0,
    openPercent: 0,
    resolved: 0,
    resolvedPercent: 0,
    escalated: 0,
    escalatedPercent: 0,
    avgResolutionDays: 0
  });

  const [dailyTimeline, setDailyTimeline] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [severityCounts, setSeverityCounts] = useState([]);

  useEffect(() => {
    fetchDashboardAnalytics();
  }, []);

  const fetchDashboardAnalytics = async () => {
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
        throw new Error(result.message || 'Failed to sync with municipal database.');
      }

      const data = result.complaints || [];
      setComplaints(data);
      computeAnalytics(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error communicating with analytics data layers.');
      setLoading(false);
    }
  };

  const computeAnalytics = (allComplaints) => {
    const total = allComplaints.length;
    let openCount = 0;
    let resolvedCount = 0;
    let escalatedCount = 0;
    let totalResolutionMs = 0;
    let resolutionCountWithTime = 0;

    // Severity mapping
    const severityMap = { High: 0, Medium: 0, Low: 0 };

    // Daily timeline grouping
    const dailyMap = {};

    // Department leaderboard mapping
    const deptResolvedMap = {};
    MUNICIPAL_DEPARTMENTS.forEach(dept => {
      deptResolvedMap[dept] = { name: dept, total: 0, resolved: 0, open: 0, escalated: 0 };
    });

    allComplaints.forEach(c => {
      const status = c.status || 'Open';
      if (status === 'Open') openCount++;
      else if (status === 'Resolved') resolvedCount++;
      else if (status === 'Escalated') escalatedCount++;

      // Resolution times average
      if (status === 'Resolved' && c.resolvedAt) {
        const createDate = new Date(c.createdAt);
        const resolveDate = new Date(c.resolvedAt);
        const duration = resolveDate - createDate;
        if (duration > 0) {
          totalResolutionMs += duration;
          resolutionCountWithTime++;
        }
      }

      // Severity aggregation
      const sev = c.severity || 'Medium';
      if (severityMap[sev] !== undefined) {
        severityMap[sev]++;
      } else {
        severityMap['Medium']++;
      }

      // Daily grouping: YYYY-MM-DD
      const dateStr = new Date(c.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      });
      dailyMap[dateStr] = (dailyMap[dateStr] || 0) + 1;

      // Department grouping
      let dept = c.department;
      if (!dept || !MUNICIPAL_DEPARTMENTS.includes(dept)) {
        dept = 'Other / Municipal Services';
      }
      if (!deptResolvedMap[dept]) {
        deptResolvedMap[dept] = { name: dept, total: 0, resolved: 0, open: 0, escalated: 0 };
      }
      deptResolvedMap[dept].total++;
      if (status === 'Open') deptResolvedMap[dept].open++;
      else if (status === 'Resolved') deptResolvedMap[dept].resolved++;
      else if (status === 'Escalated') deptResolvedMap[dept].escalated++;
    });

    // 1. Core Metrics percentages
    const openPercent = total > 0 ? Math.round((openCount / total) * 100) : 0;
    const resolvedPercent = total > 0 ? Math.round((resolvedCount / total) * 100) : 0;
    const escalatedPercent = total > 0 ? Math.round((escalatedCount / total) * 100) : 0;
    
    const avgResolutionDays = resolutionCountWithTime > 0 
      ? Math.round(totalResolutionMs / (1000 * 60 * 60 * 24 * resolutionCountWithTime)) 
      : 7; // nominal fallback

    setMetrics({
      total,
      open: openCount,
      openPercent,
      resolved: resolvedCount,
      resolvedPercent,
      escalated: escalatedCount,
      escalatedPercent,
      avgResolutionDays
    });

    // 2. Format timeline data: sort chronologically (since it's a timeseries)
    const timelineArray = Object.keys(dailyMap).map(date => ({
      date,
      count: dailyMap[date]
    }));
    // Reverse or sort timeline array by date if needed. Recharts handles keys in array order.
    // For simple telemetry, array order of complaints (reverse createdAt) reversed is correct.
    timelineArray.reverse();
    // Slice to show last 10 days for cleaner chart presentation
    setDailyTimeline(timelineArray.slice(-12));

    // 3. Format Department leaderboard (Sorted by highest number of resolved complaints)
    const leaderboardArray = Object.values(deptResolvedMap);
    leaderboardArray.sort((a, b) => b.resolved - a.resolved);
    setLeaderboard(leaderboardArray);

    // 4. Format Severity counts for Bar graph
    setSeverityCounts([
      { name: 'High Severity', count: severityMap.High, fill: '#ef4444' },
      { name: 'Medium Severity', count: severityMap.Medium, fill: '#f59e0b' },
      { name: 'Low Severity', count: severityMap.Low, fill: '#3b82f6' }
    ]);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="text-amber-500 animate-spin" size={32} />
        <span className="font-mono text-xs uppercase text-slate-500 tracking-wider">Compiling Analytical Telemetry Grids...</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 text-white text-left animate-fadeIn">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-900 pb-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-slate-500 block">Unified NagarSeva Operations</span>
          <h2 className="font-display text-4xl font-black tracking-wider text-white mt-0.5 uppercase">Civic Analytics Dashboard</h2>
        </div>
        <div className="px-3.5 py-2 bg-[#0b1329]/50 border border-slate-800 rounded-xl flex items-center gap-2 self-start sm:self-auto">
          <Activity size={14} className="text-amber-500 animate-pulse" />
          <span className="font-mono text-xs text-slate-300">Live Database Feed Synced</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={16} />
          <p className="text-red-400 font-mono text-xs font-medium">{error}</p>
        </div>
      )}

      {/* Analytical Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Docket Card */}
        <div className="bg-[#0b1329]/30 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden group">
          <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500 block mb-1">TOTAL DOCKETS FILED</span>
          <span className="text-3xl font-display font-black text-white">{metrics.total}</span>
          <span className="text-[10px] text-slate-400 block mt-1 font-mono">across all municipal wards</span>
          <div className="absolute right-4 bottom-4 w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-white transition-colors">
            <FileText size={14} />
          </div>
        </div>

        {/* Resolved % Card */}
        <div className="bg-[#0b1329]/30 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden group">
          <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-400 block mb-1">RESOLVE SPEED</span>
          <span className="text-3xl font-display font-black text-emerald-400">{metrics.resolvedPercent}%</span>
          <span className="text-[10px] text-slate-400 block mt-1 font-mono">{metrics.resolved} cases fully resolved</span>
          <div className="absolute right-4 bottom-4 w-8 h-8 rounded-lg bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle size={14} />
          </div>
        </div>

        {/* Escalated % Card */}
        <div className="bg-[#0b1329]/30 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden group">
          <span className="font-mono text-[9px] uppercase tracking-wider text-red-400 block mb-1">SLA BREACH ESCALATIONS</span>
          <span className="text-3xl font-display font-black text-red-400">{metrics.escalatedPercent}%</span>
          <span className="text-[10px] text-slate-400 block mt-1 font-mono">{metrics.escalated} delayed reports escalated</span>
          <div className="absolute right-4 bottom-4 w-8 h-8 rounded-lg bg-red-950/20 border border-red-500/30 flex items-center justify-center text-red-400">
            <Flame size={14} />
          </div>
        </div>

        {/* Response speed Card */}
        <div className="bg-[#0b1329]/30 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden group">
          <span className="font-mono text-[9px] uppercase tracking-wider text-amber-500 block mb-1">AVG RESOLUTION TIME</span>
          <span className="text-3xl font-display font-black text-amber-500">{metrics.avgResolutionDays} Days</span>
          <span className="text-[10px] text-slate-400 block mt-1 font-mono">average dispatch clearance time</span>
          <div className="absolute right-4 bottom-4 w-8 h-8 rounded-lg bg-amber-950/20 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <Clock size={14} />
          </div>
        </div>

      </div>

      {/* Main Charts & Timelines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Timeline Line Chart: Complaints Per Day */}
        <div className="lg:col-span-8 bg-[#0b1329]/20 border border-slate-800/80 p-6 rounded-3xl space-y-4 shadow-xl">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500 block mb-0.5">TimeSeries telemetry</span>
            <h3 className="font-display text-lg font-bold uppercase tracking-wide">Complaints Filed Per Day</h3>
          </div>

          {dailyTimeline.length === 0 ? (
            <div className="h-64 flex items-center justify-center font-mono text-xs text-slate-500">
              [ Insufficient date data in database to plot daily trends ]
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTimeline} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b/40" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0b1329', borderColor: '#334155', borderRadius: '12px' }}
                    labelStyle={{ color: '#e2e8f0', fontFamily: 'monospace', fontSize: '11px' }}
                    itemStyle={{ color: '#f59e0b', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#f59e0b" 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                    name="Complaints Filed" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Severity Metrics Distribution Pie/Bar */}
        <div className="lg:col-span-4 bg-[#0b1329]/20 border border-slate-800/80 p-6 rounded-3xl space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500 block mb-0.5">Operational Risk profile</span>
            <h3 className="font-display text-lg font-bold uppercase tracking-wide">Severity Distribution</h3>
          </div>

          <div className="h-44 w-full my-auto flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityCounts} layout="vertical" margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b/20" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={9} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={9} tickLine={false} width={80} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0b1329', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {severityCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="border-t border-slate-900/60 pt-3 flex justify-between items-center text-[10px] text-slate-400 font-mono">
            <span>High Severity risk overlays</span>
            <span className="text-red-400 font-bold">{severityCounts.find(s => s.name === 'High Severity')?.count || 0} Open grids</span>
          </div>
        </div>

      </div>

      {/* DEPARTMENT RESOLVED LEADERBOARD */}
      <div className="bg-[#0b1329]/20 border border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-900 pb-3">
          <div className="flex items-center gap-2">
            <Award className="text-amber-500" size={18} />
            <h3 className="font-display text-xl font-bold uppercase tracking-wider">
              Department Performance Leaderboard
            </h3>
          </div>
          <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500">Ranked by Resolved Count</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Rankers List */}
          <div className="space-y-4">
            {leaderboard.slice(0, 3).map((dept, index) => {
              const medalColors = ['text-yellow-500 bg-yellow-500/10 border-yellow-500/25', 'text-slate-300 bg-slate-300/10 border-slate-300/25', 'text-amber-600 bg-amber-600/10 border-amber-600/25'];
              
              return (
                <div 
                  key={index}
                  className="p-4 bg-[#0b1329]/40 border border-slate-800/50 rounded-2xl flex items-center justify-between hover:bg-[#0b1329]/60 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    {/* Medal rank box */}
                    <div className={`w-8 h-8 rounded-lg border font-mono font-bold flex items-center justify-center text-sm ${medalColors[index] || 'text-slate-500 bg-slate-900 border-slate-800'}`}>
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">{dept.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-mono">
                        <span>Total Filed: <strong>{dept.total}</strong></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                        <span className="text-amber-500">Open: <strong>{dept.open}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-[10px] uppercase text-emerald-400 block mb-0.5">Resolved</span>
                    <span className="text-xl font-display font-black text-emerald-400">{dept.resolved}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Remaining departments table details */}
          <div className="overflow-x-auto border border-slate-900 bg-[#0b1329]/10 rounded-2xl p-4 self-stretch flex flex-col justify-between">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-950 font-mono text-[9px] uppercase tracking-wider text-slate-500 pb-2">
                  <th className="pb-2 w-3/5">Other Departments</th>
                  <th className="pb-2 text-center">Total</th>
                  <th className="pb-2 text-center text-emerald-400">Resolved</th>
                  <th className="pb-2 text-center text-red-400">Escalated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-950 text-slate-300">
                {leaderboard.slice(3).map((dept, index) => (
                  <tr key={index} className="hover:bg-[#0b1329]/20 transition-colors">
                    <td className="py-2.5 font-medium">{dept.name}</td>
                    <td className="py-2.5 text-center font-mono font-bold">{dept.total}</td>
                    <td className="py-2.5 text-center font-mono font-bold text-emerald-400">{dept.resolved}</td>
                    <td className="py-2.5 text-center font-mono font-bold text-red-400">{dept.escalated}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-slate-950 pt-2.5 text-[9px] text-slate-500 font-mono text-right uppercase tracking-wider">
              Leaderboard updates dynamically on grievance status changes
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
