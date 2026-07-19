import React, { useState, useRef, useEffect } from 'react';
import { ShieldAlert, FileText, UploadCloud, CheckCircle, AlertTriangle, ArrowLeft, X, Loader2, Cpu, Camera, MapPin, Navigation, AlertCircle } from 'lucide-react';
import { getWardByLocation } from '../../utils/location';

const GEMINI_API_KEY = import.meta.env.VITE_VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY; 

export default function ReportIssue({ setActiveTab }) {
  const [currentStep, setCurrentStep] = useState(1);
  
  // 📋 All Fields Required By Backend Controller Schema
  const [category, setCategory] = useState('');
  const [department, setDepartment] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [wardNumber, setWardNumber] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSafetyHazardAtNight, setIsSafetyHazardAtNight] = useState(false);
  const [description, setDescription] = useState('');
  const [localArea, setLocalArea] = useState('');
  
  // Geolocation Specific Sub-states
  const [coordinates, setCoordinates] = useState({ latitude: null, longitude: null });

  useEffect(() => {
    const autoDetectGrievanceLocation = async () => {
      setIsDetectingLocation(true);
      
      if (!navigator.geolocation) {
        console.warn('Geolocation not supported by browser. Falling back to Lucknow.');
        setCoordinates({ latitude: 26.8467, longitude: 80.9462 });
        setLocalArea('Lucknow Area');
        setWardNumber('226012');
        setIsDetectingLocation(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ latitude, longitude });
          
          try {
            // Get local area name using location.js utility
            const resolvedArea = await getWardByLocation();
            setLocalArea(resolvedArea);
            
            // Resolve postcode (pincode) via reverse geocode API
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            if (data && data.address?.postcode) {
              setWardNumber(data.address.postcode);
            } else {
              setWardNumber('226012');
            }
          } catch (err) {
            console.error('Error resolving location names:', err);
            setLocalArea('Lucknow Area');
            setWardNumber('226012');
          } finally {
            setIsDetectingLocation(false);
          }
        },
        (error) => {
          console.warn('Geolocation access denied/failed. Falling back to Lucknow.');
          setCoordinates({ latitude: 26.8467, longitude: 80.9462 });
          setLocalArea('Lucknow Area');
          setWardNumber('226012');
          setIsDetectingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    };

    autoDetectGrievanceLocation();
  }, []);

  // UI Flow States
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false); 
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [aiTelemetry, setAiTelemetry] = useState(null); 
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const departmentsList = [
    'Public Works Department (PWD) / Infrastructure',
    'Electricity & Public Lighting Board',
    'Sanitation & Waste Management',
    'Enforcement & Anti-Encroachment Cell',
    'Local Law Enforcement / Police Department'
  ];

  const severityOptions = ['Low', 'Medium', 'High'];

  // 🧠 Gemini Vision Intelligence Layer
  const analyzeAndOrchestrateGrievance = async (file) => {
    if (!GEMINI_API_KEY) {
      throw new Error("VITE_GEMINI_API_KEY env block missing.");
    }

    const base64Data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const prompt = `
You are an advanced municipal intelligence agent processing civic grievances.
Analyze the uploaded image carefully and extract parameters matching this system schema:

1. department: Must be EXACTLY ONE of these target values:
- Public Works Department (PWD) / Infrastructure
- Electricity & Public Lighting Board
- Sanitation & Waste Management
- Enforcement & Anti-Encroachment Cell
- Local Law Enforcement / Police Department

2. category: A short descriptive tag of the specific grievance (e.g., Pothole, Broken Streetlight, Open Garbage Dump, Illegal Encroachment, Water Logging).
3. description: A concise description of the complaint (e.g., "A deep pothole in the middle of a two-lane road, filled with muddy rainwater and posing a risk to vehicles.").
4. severity: Estimate the infrastructure risk layer ('Low', 'Medium', 'High').
5. isSafetyHazardAtNight: Evaluate if this specific structural failure increases community risk after sunset (true or false).

Return ONLY a valid JSON object matching this exact schema:
{
  "valid": true,
  "department": "EXACT DEPARTMENT NAME FROM THE LIST",
  "category": "Specific category text",
  "description": "Concise description of the complaint based on image details",
  "severity": "Medium",
  "isSafetyHazardAtNight": false,
  "confidence": 0.98
}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }, { inlineData: { mimeType: file.type, data: base64Data } }]
          }]
        })
      }
    );

    const result = await response.json();
    if (!response.ok) throw new Error(result.error?.message || "Gemini processing pipeline crashed.");

    let text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Empty neural telemetry stream response.");
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error("Malformed JSON sequence dropped by AI node.");
    }
  };

  const processImageFile = async (file) => {
    setErrorMessage('');
    setIsAnalyzingImage(true);
    setShowUploadOptions(false);

    if (file.size > 4 * 1024 * 1024) {
      setErrorMessage('Payload Overflow: Maximum acceptable payload buffer limit is 4 MB.');
      setIsAnalyzingImage(false);
      return;
    }

    try {
      const aiResponse = await analyzeAndOrchestrateGrievance(file);
      
      if (!aiResponse.valid || !departmentsList.includes(aiResponse.department)) {
        setErrorMessage("AI Policy Exception: Image failed civic risk classification routines.");
        return;
      }
      
      setSelectedImage({
        file,
        previewUrl: URL.createObjectURL(file),
        name: file.name || `cam-node-${Date.now()}.jpg`
      });

      // Mapping AI telemetry blocks to states
      setDepartment(aiResponse.department);
      setCategory(aiResponse.category);
      setDescription(aiResponse.description || '');
      setSeverity(aiResponse.severity || 'Medium');
      setIsSafetyHazardAtNight(aiResponse.isSafetyHazardAtNight || false);
      
      // Mock static CDN placeholder path until storage engine pipeline is tied
      setImageUrl("https://images.unsplash.com/photo-1594913785162-e6785b49eed9?auto=format&fit=crop&w=600&q=80");
      
      setAiTelemetry({ confidence: aiResponse.confidence });
    } catch (err) {
      setErrorMessage(err.message || 'AI engine failed to structure telemetry array.');
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processImageFile(file);
  };

  // 📷 Native Hardware Media Capture System
  const startCamera = async () => {
    setErrorMessage('');
    setShowUploadOptions(false);
    setShowCameraModal(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setErrorMessage('Hardware Interface Blocked: Camera permissions not allowed.');
      setShowCameraModal(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    setShowCameraModal(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        processImageFile(file);
        stopCamera();
      }, 'image/jpeg', 0.95);
    }
  };

  // 📍 Horizontal Geolocation Tracker
  const detectLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Browser missing navigator.geolocation core bindings.');
      return;
    }

    setIsDetectingLocation(true);
    setErrorMessage('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ latitude, longitude });
        setLocationText(`Lat: ${latitude.toFixed(5)}, Lon: ${longitude.toFixed(5)}`);
        
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.display_name) {
            setLocationText(data.display_name);
            if (data.address?.postcode) {
              setWardNumber(data.address.postcode); // Map postal framework context to ward if available
            }
          }
        } catch (e) {
          console.log("Reverse Geocoding node dropped, preserving explicit coordinates.");
        }
        setIsDetectingLocation(false);
      },
      (err) => {
        setErrorMessage('Failed to resolve structural location context. Type parameters manually.');
        setIsDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const removeImage = (e) => {
    e.stopPropagation();
    if (selectedImage?.previewUrl) URL.revokeObjectURL(selectedImage.previewUrl);
    setSelectedImage(null); setDepartment(''); setCategory(''); setImageUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 🚀 Form Submission Handler calling /api/complains/create
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    // Backend Structural Assertion Guards Check
    if (!category.trim() || !department || !wardNumber || !description.trim()) {
      setErrorMessage('Schema Rejection: category, department, Pincode, and description are strictly required fields.');
      setIsSubmitting(false);
      return;
    }

    if (!coordinates.latitude || !coordinates.longitude) {
      setErrorMessage('Location coordinates are resolving. Please wait or check device location permission.');
      setIsSubmitting(false);
      return;
    }

    const finalLat = coordinates.latitude; 
    const finalLng = coordinates.longitude;

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token'); 
      let finalImageUrl = imageUrl;

      // 1. Upload to ImageKit if an image was selected
      if (selectedImage && selectedImage.file) {
        const uploadFormData = new FormData();
        uploadFormData.append('image', selectedImage.file);

        const uploadResponse = await fetch('http://localhost:3000/api/complains/upload-image', {
          method: 'POST',
          headers: {
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: uploadFormData
        });

        const uploadResult = await uploadResponse.json();
        if (!uploadResponse.ok || !uploadResult.success) {
          throw new Error(uploadResult.message || 'Failed to upload image evidence to ImageKit.');
        }
        finalImageUrl = uploadResult.imageUrl;
      }

      // 2. Format payload: Backend expects location as { latitude, longitude }
      const payload = {
        location: {
          latitude: parseFloat(finalLat),
          longitude: parseFloat(finalLng)
        },
        category: category,
        department: department,
        severity: severity,
        wardNumber: wardNumber, // this is the Pincode
        imageUrl: finalImageUrl || null,
        isSafetyHazardAtNight: isSafetyHazardAtNight,
        description: description,
        localArea: localArea
      };

      const response = await fetch('http://localhost:3000/api/complains/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Transactional error processing complaint query at database layer.');
      }

      // Success Lifecycle: Save generated data block ID
      setTicketId(result.complaint?._id || `ERR-${Math.floor(1000 + Math.random() * 9000)}`);
      
      // 🧼 Flush All States Clean
      setCategory('');
      setDepartment('');
      setSeverity('Medium');
      setImageUrl('');
      setIsSafetyHazardAtNight(false);
      setSelectedImage(null);
      setAiTelemetry(null);
      setDescription('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      // Transition frame view to step 2 (Dispatched)
      setCurrentStep(2);
    } catch (err) {
      setErrorMessage(err.message || 'Network stack exception executing endpoint write.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 text-white relative">
      <div className="text-center md:text-left">
        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500 block">File Complaint</span>
        <h2 className="font-display text-3xl font-black tracking-wider text-white mt-1 uppercase">Autonomous Grievance Portal</h2>
      </div>

      {/* Stepper Node Progress Controller */}
      <div className="flex items-center justify-center max-w-xs mx-auto relative my-4">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-slate-800 z-0"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-amber-500 z-0 transition-all duration-500" style={{ width: currentStep === 2 ? '100%' : '0%' }}></div>
        <div className="relative z-10 flex flex-col items-center flex-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold ${currentStep === 1 ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-emerald-500 text-black'}`}>1</div>
          <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500 mt-2">Telemetry</span>
        </div>
        <div className="relative z-10 flex flex-col items-center flex-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold ${currentStep === 2 ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.65)]' : 'bg-[#060A14] text-slate-600 border border-slate-800'}`}>2</div>
          <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500 mt-2">Dispatched</span>
        </div>
      </div>

      {currentStep === 1 && (
        <div className="bg-[#0b1329]/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-2xl transition-all">
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 rounded-xl flex items-start gap-3 animate-fadeIn">
              <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={16} />
              <p className="text-red-400 font-mono text-xs font-medium">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 📷 1. IMAGE EVIDENCE PORT FIELD (`imageUrl`) */}
            <div>
              <label className="block font-mono text-xs uppercase text-slate-400 mb-2 tracking-wide flex items-center gap-2">
                <Cpu size={14} className="text-amber-500" />
                Step 1: Photo Evidence Payload Array (`imageUrl`)
              </label>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/jpg" className="hidden" />

              {isAnalyzingImage ? (
                <div className="border border-amber-500/30 bg-amber-500/5 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3">
                  <Loader2 className="text-amber-500 animate-spin" size={28} />
                  <span className="font-mono text-xs uppercase text-amber-500 tracking-wider">Gemini Core Engine: Evaluating Image Parameters...</span>
                </div>
              ) : !selectedImage ? (
                <div className="relative">
                  {!showUploadOptions ? (
                    <div onClick={() => setShowUploadOptions(true)} className="border border-dashed border-slate-800 hover:border-amber-500/40 transition-all bg-[#060A14]/30 rounded-xl p-10 text-center cursor-pointer group">
                      <div className="flex flex-col items-center gap-2">
                        <UploadCloud size={32} className="text-slate-500 group-hover:text-amber-500 transition-colors mb-1" />
                        <span className="font-body text-sm text-slate-300 font-medium">Add grievance image evidence</span>
                        <span className="text-[11px] text-slate-500 font-mono">Select Live Camera capture or file system stack</span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-slate-800 bg-[#060A14]/50 rounded-xl p-6 animate-fadeIn">
                      <div onClick={startCamera} className="flex flex-col items-center justify-center gap-2 p-6 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-amber-500/50 cursor-pointer transition-all hover:bg-slate-900 group">
                        <Camera size={28} className="text-slate-400 group-hover:text-amber-400 transition-colors" />
                        <span className="font-mono text-xs uppercase font-bold tracking-wider text-slate-200">Open Live Camera</span>
                      </div>
                      <div onClick={() => fileInputRef.current.click()} className="flex flex-col items-center justify-center gap-2 p-6 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-amber-500/50 cursor-pointer transition-all hover:bg-slate-900 group">
                        <UploadCloud size={28} className="text-slate-400 group-hover:text-amber-400 transition-colors" />
                        <span className="font-mono text-xs uppercase font-bold tracking-wider text-slate-200">Upload from Device</span>
                      </div>
                      <button type="button" onClick={() => setShowUploadOptions(false)} className="sm:col-span-2 text-center text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors mt-1">Cancel</button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border border-slate-800 bg-[#060A14]/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden shrink-0">
                      <img src={selectedImage.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-200 font-mono truncate max-w-xs">{selectedImage.name}</p>
                      {aiTelemetry && <span className="text-[10px] mt-1 inline-block bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-semibold">AI Scan Confidence: {(aiTelemetry.confidence * 100).toFixed(0)}%</span>}
                    </div>
                  </div>
                  <button type="button" onClick={removeImage} className="p-2 bg-red-950/40 border border-red-900/40 hover:bg-red-900/40 text-red-400 rounded-lg transition-colors cursor-pointer text-xs font-mono flex items-center gap-1"><X size={14} /> Remove</button>
                </div>
              )}
            </div>

            {/* 📍 GEOLOCATION AUTO-DETECTION BAR */}
            <div className="mt-2">
              {isDetectingLocation ? (
                <div className="flex items-center gap-2 text-xs font-mono text-amber-500 bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl">
                  <Loader2 size={12} className="animate-spin" /> Resolving automatic geolocation coordinates & pincode...
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-xl">
                  <MapPin size={12} className="text-emerald-500" /> Live Geolocation Pinned: {localArea || "Lucknow Area"} (Pincode: {wardNumber || "226012"})
                </div>
              )}
            </div>

            {/* 🏷️ 2. CATEGORY LOG HEADLINE (`category`) */}
            <div>
              <label className="block font-mono text-xs uppercase text-slate-400 mb-2 tracking-wide flex items-center gap-2">
                <ShieldAlert size={14} className="text-amber-500" />
                Step 2: Specific Core Grievance Category Tag (`category`)
              </label>
              <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Pothole, Open Sewer Line, Encroachment..." className="w-full px-4 py-3 bg-[#060A14]/60 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500/50 text-sm" />
            </div>

            {/* 📝 3. INCIDENT DESCRIPTION FIELD (`description`) */}
            <div>
              <label className="block font-mono text-xs uppercase text-slate-400 mb-2 tracking-wide flex items-center gap-2">
                <FileText size={14} className="text-amber-500" />
                Step 3: Grievance Description / Narrative (`description`)
              </label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Describe the incident details (e.g. size of pothole, safety hazard info)..." 
                rows={4}
                className="w-full px-4 py-3 bg-[#060A14]/60 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500/50 text-sm resize-none" 
              />
            </div>

            {/* 🏛️ 4. TARGET OPERATIONAL DEPARTMENT DIRECTORY (`department`) */}
            <div>
              <label className="block font-mono text-xs uppercase text-slate-400 mb-2 tracking-wide flex items-center gap-2">
                <FileText size={14} className="text-amber-500" />
                Step 4: Assigned Administrative Bureau Cluster (`department`)
              </label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full px-4 py-3 bg-[#060A14]/60 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500/50 text-sm appearance-none cursor-pointer" style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', backgroundSize: '14px' }}>
                <option value="" disabled className="text-slate-600">Choose operational directory node...</option>
                {departmentsList.map((dept, index) => <option key={index} value={dept} className="bg-[#060A14] text-slate-300">{dept}</option>)}
              </select>
            </div>

            {/* ⚡ 5. SEVERITY GRID ARRAY SELECTOR (`severity`) & NIGHT RISK TOGGLE (`isSafetyHazardAtNight`) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block font-mono text-xs uppercase text-slate-400 mb-2 tracking-wide">Step 5: Risk Severity Level Allocation (`severity`)</label>
                <div className="flex gap-2">
                  {severityOptions.map((opt) => (
                    <button type="button" key={opt} onClick={() => setSeverity(opt)} className={`flex-1 py-2.5 font-mono text-xs uppercase font-bold rounded-xl border transition-all ${severity === opt ? 'bg-amber-500/10 border-amber-500 text-amber-400' : 'bg-[#060A14]/40 border-slate-800 text-slate-400 hover:border-slate-700'}`}>{opt}</button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-end">
                <div className="border border-slate-800 bg-[#060A14]/30 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-mono text-xs uppercase text-slate-300 font-bold">Night Safety</span>
                    <span className="text-[10px] text-slate-500 font-mono">(`Is Safety Hazard At Night`)</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={isSafetyHazardAtNight} onChange={(e) => setIsSafetyHazardAtNight(e.target.checked)} className="sr-only peer" />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-black after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" disabled={isSubmitting || isAnalyzingImage} className="w-full sm:w-48 py-3.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-600 text-black font-mono text-xs uppercase font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 className="animate-spin text-black" size={16} /> : 'SUBMIT REPORT'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 📹 HARDWARE MEDIA PORT MODAL OVERLAY */}
      {showCameraModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
          <div className="relative bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden max-w-lg w-full flex flex-col items-center shadow-2xl">
            <div className="w-full p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <span className="font-mono text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2"><Camera size={14} className="text-amber-500" /> Active Video Node Capture Matrix</span>
              <button onClick={stopCamera} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"><X size={18} /></button>
            </div>
            <div className="w-full bg-black aspect-video relative flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            </div>
            <div className="w-full p-6 bg-slate-900/40 flex justify-center items-center">
              <button type="button" onClick={capturePhoto} className="w-16 h-16 rounded-full bg-white border-4 border-slate-700 active:scale-95 shadow-xl hover:bg-amber-400" />
            </div>
          </div>
        </div>
      )}

      {/* NODE 2 SUCCESSFUL TRANSACTION COMPILATION BLOCK */}
      {currentStep === 2 && (
        <div className="bg-[#0b1329]/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-8 text-center shadow-2xl max-w-xl mx-auto animate-fadeIn">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto mb-6"><CheckCircle size={32} /></div>
          <h3 className="text-2xl font-bold font-display text-white tracking-wide uppercase">Report Submitted Successfully</h3>
          <p className="text-slate-400 font-body text-sm mt-3">Your grievance report has been successfully recorded in the database.</p>
          <div className="mt-6 p-4 bg-[#060A14] border border-slate-800 rounded-xl max-w-md mx-auto truncate">
            <span className="font-mono text-[10px] text-slate-500 block mb-1 uppercase tracking-wider">Complaint Ticket Reference ID (_id)</span>
            <span className="font-mono text-xs text-amber-500 font-bold">{ticketId}</span>
          </div>
          <div className="mt-8 pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button onClick={() => setCurrentStep(1)} className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs uppercase font-semibold rounded-xl border border-slate-800 transition-colors inline-flex items-center justify-center gap-2">
              <ArrowLeft size={13} /> File New Report
            </button>
            {setActiveTab && (
              <button onClick={() => setActiveTab('track')} className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-mono text-xs uppercase font-bold rounded-xl transition-colors inline-flex items-center justify-center gap-2">
                Track Your Report
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}