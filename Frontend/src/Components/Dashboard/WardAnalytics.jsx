import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import MetricsCard from './MetricsCard';
import ComplaintRow from './ComplaintRow';
import ComplaintModal from './ComplaintModal';

const METRICS = [
  { title: 'Total Complaints', value: '568', subText: 'across 8 wards', color: 'var(--color-foreground)' },
  { title: 'Resolved', value: '59%', subText: '337 complaints', color: 'var(--color-success)', tint: 'green' },
  { title: 'Escalated', value: '42', subText: 'SLA breached', color: 'var(--color-danger)', tint: 'red' },
  { title: 'Avg. Resolution', value: '14d', subText: 'across all wards', color: 'var(--color-warning)', tint: 'amber' }
];

const WARD_RESPONSIVENESS_DATA = [
  { ward: 'Ward 3', total: 38, resolved: 29, pending: 8, escalated: 1, avgDays: 7, responsiveness: 76 },
  { ward: 'Ward 12', total: 64, resolved: 48, pending: 14, escalated: 2, avgDays: 9, responsiveness: 75 },
  { ward: 'Ward 8', total: 78, resolved: 55, pending: 19, escalated: 4, avgDays: 10, responsiveness: 71 },
  { ward: 'Ward 9', total: 112, resolved: 78, pending: 28, escalated: 6, avgDays: 11, responsiveness: 70 },
  { ward: 'Ward 7', total: 91, resolved: 61, pending: 22, escalated: 8, avgDays: 13, responsiveness: 67 },
  { ward: 'Ward 14', total: 87, resolved: 34, pending: 41, escalated: 12, avgDays: 18, responsiveness: 39 },
  { ward: 'Ward 21', total: 55, resolved: 20, pending: 30, escalated: 5, avgDays: 20, responsiveness: 36 },
  { ward: 'Ward 17', total: 43, resolved: 12, pending: 27, escalated: 4, avgDays: 24, responsiveness: 28 },
];

const MONTHLY_TREND = [
  { name: 'Jan', complaints: 40, resolved: 32 },
  { name: 'Feb', complaints: 45, resolved: 35 },
  { name: 'Mar', complaints: 55, resolved: 48 },
  { name: 'Apr', complaints: 58, resolved: 50 },
  { name: 'May', complaints: 75, resolved: 62 },
  { name: 'Jun', complaints: 90, resolved: 70 },
];

export default function WardAnalytics() {
  const [selectedWard, setSelectedWard] = useState(null);
  const [tableFilter, setTableFilter] = useState('Responsiveness');

  const activeWardData = WARD_RESPONSIVENESS_DATA.find(w => w.ward === selectedWard);

  return (
    <div className="space-y-6 text-[--color-foreground]">
      <div>
        <span className="font-mono text-xs uppercase tracking-widest text-[--color-muted-foreground]">
          Ward Analytics
        </span>
        <h2 className="font-display text-4xl font-bold tracking-wider text-[--color-foreground] mt-0.5">
          DASHBOARD
        </h2>
      </div>

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map((m, index) => (
          <MetricsCard key={index} {...m} />
        ))}
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Monthly Trend Area Graph */}
        <div className="glass lg:col-span-2 p-5 rounded-[--radius]">
          <p className="font-display text-xs font-semibold tracking-widest text-[--color-muted-foreground] uppercase mb-4">
            Monthly Complaint Trends
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-warning)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--color-warning)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#060A14', borderColor: 'var(--color-border)', borderRadius: '12px' }}
                  labelStyle={{ color: 'var(--color-secondary-foreground)', fontFamily: 'monospace' }}
                />
                <Area type="monotone" dataKey="complaints" stroke="var(--color-warning)" strokeWidth={2} fillOpacity={1} fill="url(#colorComplaints)" name="Total Filed" />
                <Area type="monotone" dataKey="resolved" stroke="var(--color-success)" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" name="Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Circular Resolution Ring Gauge */}
        <div className="glass p-5 rounded-[--radius] flex flex-col justify-between">
          <p className="font-display text-xs font-semibold tracking-widest text-[--color-muted-foreground] uppercase">
            Resolution Rate
          </p>
          <div className="relative flex items-center justify-center my-6">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle cx="80" cy="80" r="68" stroke="var(--color-muted)" strokeWidth="12" fill="transparent" />
              <circle 
                cx="80" 
                cy="80" 
                r="68" 
                stroke="var(--color-success)" 
                strokeWidth="12" 
                fill="transparent" 
                strokeDasharray={2 * Math.PI * 68}
                strokeDashoffset={2 * Math.PI * 68 * (1 - 0.59)}
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.3))' }}
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-black text-[--color-foreground] font-mono tracking-tighter">59%</span>
            </div>
          </div>
          <div className="space-y-2 font-mono text-xs text-[--color-secondary-foreground]">
            <div className="flex justify-between items-center border-b border-[--color-border] pb-1">
              <span>Submitted</span><span className="text-[--color-foreground] font-bold">568</span>
            </div>
            <div className="flex justify-between items-center border-b border-[--color-border] pb-1">
              <span>Resolved</span><span className="text-[--color-success] font-bold">337</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Escalated</span><span className="text-[--color-danger] font-bold">42</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ward Level Table Wrapper */}
      <div className="glass p-5 rounded-[--radius] overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <p className="font-display text-xs font-semibold tracking-widest text-[--color-muted-foreground] uppercase">
            Ward-Level Responsiveness
          </p>
          <div className="flex bg-[--color-muted] p-0.5 rounded-xl border border-[--color-border] self-end">
            {['Responsiveness', 'Escalated', 'Pending'].map((tab) => (
              <button
                key={tab}
                onClick={() => setTableFilter(tab)}
                className="font-mono text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                style={{
                  background: tableFilter === tab ? 'rgba(245,158,11,0.15)' : 'transparent',
                  color: tableFilter === tab ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Table Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-[--color-border] text-[10px] font-mono tracking-widest text-[--color-muted-foreground] uppercase">
                <th className="pb-3 pl-4">Ward</th>
                <th className="pb-3">Total</th>
                <th className="pb-3">Resolved</th>
                <th className="pb-3">Pending</th>
                <th className="pb-3">Escalated</th>
                <th className="pb-3">Avg. Days</th>
                <th className="pb-3 pr-4">Responsiveness</th>
              </tr>
            </thead>
            <tbody>
              {WARD_RESPONSIVENESS_DATA.map((row, idx) => (
                <ComplaintRow 
                  key={idx} 
                  {...row} 
                  onRowClick={(name) => setSelectedWard(name)} 
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ComplaintModal 
        isOpen={!!selectedWard} 
        wardName={selectedWard} 
        data={activeWardData}
        onClose={() => setSelectedWard(null)} 
      />
    </div>
  );
}