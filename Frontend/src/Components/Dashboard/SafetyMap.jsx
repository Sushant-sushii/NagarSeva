import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ShieldAlert, AlertTriangle, CheckCircle, MapPin, Loader2, RefreshCw, Info } from 'lucide-react';

export default function SafetyMap() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userCoords, setUserCoords] = useState(null);
  const [activeSeverityFilter, setActiveSeverityFilter] = useState('All');
  
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);
  const circlesLayerRef = useRef(null);
  const userMarkerRef = useRef(null);

  // Stats
  const [safetyMetrics, setSafetyMetrics] = useState({
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
    safetyScore: 100,
    statusText: 'Safe Zone'
  });

  // Fetch all complaints
  const fetchAllComplaints = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/complains?limit=1000');
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch complaints.');
      }
      return result.complaints || [];
    } catch (err) {
      console.error('Error fetching complaints for map:', err);
      throw err;
    }
  };

  // Get user geolocation
  const getUserLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve([26.8467, 80.9462]); // Fallback Lucknow
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.warn('Geolocation denied/failed. Using Lucknow fallback.', error);
          resolve([26.8467, 80.9462]);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  };

  // 1. Fetch complaints and user location on mount
  useEffect(() => {
    const loadMapData = async () => {
      try {
        setLoading(true);
        setError('');
        const [resolvedComplaints, coords] = await Promise.all([
          fetchAllComplaints(),
          getUserLocation()
        ]);
        setComplaints(resolvedComplaints);
        setUserCoords(coords);
      } catch (err) {
        setError(err.message || 'Failed to initialize safety map database layers.');
      } finally {
        setLoading(false);
      }
    };
    loadMapData();
  }, []);

  // 2. Initialize Leaflet Map once container is mounted and loading is complete
  useEffect(() => {
    if (loading || !mapContainerRef.current || mapRef.current) return;

    const centerCoords = userCoords || [26.8467, 80.9462];
    const map = L.map(mapContainerRef.current, {
      center: centerCoords,
      zoom: 14,
      zoomControl: false
    });

    // Add Zoom controls at the bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Add tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    mapRef.current = map;
    
    // Layer groups
    markersLayerRef.current = L.layerGroup().addTo(map);
    circlesLayerRef.current = L.layerGroup().addTo(map);

    // Force Leaflet container size recalculation after render pipeline finishes
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 300);

    return () => {
      // Clean up map instance on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [loading]);

  // Update markers, danger circles, and user marker when complaints or filters change
  useEffect(() => {
    if (!mapRef.current || loading) return;

    const map = mapRef.current;
    
    // Clear old layers
    markersLayerRef.current.clearLayers();
    circlesLayerRef.current.clearLayers();
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    // Custom marker icon helpers
    const getCustomIcon = (severity, isUser = false) => {
      if (isUser) {
        return L.divIcon({
          className: 'custom-user-marker',
          html: `<div class="relative flex items-center justify-center">
                   <div class="absolute w-8 h-8 bg-cyan-500/20 rounded-full animate-ping"></div>
                   <div class="w-4 h-4 bg-cyan-400 border-2 border-slate-900 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.8)]"></div>
                 </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
      }

      let color = '#3b82f6'; // Low (Blue)
      if (severity === 'High') color = '#ef4444'; // Red
      else if (severity === 'Medium') color = '#f59e0b'; // Amber

      return L.divIcon({
        className: 'custom-complaint-marker',
        html: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="${color}" stroke="white" stroke-width="1.5" filter="drop-shadow(0px 0px 4px ${color})"/>
               </svg>`,
        iconSize: [26, 26],
        iconAnchor: [13, 26],
        popupAnchor: [0, -26]
      });
    };

    // 1. Add User marker
    if (userCoords) {
      userMarkerRef.current = L.marker(userCoords, { icon: getCustomIcon(null, true) })
        .addTo(map)
        .bindPopup(`<div class="font-mono text-xs font-bold text-slate-800">You are here</div>`);
    }

    // 2. Filter complaints
    const filtered = activeSeverityFilter === 'All'
      ? complaints
      : complaints.filter(c => c.severity === activeSeverityFilter);

    let high = 0;
    let medium = 0;
    let low = 0;

    // 3. Plot complaints and danger circles
    filtered.forEach((c) => {
      if (c.severity === 'High') high++;
      else if (c.severity === 'Medium') medium++;
      else low++;

      // Check coordinates format [lng, lat] standard
      if (c.location?.coordinates && c.location.coordinates.length === 2) {
        const lng = c.location.coordinates[0];
        const lat = c.location.coordinates[1];
        
        // SLA info
        const daysOpen = Math.floor((new Date() - new Date(c.createdAt)) / (1000 * 60 * 60 * 24)) || 0;

        // Custom Popup HTML
        const popupContent = `
          <div class="text-left font-sans text-slate-800 max-w-xs space-y-2 p-1">
            <div class="flex justify-between items-center border-b border-slate-200 pb-1.5">
              <span class="font-mono text-[9px] font-bold text-slate-400">CMP-${c._id.substring(18).toUpperCase()}</span>
              <span class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                c.status === 'Resolved' ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'
              }">${c.status || 'Open'}</span>
            </div>
            ${c.imageUrl ? `<div class="w-full h-24 overflow-hidden rounded-lg mt-1"><img src="${c.imageUrl}" class="w-full h-full object-cover"/></div>` : ''}
            <h4 class="font-bold text-sm text-slate-900 leading-snug mt-1">${c.category}</h4>
            <p class="text-xs text-slate-500 line-clamp-2">${c.description || 'No description logged.'}</p>
            <div class="flex justify-between items-center text-[10px] font-mono pt-1 text-slate-400 border-t border-slate-100">
              <span>Pincode: ${c.wardNumber || 'N/A'}</span>
              <span class="font-bold text-red-500">${c.severity} Severity</span>
            </div>
          </div>
        `;

        // Plot Marker
        L.marker([lat, lng], { icon: getCustomIcon(c.severity) })
          .addTo(markersLayerRef.current)
          .bindPopup(popupContent);

        // Plot Danger circles
        if (c.status !== 'Resolved') {
          let circleColor = '#3b82f6';
          let radius = 70;
          if (c.severity === 'High') {
            circleColor = '#ef4444';
            radius = 150;
          } else if (c.severity === 'Medium') {
            circleColor = '#f59e0b';
            radius = 100;
          }

          L.circle([lat, lng], {
            radius: radius,
            color: circleColor,
            fillColor: circleColor,
            fillOpacity: 0.15,
            stroke: true,
            weight: 1.5,
            dashArray: '4, 4'
          }).addTo(circlesLayerRef.current);
        }
      }
    });

    // 4. Calculate Safety Metrics
    const totalDangerZones = high * 2 + medium * 1;
    let score = Math.max(0, 100 - totalDangerZones * 5);
    let statusText = 'Safe Zone';
    if (score < 50) statusText = 'Danger Zone: Proceed with Caution';
    else if (score < 80) statusText = 'Cautionary Zone: Moderate Risk';

    setSafetyMetrics({
      highCount: high,
      mediumCount: medium,
      lowCount: low,
      safetyScore: score,
      statusText: statusText
    });

  }, [complaints, activeSeverityFilter, userCoords, loading]);

  // Recenter map on user location
  const handleRecenter = () => {
    if (mapRef.current && userCoords) {
      mapRef.current.setView(userCoords, 15, { animate: true });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="text-amber-500 animate-spin" size={32} />
        <span className="font-mono text-xs uppercase text-slate-500 tracking-wider">Loading Safety Map Layers...</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 text-white text-left animate-fadeIn">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-slate-500 block">Civic Hazard Index</span>
          <h2 className="font-display text-4xl font-black tracking-wider text-white mt-0.5 uppercase">Safety Map</h2>
        </div>

        {/* Severity Filters */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {['All', 'High', 'Medium', 'Low'].map((sev) => (
            <button
              key={sev}
              onClick={() => setActiveSeverityFilter(sev)}
              className={`px-3 py-1.5 text-xs font-mono uppercase rounded-lg border transition-all ${
                activeSeverityFilter === sev
                  ? 'bg-amber-500 border-amber-600 text-black font-bold shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                  : 'bg-[#060A14] border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl flex items-start gap-3">
          <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={16} />
          <p className="text-red-400 font-mono text-xs font-medium">{error}</p>
        </div>
      )}

      {/* Main Map Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column Map Frame (8 cols) */}
        <div className="lg:col-span-8 relative h-[65vh] rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl">
          {/* Map Target */}
          <div ref={mapContainerRef} className="w-full h-full z-0" style={{ height: '100%', width: '100%', minHeight: '100%' }}></div>

          {/* Floating controls */}
          <button 
            onClick={handleRecenter}
            className="absolute top-4 right-4 z-[400] p-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-amber-500 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl backdrop-blur-md"
            title="Recenter Map"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Right Column Metrics Panel (4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
          {/* Safety Meter Card */}
          <div className="bg-[#0b1329]/30 border border-slate-800/80 rounded-3xl p-6 flex-1 flex flex-col justify-between">
            <div>
              <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500 block mb-2">Safety Health Index</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-5xl font-display font-black tracking-wider ${
                  safetyMetrics.safetyScore >= 80 ? 'text-emerald-400' : safetyMetrics.safetyScore >= 50 ? 'text-amber-500' : 'text-red-500'
                }`}>
                  {safetyMetrics.safetyScore}%
                </span>
                <span className="text-xs text-slate-500 font-mono">Index Score</span>
              </div>

              {/* Status block */}
              <div className={`mt-4 p-3.5 border rounded-2xl flex items-center gap-3 ${
                safetyMetrics.safetyScore >= 80 
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                  : safetyMetrics.safetyScore >= 50 
                    ? 'bg-amber-500/5 border-amber-500/20 text-amber-500' 
                    : 'bg-red-500/5 border-red-500/20 text-red-500'
              }`}>
                {safetyMetrics.safetyScore >= 80 ? (
                  <CheckCircle size={18} />
                ) : (
                  <AlertTriangle size={18} />
                )}
                <span className="font-mono text-xs uppercase font-semibold leading-snug">{safetyMetrics.statusText}</span>
              </div>
            </div>

            {/* Severity Counts Grid */}
            <div className="grid grid-cols-3 gap-3 mt-6 border-t border-slate-900 pt-6">
              <div className="bg-[#060A14]/40 border border-slate-800/60 p-3 rounded-2xl text-center">
                <span className="font-mono text-[9px] text-red-400 block mb-1">HIGH RISK</span>
                <span className="text-xl font-bold font-display text-white">{safetyMetrics.highCount}</span>
              </div>
              <div className="bg-[#060A14]/40 border border-slate-800/60 p-3 rounded-2xl text-center">
                <span className="font-mono text-[9px] text-amber-400 block mb-1">MID RISK</span>
                <span className="text-xl font-bold font-display text-white">{safetyMetrics.mediumCount}</span>
              </div>
              <div className="bg-[#060A14]/40 border border-slate-800/60 p-3 rounded-2xl text-center">
                <span className="font-mono text-[9px] text-blue-400 block mb-1">LOW RISK</span>
                <span className="text-xl font-bold font-display text-white">{safetyMetrics.lowCount}</span>
              </div>
            </div>
          </div>

          {/* Quick Legend Info */}
          <div className="bg-[#0b1329]/10 border border-slate-800/50 border-dashed rounded-3xl p-6 text-slate-500 space-y-4">
            <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Info size={12} className="text-amber-500" />
              Safety Map Guide
            </span>
            <p className="text-xs leading-relaxed text-slate-400">
              The Safety Map aggregates active, unresolved complaints on the map. High severity warnings (Red circles) have a larger hazard radius (150m), while moderate reports (Orange) cover a smaller boundary (100m). Safe pathways are highlighted when avoiding red circles.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
