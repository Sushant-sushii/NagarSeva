import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, CheckCircle, Clock, MapPin, ShieldAlert, FileText, ArrowRight, Loader2, Calendar, AlertTriangle } from 'lucide-react';

export default function Track({ setActiveTab }) {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchComplaints();
  }, [user]);

  const fetchComplaints = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const userId = user.id || user._id;
      
      const response = await fetch(`http://localhost:3000/api/complains/user/${userId}`, {
        method: 'GET',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to retrieve your grievance records.');
      }
      
      const data = result.complaints || [];
      setComplaints(data);
      if (data.length > 0) {
        setSelectedComplaint(data[0]); // Select first one by default
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError(err.message || 'Failed to establish network pipeline connection.');
    } finally {
      setLoading(false);
    }
  };

  const getSlaLimit = (severity) => {
    switch (severity) {
      case 'High': return 7;
      case 'Medium': return 14;
      case 'Low': return 30;
      default: return 14;
    }
  };

  const calculateDaysOpen = (dateStr) => {
    const filedDate = new Date(dateStr);
    const today = new Date();
    const diffTime = Math.abs(today - filedDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const statusColors = {
    Open: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    Resolved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    Escalated: 'text-red-400 bg-red-500/10 border-red-500/20',
  };

  const severityColors = {
    High: 'text-red-400 bg-red-500/10 border-red-500/20',
    Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    Low: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  };

  // Filter complaints based on selection
  const filteredComplaints = statusFilter === 'All' 
    ? complaints 
    : complaints.filter(c => c.status?.toLowerCase() === statusFilter.toLowerCase());

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="text-amber-500 animate-spin" size={32} />
        <span className="font-mono text-xs uppercase text-slate-500 tracking-wider">Syncing Grievance Telemetry Database...</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 text-white animate-fadeIn text-left">
      {/* Header Block */}
      <div className="text-left">
        <span className="font-mono text-xs uppercase tracking-widest text-slate-500 block">My Complaints</span>
        <h2 className="font-display text-4xl font-black tracking-wider text-white mt-0.5 uppercase">Track</h2>
      </div>

      {/* Filter Options */}
      <div className="flex flex-wrap gap-2 pt-2 border-b border-slate-900 pb-4">
        {['All', 'Open', 'Escalated', 'Resolved'].map((filter) => (
          <button
            key={filter}
            onClick={() => {
              setStatusFilter(filter);
              // Auto-select first item of filtered list if available
              const list = filter === 'All' ? complaints : complaints.filter(c => c.status?.toLowerCase() === filter.toLowerCase());
              setSelectedComplaint(list[0] || null);
            }}
            className={`px-3 py-1 text-xs uppercase font-mono rounded-lg border transition-all ${
              statusFilter === filter 
                ? 'bg-amber-500 border-amber-600 text-black font-semibold shadow-[0_0_10px_rgba(245,158,11,0.25)]' 
                : 'bg-[#060A14] border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl flex items-start gap-3">
          <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={16} />
          <p className="text-red-400 font-mono text-xs font-medium">{error}</p>
        </div>
      )}

      {complaints.length === 0 ? (
        <div className="bg-[#0b1329]/20 border border-slate-800/80 rounded-2xl p-10 text-center space-y-4 max-w-lg mx-auto">
          <AlertCircle className="text-slate-500 mx-auto" size={48} />
          <h3 className="font-display text-lg font-bold uppercase text-white tracking-wider">No Grievances Logged</h3>
          <p className="text-sm text-slate-400">You haven't dispatched any telemetry grievance packets yet.</p>
          <button
            onClick={() => setActiveTab('report')}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-mono text-xs uppercase font-bold rounded-xl transition-colors inline-flex items-center gap-2"
          >
            File New Complaint <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT LIST COLUMN (5 cols) */}
          <div className="lg:col-span-5 space-y-4 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
            {filteredComplaints.length === 0 ? (
              <div className="text-center py-10 font-mono text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                No items match status filter.
              </div>
            ) : (
              filteredComplaints.map((c) => {
                const daysOpen = calculateDaysOpen(c.createdAt);
                const slaLimit = getSlaLimit(c.severity);
                const progressPct = Math.min(100, (daysOpen / slaLimit) * 100);
                
                return (
                  <div
                    key={c._id}
                    onClick={() => setSelectedComplaint(c)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden group ${
                      selectedComplaint?._id === c._id
                        ? 'bg-[#0b1329]/60 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.05)]'
                        : 'bg-[#0b1329]/20 border-slate-800/80 hover:border-slate-700/80'
                    }`}
                  >
                    {/* Glow backdrop on active */}
                    {selectedComplaint?._id === c._id && (
                      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
                    )}
                    
                    {/* Top Meta info */}
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-mono text-[10px] tracking-wider text-slate-500 font-bold uppercase">
                        CMP-{c._id.substring(18).toUpperCase()}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase ${statusColors[c.status || 'Open']}`}>
                        {c.status || 'Open'}
                      </span>
                    </div>

                    {/* Complaint Category */}
                    <h4 className="font-body text-base font-semibold text-slate-100 group-hover:text-amber-400 transition-colors line-clamp-1 mb-2">
                      {c.category}
                    </h4>

                    {/* Meta labels */}
                    <div className="flex gap-4 font-mono text-[10px] text-slate-500 mb-4">
                      <span className="flex items-center gap-1"><MapPin size={10} /> Pincode: {c.wardNumber}</span>
                      <span className="flex items-center gap-1"><Clock size={10} /> {daysOpen}d open</span>
                    </div>

                    {/* SLA Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            c.status === 'Resolved' 
                              ? 'bg-emerald-500' 
                              : progressPct >= 80 
                                ? 'bg-red-500' 
                                : 'bg-amber-500'
                          }`}
                          style={{ width: `${c.status === 'Resolved' ? 100 : progressPct}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[9px] font-mono text-slate-655">
                        <span>SLA LIMIT</span>
                        <span className="font-bold text-slate-500">{c.status === 'Resolved' ? 'RESOLVED' : `${daysOpen}/${slaLimit}d`}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* RIGHT DETAILED COLUMN (7 cols) */}
          <div className="lg:col-span-7">
            {selectedComplaint ? (
              <div className="bg-[#0b1329]/30 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl animate-fadeIn">
                {/* Large Banner Image */}
                <div className="w-full h-64 bg-slate-950 border-b border-slate-800 relative overflow-hidden flex items-center justify-center">
                  <img 
                    src={selectedComplaint.imageUrl || "https://images.unsplash.com/photo-1594913785162-e6785b49eed9?auto=format&fit=crop&w=600&q=80"} 
                    alt="Complaint Evidence" 
                    className="w-full h-full object-cover opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                  
                  {/* Floating badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border uppercase backdrop-blur-md ${statusColors[selectedComplaint.status || 'Open']}`}>
                      {selectedComplaint.status || 'Open'}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border uppercase backdrop-blur-md ${severityColors[selectedComplaint.severity || 'Medium']}`}>
                      {selectedComplaint.severity || 'Medium'} Severity
                    </span>
                  </div>
                </div>

                {/* Content Block */}
                <div className="p-6 md:p-8 space-y-6 text-left">
                  {/* Title & Ticket ID */}
                  <div>
                    <span className="font-mono text-xs text-slate-500 uppercase tracking-wider block">CMP-{selectedComplaint._id.toUpperCase()}</span>
                    <h3 className="text-2xl font-bold font-display text-white tracking-wide mt-1">{selectedComplaint.category}</h3>
                  </div>

                  {/* Grievance Narrative */}
                  <div className="space-y-2">
                    <span className="font-mono text-[10px] uppercase text-slate-500 tracking-wider block flex items-center gap-1.5"><FileText size={12} className="text-amber-500" /> Narrative description</span>
                    <p className="text-slate-300 text-sm leading-relaxed bg-[#060A14]/30 border border-slate-800/40 rounded-xl p-4 font-body">
                      {selectedComplaint.description || "No narrative payload provided for this docket record."}
                    </p>
                  </div>

                  {/* Grid details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#060A14]/40 border border-slate-800/50 p-4 rounded-2xl">
                      <span className="font-mono text-[9px] uppercase text-slate-500 block mb-1">Administrative Bureau / Dept</span>
                      <span className="text-sm font-semibold text-slate-200">{selectedComplaint.department}</span>
                    </div>

                    <div className="bg-[#060A14]/40 border border-slate-800/50 p-4 rounded-2xl">
                      <span className="font-mono text-[9px] uppercase text-slate-500 block mb-1">Incident Pincode</span>
                      <span className="text-sm font-semibold text-slate-200">{selectedComplaint.wardNumber}</span>
                    </div>

                    <div className="bg-[#060A14]/40 border border-slate-800/50 p-4 rounded-2xl">
                      <span className="font-mono text-[9px] uppercase text-slate-500 block mb-1">Local Area (Resolved)</span>
                      <span className="text-sm font-semibold text-slate-200">{selectedComplaint.localArea || "Lucknow Area"}</span>
                    </div>

                    <div className="bg-[#060A14]/40 border border-slate-800/50 p-4 rounded-2xl">
                      <span className="font-mono text-[9px] uppercase text-slate-500 block mb-1">Incident Geolocation Context</span>
                      <span className="text-xs font-mono text-slate-200 block truncate" title={`${selectedComplaint.location?.coordinates?.[1] || 0}, ${selectedComplaint.location?.coordinates?.[0] || 0}`}>
                        Latitude: {selectedComplaint.location?.coordinates?.[1]?.toFixed(5) || "N/A"}<br />
                        Longitude: {selectedComplaint.location?.coordinates?.[0]?.toFixed(5) || "N/A"}
                      </span>
                    </div>

                    <div className="bg-[#060A14]/40 border border-slate-800/50 p-4 rounded-2xl">
                      <span className="font-mono text-[9px] uppercase text-slate-500 block mb-1">Submission Timeline</span>
                      <span className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                        <Calendar size={13} className="text-amber-500" />
                        {new Date(selectedComplaint.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Extra Flags */}
                  <div className="flex flex-wrap gap-4 pt-2">
                    <div className="flex items-center gap-2 bg-[#060A14]/20 border border-slate-800 px-3.5 py-2 rounded-xl">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                      <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                        Night Safety Risk: {selectedComplaint.isSafetyHazardAtNight ? "High Hazard" : "Nominal"}
                      </span>
                    </div>
                     {selectedComplaint.status === 'Resolved' && selectedComplaint.resolvedAt && (
                      <div className="flex flex-col gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-3 rounded-xl text-emerald-400 w-full">
                        <div className="flex items-center gap-2">
                          <CheckCircle size={14} />
                          <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">
                            Resolved On: {new Date(selectedComplaint.resolvedAt).toLocaleDateString()}
                          </span>
                        </div>
                        {selectedComplaint.resolutionStatement && (
                          <div className="mt-1 border-t border-emerald-500/10 pt-2 text-slate-300 text-xs font-sans leading-relaxed">
                            <span className="font-bold text-emerald-400 block mb-0.5 font-mono text-[9px] uppercase">Official Resolution Feedback:</span>
                            {selectedComplaint.resolutionStatement}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            ) : (
              <div className="bg-[#0b1329]/10 border border-slate-800/80 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[40vh] text-slate-500 gap-2">
                <FileText size={40} className="stroke-[1.5]" />
                <span className="font-display font-medium text-slate-300">Select a grievance ticket</span>
                <span className="text-xs font-mono">Choose a logged record from the left column to query data.</span>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
