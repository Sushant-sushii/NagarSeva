import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Flame, Filter, Loader2, MapPin, Calendar, CheckSquare, MessageSquare, X } from 'lucide-react';

export default function OfficialComplaints({ user }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Geolocation reference for 10km filter
  const [officialCoords, setOfficialCoords] = useState(null);
  
  // Modal states for Resolution statement
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState('');
  const [resolutionStatement, setResolutionStatement] = useState('');
  const [submittingResolution, setSubmittingResolution] = useState(false);

  // Status Colors styling
  const statusColors = {
    Open: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
    Resolved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    Escalated: 'text-red-400 bg-red-500/10 border-red-500/30',
  };

  useEffect(() => {
    initDashboardFlow();
  }, [user]);

  const initDashboardFlow = async () => {
    try {
      setLoading(true);
      setError('');

      // 1. Resolve official's geolocation coordinates
      const coords = await getOfficialLocation();
      setOfficialCoords(coords);

      // 2. Fetch live complaints of official's department
      const deptName = user?.department || '';
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3000/api/complains?department=${encodeURIComponent(deptName)}&limit=1000`, {
        method: 'GET',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to query database grievance layers.');
      }

      setComplaints(result.complaints || []);
      setLoading(false);
    } catch (err) {
      console.error('Error initializing official dashboard:', err);
      setError(err.message || 'Error communicating with grievance telemetry backend.');
      setLoading(false);
    }
  };

  // Helper to fetch current location coords
  const getOfficialLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve([26.8467, 80.9462]); // Lucknow fallback
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve([position.coords.latitude, position.coords.longitude]);
        },
        (err) => {
          console.warn('Official location lookup blocked or failed. Falling back to Lucknow.', err);
          resolve([26.8467, 80.9462]);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  };

  // Distance calculator using Haversine Formula
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // 10km Filter and distance mapping
  const activeComplaintsWithDistance = complaints.map(c => {
    let distanceValue = null;
    if (officialCoords && c.location?.coordinates?.length === 2) {
      const cLng = c.location.coordinates[0];
      const cLat = c.location.coordinates[1];
      distanceValue = getDistance(officialCoords[0], officialCoords[1], cLat, cLng);
    }
    return { ...c, distanceValue };
  }).filter(c => {
    // Show complaint if distance is within 20km boundary (or fallback default Lucknow context)
    if (c.distanceValue === null) return true;
    return c.distanceValue <= 20;
  });

  // Action status modifier
  const handleStatusChangeTrigger = async (complaintId, newStatus) => {
    if (newStatus === 'Resolved') {
      setSelectedComplaintId(complaintId);
      setResolutionStatement('');
      setShowResolveModal(true);
    } else {
      await updateStatusOnServer(complaintId, newStatus);
    }
  };

  // Resolution statement submit handler
  const handleResolutionSubmit = async (e) => {
    e.preventDefault();
    if (!resolutionStatement.trim()) return;

    setSubmittingResolution(true);
    try {
      await updateStatusOnServer(selectedComplaintId, 'Resolved', resolutionStatement);
      setShowResolveModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingResolution(false);
    }
  };

  const updateStatusOnServer = async (id, status, statement = '') => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/complains/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          status,
          ...(status === 'Resolved' && { resolutionStatement: statement })
        })
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Status change transition failed at database layer.');
      }

      // Update local state smoothly
      setComplaints(prev => 
        prev.map(c => c._id === id ? { 
          ...c, 
          status, 
          resolvedAt: status === 'Resolved' ? new Date() : c.resolvedAt,
          resolutionStatement: status === 'Resolved' ? statement : c.resolutionStatement 
        } : c)
      );

    } catch (err) {
      alert(err.message || 'Error updating status.');
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="text-amber-500 animate-spin" size={32} />
        <span className="font-mono text-xs uppercase text-slate-500 tracking-wider">Syncing Department Grievance Docket...</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 text-white text-left animate-fadeIn relative">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-900 pb-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-slate-500 block">
            {user?.department || 'Department Specifics Hub'}
          </span>
          <h2 className="font-display text-4xl font-black tracking-wider text-white mt-0.5 uppercase">
            Ward Complaints Section
          </h2>
        </div>
        <div className="px-3.5 py-2 bg-[#0b1329]/50 border border-slate-800 rounded-xl flex items-center gap-2 self-start sm:self-auto">
          <MapPin size={14} className="text-emerald-400" />
          <span className="font-mono text-xs text-slate-300">20km Operational Range Active</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={16} />
          <p className="text-red-400 font-mono text-xs font-medium">{error}</p>
        </div>
      )}

      {activeComplaintsWithDistance.length === 0 ? (
        <div className="text-center py-20 border border-slate-900 bg-[#0b1329]/10 rounded-3xl text-slate-500 font-mono text-xs max-w-lg mx-auto">
          [ No active grievances logged in your department within 20km range ]
        </div>
      ) : (
        <div className="bg-[#0b1329]/20 border border-slate-800/80 rounded-2xl p-5 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                  <th className="pb-3 pl-2">Ticket ID</th>
                  <th className="pb-3">Citizen</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3 w-1/4">Issue Narrative</th>
                  <th className="pb-3">Local Area (Pincode)</th>
                  <th className="pb-3">Range Boundary</th>
                  <th className="pb-3">Filed Date</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 pr-2 text-right">Change Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-sm">
                {activeComplaintsWithDistance.map((c) => {
                  const citizenName = c.citizenId 
                    ? `${c.citizenId.firstName} ${c.citizenId.LastName}` 
                    : 'Anonymous';
                  
                  return (
                    <tr key={c._id} className="hover:bg-[#0b1329]/30 transition-colors">
                      <td className="py-4 pl-2 font-mono text-amber-500 font-semibold text-xs">
                        CMP-{c._id.substring(18).toUpperCase()}
                      </td>
                      <td className="py-4 font-bold text-slate-200">{citizenName}</td>
                      <td className="py-4 text-slate-300 font-semibold">{c.category}</td>
                      <td className="py-4 text-slate-400 pr-4 text-xs leading-relaxed max-w-xs">{c.description}</td>
                      <td className="py-4 text-slate-300 font-mono text-xs">
                        {c.localArea || 'Unknown Area'} ({c.wardNumber})
                      </td>
                      <td className="py-4 text-slate-300 font-mono text-xs">
                        {c.distanceValue !== undefined && c.distanceValue !== null 
                          ? `${c.distanceValue.toFixed(1)} km` 
                          : 'N/A'}
                      </td>
                      <td className="py-4 font-mono text-xs text-slate-400">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border uppercase ${statusColors[c.status || 'Open']}`}>
                          {c.status || 'Open'}
                        </span>
                      </td>
                      <td className="py-4 pr-2 text-right">
                        <select
                          value={c.status || 'Open'}
                          onChange={(e) => handleStatusChangeTrigger(c._id, e.target.value)}
                          className="bg-[#060A14] border border-slate-800 text-xs font-mono text-slate-300 rounded-lg px-2 py-1 outline-none cursor-pointer focus:border-amber-500/50"
                        >
                          {['Open', 'Resolved', 'Escalated'].map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RESOLUTION MODAL OVERLAY */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-fadeIn">
          <div className="bg-[#0b1329] border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
            <button 
              onClick={() => setShowResolveModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white p-1 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="text-left space-y-2">
              <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5"><MessageSquare size={12} className="text-emerald-400" /> Resolution Dispatcher</span>
              <h3 className="font-display text-xl font-bold uppercase text-white tracking-wide">Enter Resolution Feedback</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Provide a statement outlining how this grievance was resolved. This feedback will be displayed publically on the citizen's complaint logs.
              </p>
            </div>

            <form onSubmit={handleResolutionSubmit} className="space-y-4 text-left">
              <textarea
                value={resolutionStatement}
                onChange={(e) => setResolutionStatement(e.target.value)}
                placeholder="Write the resolution steps taken (e.g. replaced the lighting node on Nehru road, fixed sewer pipeline leaks)..."
                rows={4}
                required
                className="w-full px-4 py-3 bg-[#060A14]/60 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-emerald-500/50 resize-none"
              />

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-mono uppercase font-semibold text-slate-400 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingResolution}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-mono uppercase font-bold rounded-xl transition-all shadow-[0_0_10px_rgba(16,185,129,0.15)] flex items-center gap-1.5"
                >
                  {submittingResolution ? (
                    <>
                      <Loader2 size={12} className="animate-spin" /> Resolving...
                    </>
                  ) : (
                    <>
                      <CheckSquare size={12} /> Submit Resolution
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}