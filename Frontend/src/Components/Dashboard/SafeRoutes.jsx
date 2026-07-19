import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Loader2, ArrowRight, RefreshCw, AlertTriangle, ShieldCheck, Compass, Info, Footprints } from 'lucide-react';

export default function SafeRoutes() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [planning, setPlanning] = useState(false);
  const [error, setError] = useState('');
  
  const [startQuery, setStartQuery] = useState('');
  const [startCoords, setStartCoords] = useState(null);
  
  const [endQuery, setEndQuery] = useState('');
  const [endCoords, setEndCoords] = useState(null);

  const [pinMode, setPinMode] = useState('start'); // 'start' or 'end'
  
  // Route comparison states
  const [routesInfo, setRoutesInfo] = useState(null);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const hazardsLayerRef = useRef(null);
  const routeLinesLayerRef = useRef(null);

  // Fetch active complaints on load
  useEffect(() => {
    const initPageData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3000/api/complains?limit=1000');
        const result = await response.json();
        if (response.ok && result.success) {
          setComplaints(result.complaints || []);
        }
        
        // Resolve user location by default for startCoords
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userLat = position.coords.latitude;
              const userLng = position.coords.longitude;
              setStartCoords([userLat, userLng]);
              setStartQuery(`${userLat.toFixed(5)}, ${userLng.toFixed(5)}`);
              
              // Set fallback Lucknow coordinates for End to make it easy to start
              const destLat = userLat + 0.008;
              const destLng = userLng + 0.008;
              setEndCoords([destLat, destLng]);
              setEndQuery(`${destLat.toFixed(5)}, ${destLng.toFixed(5)}`);
            },
            () => {
              // Lucknow fallbacks
              setStartCoords([26.8467, 80.9462]);
              setStartQuery('Lucknow Area Start Point');
              setEndCoords([26.8527, 80.9542]);
              setEndQuery('Lucknow Area Destination');
            }
          );
        }
        setLoading(false);
      } catch (err) {
        console.error('Error loading complaints for routing:', err);
        setError('Failed to fetch city complaints data.');
        setLoading(false);
      }
    };

    initPageData();
  }, []);

  // Initialize Map
  useEffect(() => {
    if (loading || !mapContainerRef.current || mapRef.current) return;

    const initialCenter = startCoords || [26.8467, 80.9462];
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 14,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    mapRef.current = map;
    hazardsLayerRef.current = L.layerGroup().addTo(map);
    routeLinesLayerRef.current = L.layerGroup().addTo(map);

    // Click handler to set pins
    map.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        const addressName = data.display_name ? data.display_name.split(',')[0] + ', ' + data.display_name.split(',')[1] : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        
        if (pinMode === 'start') {
          setStartCoords([lat, lng]);
          setStartQuery(addressName);
          setPinMode('end'); // Toggle to end mode automatically
        } else {
          setEndCoords([lat, lng]);
          setEndQuery(addressName);
          setPinMode('start');
        }
      } catch (err) {
        if (pinMode === 'start') {
          setStartCoords([lat, lng]);
          setStartQuery(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        } else {
          setEndCoords([lat, lng]);
          setEndQuery(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        }
      }
    });

    // Render active complaints as faint hazard circles on the map
    renderHazardOverlays();

    setTimeout(() => {
      map.invalidateSize();
    }, 300);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [loading]);

  // Redraw Start / End Markers when coords change
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Start marker (Green Pin)
    if (startCoords) {
      if (startMarkerRef.current) {
        startMarkerRef.current.setLatLng(startCoords);
      } else {
        const startIcon = L.divIcon({
          className: 'custom-start-marker',
          html: `<div class="relative flex items-center justify-center">
                   <div class="w-4 h-4 bg-emerald-400 border-2 border-slate-900 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
                 </div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        startMarkerRef.current = L.marker(startCoords, { icon: startIcon, draggable: true })
          .addTo(map)
          .bindPopup(`<span class="font-mono text-xs text-slate-800 font-bold">Start Location</span>`);

        startMarkerRef.current.on('dragend', async (e) => {
          const { lat, lng } = e.target.getLatLng();
          setStartCoords([lat, lng]);
          setStartQuery(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        });
      }
    }

    // End marker (Red Pin)
    if (endCoords) {
      if (endMarkerRef.current) {
        endMarkerRef.current.setLatLng(endCoords);
      } else {
        const endIcon = L.divIcon({
          className: 'custom-end-marker',
          html: `<div class="relative flex items-center justify-center">
                   <div class="w-4 h-4 bg-red-400 border-2 border-slate-900 rounded-full shadow-[0_0_10px_rgba(248,113,113,0.8)]"></div>
                 </div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        endMarkerRef.current = L.marker(endCoords, { icon: endIcon, draggable: true })
          .addTo(map)
          .bindPopup(`<span class="font-mono text-xs text-slate-800 font-bold">Destination Point</span>`);

        endMarkerRef.current.on('dragend', async (e) => {
          const { lat, lng } = e.target.getLatLng();
          setEndCoords([lat, lng]);
          setEndQuery(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        });
      }
    }
  }, [startCoords, endCoords]);

  // Render Hazard Overlays
  const renderHazardOverlays = () => {
    if (!hazardsLayerRef.current) return;
    hazardsLayerRef.current.clearLayers();

    complaints.forEach((c) => {
      if (c.status !== 'Resolved' && c.location?.coordinates?.length === 2) {
        const lng = c.location.coordinates[0];
        const lat = c.location.coordinates[1];
        let color = '#3b82f6';
        let radius = 60;
        if (c.severity === 'High') {
          color = '#ef4444';
          radius = 150;
        } else if (c.severity === 'Medium') {
          color = '#f59e0b';
          radius = 100;
        }

        L.circle([lat, lng], {
          radius: radius,
          color: color,
          fillColor: color,
          fillOpacity: 0.10,
          weight: 1,
          dashArray: '2, 5'
        }).addTo(hazardsLayerRef.current);
      }
    });
  };

  // Haversine formula to compute distance in meters
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Calculate route hazard score
  const calculateRouteHazards = (geometryCoords) => {
    let crossedHazards = [];
    
    // Sample path coordinates every 5th point to keep processing fast
    const sampledCoords = geometryCoords.filter((_, idx) => idx % 5 === 0);

    complaints.forEach((c) => {
      if (c.status !== 'Resolved' && c.location?.coordinates?.length === 2) {
        const cLng = c.location.coordinates[0];
        const cLat = c.location.coordinates[1];
        const dangerRadius = c.severity === 'High' ? 150 : 100;

        // Check if any point on the route is within the danger radius of this complaint
        const intersects = sampledCoords.some(([lng, lat]) => {
          return getDistance(lat, lng, cLat, cLng) <= dangerRadius;
        });

        if (intersects) {
          crossedHazards.push(c);
        }
      }
    });

    return crossedHazards;
  };

  // Geocode address search
  const handleSearchAddress = async (type) => {
    const query = type === 'start' ? startQuery : endQuery;
    if (!query.trim()) return;

    try {
      setError('');
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const latVal = parseFloat(lat);
        const lonVal = parseFloat(lon);

        if (type === 'start') {
          setStartCoords([latVal, lonVal]);
          setStartQuery(display_name.split(',')[0] + ', ' + display_name.split(',')[1]);
          if (mapRef.current) mapRef.current.setView([latVal, lonVal], 14);
        } else {
          setEndCoords([latVal, lonVal]);
          setEndQuery(display_name.split(',')[0] + ', ' + display_name.split(',')[1]);
          if (mapRef.current) mapRef.current.setView([latVal, lonVal], 14);
        }
      } else {
        setError(`Could not locate geocodes for address: "${query}"`);
      }
    } catch (err) {
      setError('Error communicating with Nominatim address resolution pipeline.');
    }
  };

  // Helper to generate simulated straight route from A to B
  const generateDirectPath = (start, end, pointsCount = 10) => {
    const coords = [];
    for (let i = 0; i <= pointsCount; i++) {
      const t = i / pointsCount;
      const lat = start[0] + (end[0] - start[0]) * t;
      const lng = start[1] + (end[1] - start[1]) * t;
      coords.push([lng, lat]); // OSRM format [longitude, latitude]
    }
    return coords;
  };

  // Helper to generate simulated bypass route curving away
  const generateBypassPath = (start, end, pointsCount = 15) => {
    const coords = [];
    const midLat = (start[0] + end[0]) / 2;
    const midLng = (start[1] + end[1]) / 2;
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    
    // Perpendicular offset vector to bend path
    const perpLat = -dy * 0.45;
    const perpLng = dx * 0.45;

    for (let i = 0; i <= pointsCount; i++) {
      const t = i / pointsCount;
      // Quadratic Bezier interpolation
      const lat = (1 - t) * (1 - t) * start[0] + 2 * (1 - t) * t * (midLat + perpLat) + t * t * end[0];
      const lng = (1 - t) * (1 - t) * start[1] + 2 * (1 - t) * t * (midLng + perpLng) + t * t * end[1];
      coords.push([lng, lat]);
    }
    return coords;
  };

  // Call OSRM public API to generate and compare routes
  const handlePlanRoute = async () => {
    if (!startCoords || !endCoords) {
      setError('Start coordinates and destination coordinates must be set.');
      return;
    }

    try {
      setPlanning(true);
      setError('');
      routeLinesLayerRef.current.clearLayers();

      let driveCoords = [];
      let footCoords = [];
      let driveDistance = 0;
      let driveDuration = 0;
      let footDistance = 0;
      let footDuration = 0;
      let hasAlternative = false;

      try {
        // Fetch Driving profile (Standard shortest route)
        const driveUrl = `https://router.projectosrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?overview=full&geometries=geojson`;
        const driveResponse = await fetch(driveUrl);
        const driveResult = await driveResponse.json();

        if (!driveResponse.ok || !driveResult.routes || driveResult.routes.length === 0) {
          throw new Error('OSRM Driving Router failed to find a valid route segment.');
        }

        const driveRoute = driveResult.routes[0];
        driveCoords = driveRoute.geometry.coordinates; // [[lng, lat], ...]
        driveDistance = driveRoute.distance;
        driveDuration = driveRoute.duration;

        // Fetch Walking profile (Pedestrian alternative route)
        try {
          const footUrl = `https://router.projectosrm.org/route/v1/foot/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?overview=full&geometries=geojson`;
          const footResponse = await fetch(footUrl);
          const footResult = await footResponse.json();
          if (footResponse.ok && footResult.routes && footResult.routes.length > 0) {
            const footRoute = footResult.routes[0];
            footCoords = footRoute.geometry.coordinates;
            footDistance = footRoute.distance;
            footDuration = footRoute.duration;
            hasAlternative = true;
          }
        } catch (footErr) {
          console.warn('Foot router fetch failed. Skipping alternative foot path.', footErr);
        }
      } catch (fetchErr) {
        console.warn('OSRM router fetch failed. Falling back to vector path simulation.', fetchErr);
        
        // Generate simulated standard (direct) and bypass paths
        driveCoords = generateDirectPath(startCoords, endCoords);
        footCoords = generateBypassPath(startCoords, endCoords);
        
        const directDist = getDistance(startCoords[0], startCoords[1], endCoords[0], endCoords[1]);
        driveDistance = directDist;
        driveDuration = (directDist / 13.8); // driving at ~50km/h (13.8 m/s)
        
        footDistance = directDist * 1.25; // walking has curves
        footDuration = (footDistance / 1.4); // walking at ~5km/h (1.4 m/s)
        hasAlternative = true;
        
        setError('⚠️ Public OSRM routing engine offline/rate-limited. Displaying local vector safety corridor approximation.');
      }

      const driveHazards = calculateRouteHazards(driveCoords);
      const footHazards = calculateRouteHazards(footCoords);

      // Convert geometries to lat/lng for Leaflet polyline
      const driveLatLngs = driveCoords.map(([lng, lat]) => [lat, lng]);
      
      // Plot drive route line on map (Red if has hazards, Blue if safe)
      const driveLineColor = driveHazards.length > 0 ? '#ef4444' : '#3b82f6';
      const driveLine = L.polyline(driveLatLngs, {
        color: driveLineColor,
        weight: 4.5,
        opacity: 0.8,
        dashArray: driveHazards.length > 0 ? '1, 8' : 'none'
      }).addTo(routeLinesLayerRef.current);

      let footLine = null;

      // Plot foot route line on map (Green)
      if (hasAlternative && footCoords.length > 0 && (JSON.stringify(driveCoords) !== JSON.stringify(footCoords))) {
        const footLatLngs = footCoords.map(([lng, lat]) => [lat, lng]);
        footLine = L.polyline(footLatLngs, {
          color: '#10b981',
          weight: 4.5,
          opacity: 0.95
        }).addTo(routeLinesLayerRef.current);
      } else {
        hasAlternative = false;
      }

      // Zoom map to fit both route lines
      const routeBounds = L.featureGroup([
        driveLine,
        ...(footLine ? [footLine] : [])
      ]).getBounds();
      
      if (mapRef.current) {
        mapRef.current.fitBounds(routeBounds, { padding: [50, 50] });
      }

      // Save comparison summaries
      setRoutesInfo({
        hasAlternative,
        drive: {
          distance: (driveDistance / 1000).toFixed(2), // km
          duration: Math.ceil(driveDuration / 60), // mins
          hazards: driveHazards,
          isRecommended: !hasAlternative || driveHazards.length <= footHazards.length
        },
        foot: hasAlternative ? {
          distance: (footDistance / 1000).toFixed(2),
          duration: Math.ceil(footDuration / 60),
          hazards: footHazards,
          isRecommended: footHazards.length < driveHazards.length
        } : null
      });

    } catch (err) {
      console.error('Routing pipeline exception:', err);
      setError(err.message || 'Unable to compute path layout.');
    } finally {
      setPlanning(false);
    }
  };

  // Recenter map helper
  const handleRecenter = () => {
    if (mapRef.current && startCoords) {
      mapRef.current.setView(startCoords, 15, { animate: true });
    }
  };

  return (
    <div className="w-full space-y-6 text-white text-left animate-fadeIn">
      {/* Header Block */}
      <div>
        <span className="font-mono text-xs uppercase tracking-widest text-slate-500 block">Vulnerable Commuter Guidelines</span>
        <h2 className="font-display text-4xl font-black tracking-wider text-white mt-0.5 uppercase">Safe Routes</h2>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl flex items-start gap-3">
          <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={16} />
          <p className="text-red-400 font-mono text-xs font-medium">{error}</p>
        </div>
      )}

      {/* Main Grid Frame */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Input & Info Panel (4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
          <div className="bg-[#0b1329]/30 border border-slate-800/80 rounded-3xl p-6 space-y-6">
            
            {/* Input Inputs */}
            <div className="space-y-4">
              <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500 block border-b border-slate-900 pb-2">Route Details</span>
              
              {/* Start Point Address */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Start Location
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={startQuery} 
                    onChange={(e) => setStartQuery(e.target.value)}
                    placeholder="Enter start address..."
                    className="w-full px-3 py-2 bg-[#060A14]/60 border border-slate-800 rounded-lg text-xs outline-none focus:border-amber-500/50"
                  />
                  <button 
                    onClick={() => handleSearchAddress('start')}
                    className="px-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 text-xs font-mono transition-colors"
                  >
                    Locate
                  </button>
                </div>
              </div>

              {/* End Point Address */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> Destination Point
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={endQuery} 
                    onChange={(e) => setEndQuery(e.target.value)}
                    placeholder="Enter target address..."
                    className="w-full px-3 py-2 bg-[#060A14]/60 border border-slate-800 rounded-lg text-xs outline-none focus:border-amber-500/50"
                  />
                  <button 
                    onClick={() => handleSearchAddress('end')}
                    className="px-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 text-xs font-mono transition-colors"
                  >
                    Locate
                  </button>
                </div>
              </div>
            </div>

            {/* Map click mode selector */}
            <div className="space-y-2">
              <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500 block">Map Click Assign Tool</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPinMode('start')}
                  className={`flex-1 py-2 font-mono text-[10px] uppercase rounded-xl border transition-all ${
                    pinMode === 'start' 
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold' 
                      : 'bg-[#060A14]/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Set Start Pin
                </button>
                <button
                  type="button"
                  onClick={() => setPinMode('end')}
                  className={`flex-1 py-2 font-mono text-[10px] uppercase rounded-xl border transition-all ${
                    pinMode === 'end' 
                      ? 'bg-red-500/10 border-red-500 text-red-400 font-bold' 
                      : 'bg-[#060A14]/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Set End Pin
                </button>
              </div>
            </div>

            {/* Calculate Button */}
            <button
              onClick={handlePlanRoute}
              disabled={planning}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-mono text-xs uppercase font-bold rounded-xl transition-all shadow-[0_0_10px_rgba(245,158,11,0.15)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {planning ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Analyzing Safe Corridors...
                </>
              ) : (
                <>
                  <Compass size={14} /> Calculate Safe Route
                </>
              )}
            </button>
          </div>

          {/* Quick Legend Info */}
          <div className="bg-[#0b1329]/10 border border-slate-800/50 border-dashed rounded-3xl p-6 text-slate-500 space-y-4">
            <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Info size={12} className="text-amber-500" />
              Route Safety legend
            </span>
            <div className="text-xs space-y-2 text-slate-400 font-sans">
              <div className="flex items-center gap-2">
                <div className="w-6 h-1 bg-emerald-500 rounded-full"></div>
                <span>Recommended Safe Pathway (0 active hazards)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-1 border-t border-dashed border-red-500"></div>
                <span>Unsafe Shortest Path (Crosses active hazards)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full border border-dashed border-red-500/40 bg-red-500/5"></div>
                <span>Active Database Grievance warning bounds</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Map Canvas + Metrics (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          {/* Map canvas */}
          <div className="relative h-[48vh] rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl">
            <div ref={mapContainerRef} className="w-full h-full z-0" style={{ height: '100%', width: '100%', minHeight: '100%' }}></div>
            
            {/* Recenter Button */}
            <button 
              onClick={handleRecenter}
              className="absolute top-4 right-4 z-[400] p-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-amber-500 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl backdrop-blur-md"
              title="Recenter Start location"
            >
              <RefreshCw size={16} />
            </button>

            {/* Hint label */}
            <div className="absolute bottom-4 left-4 z-[400] px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-lg text-[9px] font-mono text-slate-400 backdrop-blur-md">
              Tip: Click anywhere on the map to drop coordinates
            </div>
          </div>

          {/* Comparative Cards */}
          {routesInfo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
              
              {/* Route A Card: Drive Route */}
              <div className={`p-5 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                routesInfo.drive.isRecommended 
                  ? 'bg-emerald-500/5 border-emerald-500/30' 
                  : 'bg-[#0b1329]/20 border-slate-800'
              }`}>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500">Route Option A: Standard Path</span>
                    {routesInfo.drive.isRecommended && (
                      <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase flex items-center gap-1"><ShieldCheck size={10} /> RECOMMENDED</span>
                    )}
                  </div>
                  <h4 className="font-display text-xl font-bold tracking-wide text-white uppercase flex items-center gap-2">
                    <Compass className="text-slate-400" size={16} /> Driving Corridor
                  </h4>
                  <div className="flex gap-4 text-xs font-mono text-slate-400">
                    <span>Distance: {routesInfo.drive.distance} km</span>
                    <span>Duration: {routesInfo.drive.duration} min</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-500">HAZARDS ENCOUNTERED:</span>
                  <span className={`font-bold ${routesInfo.drive.hazards.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {routesInfo.drive.hazards.length} Zones
                  </span>
                </div>
              </div>

              {/* Route B Card: Foot Route */}
              {routesInfo.foot && (
                <div className={`p-5 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                  routesInfo.foot.isRecommended 
                    ? 'bg-emerald-500/5 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
                    : 'bg-[#0b1329]/20 border-slate-800'
                }`}>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500">Route Option B: Safe Bypass Corridor</span>
                      {routesInfo.foot.isRecommended && (
                        <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase flex items-center gap-1"><ShieldCheck size={10} /> RECOMMENDED</span>
                      )}
                    </div>
                    <h4 className="font-display text-xl font-bold tracking-wide text-white uppercase flex items-center gap-2">
                      <Footprints className="text-slate-400" size={16} /> Pedestrian Bypass
                    </h4>
                    <div className="flex gap-4 text-xs font-mono text-slate-400">
                      <span>Distance: {routesInfo.foot.distance} km</span>
                      <span>Duration: {routesInfo.foot.duration} min</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-500">HAZARDS ENCOUNTERED:</span>
                    <span className={`font-bold ${routesInfo.foot.hazards.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {routesInfo.foot.hazards.length} Zones
                    </span>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
