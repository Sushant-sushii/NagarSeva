import React, { useState, useRef } from 'react';
import { ShieldAlert, FileText, UploadCloud, CheckCircle, AlertTriangle, ArrowLeft, X, Loader2 } from 'lucide-react';
// 🧠 Correct SDK Class Name Import
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY; 

export default function ReportIssue() {
  const [currentStep, setCurrentStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false); 
  const [errorMessage, setErrorMessage] = useState('');
  const [ticketId, setTicketId] = useState('');
  
  const fileInputRef = useRef(null);

  const categories = [
    'Public Works Department (PWD) / Infrastructure',
    'Electricity & Public Lighting Board',
    'Sanitation & Waste Management',
    'Enforcement & Anti-Encroachment Cell',
    'Local Law Enforcement / Police Department'
  ];

  const fileToGenerativePart = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({
          inlineData: {
            data: reader.result.split(',')[1],
            mimeType: file.type || 'image/jpeg'
          },
        });
      };
      reader.readAsDataURL(file);
    });
  };

  // 🧠 Correct and Stable Gemini-2.5-Flash SDK Method Call
  const classifyImageWithGemini = async (file) => {
    if (!GEMINI_API_KEY) {
      throw new Error('Missing environment variable: VITE_GEMINI_API_KEY is not defined.');
    }

    // 1. Initialize the GoogleGenerativeAI client properly
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    // 2. Get the correct model instance
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a strict municipal civic grievance image classifier. Analyze the uploaded image and classify it into exactly one of the following departments based on what civic issue is visible in the image.
    Departments List:
    1. 'Public Works Department (PWD) / Infrastructure'
    2. 'Electricity & Public Lighting Board'
    3. 'Sanitation & Waste Management'
    4. 'Enforcement & Anti-Encroachment Cell'
    5. 'Local Law Enforcement / Police Department'

    CRITICAL RULES:
    - If the image does NOT show a valid civic grievance or municipal issue belonging to any of the 5 categories above, reply with exactly: None
    - Your response must be strictly ONLY the department name string or the word 'None'. Do not include markdown, formatting, or extra text.`;

    const imagePart = await fileToGenerativePart(file);

    // 3. Proper generateContent invocation with error handling
    try {
      const result = await model.generateContent([imagePart, prompt]);
      const response = await result.response;
      const text = response.text();
      return text ? text.trim() : 'None';
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    setErrorMessage('');

    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(file.type) && !['jpg', 'jpeg', 'png'].includes(fileExtension)) {
      setErrorMessage('Invalid format. System only accepts JPG or PNG formats.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setErrorMessage('Payload Overflow: Image size cannot exceed 4 MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsAnalyzingImage(true);

    try {
      const prediction = await classifyImageWithGemini(file);

      if (prediction === 'None' || !categories.includes(prediction)) {
        setSelectedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setCategory('');
        setErrorMessage('AI Validation Failed: The uploaded image does not appear to represent a valid civic grievance. Please upload a correct image.');
      } else {
        setSelectedImage({
          file: file,
          previewUrl: URL.createObjectURL(file),
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(2),
          isVerifiedByAI: true 
        });
        setCategory(prediction);
      }
    } catch (err) {
      console.error("Gemini Failure Details:", err);
      setSelectedImage(null);
      setCategory('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      setErrorMessage(
        err.message.includes('API key') 
          ? 'System Error: Gemini API Key authentication rejected. Check your token scope.' 
          : 'AI Neural Classification node failed to respond. Connection reset or blocked by CORS. Please try re-uploading.'
      );
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const triggerFileSelect = () => {
    if (!isAnalyzingImage) fileInputRef.current.click();
  };

  const removeImage = (e) => {
    e.stopPropagation();
    if (selectedImage?.previewUrl) URL.revokeObjectURL(selectedImage.previewUrl);
    setSelectedImage(null);
    setCategory('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    if (!title.trim() || !description.trim() || !category) {
      setErrorMessage('All core database fields (Title, Description, and Department Node) are required.');
      setIsSubmitting(false);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setTicketId(`CP-${Math.floor(1000 + Math.random() * 9000)}`);
      setCurrentStep(2);
    } catch (err) {
      setErrorMessage('Grievance packet routing failed. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    removeImage({ stopPropagation: () => {} });
    setErrorMessage('');
    setCurrentStep(1);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 text-white">
      <div className="text-center md:text-left">
        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500 block">File Complaint</span>
        <h2 className="font-display text-3xl font-black tracking-wider text-white mt-1 uppercase">Report Issue</h2>
      </div>

      <div className="flex items-center justify-center max-w-xs mx-auto relative my-4">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-slate-800 z-0"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-amber-500 z-0 transition-all duration-500" style={{ width: currentStep === 2 ? '100%' : '0%' }}></div>
        <div className="relative z-10 flex flex-col items-center flex-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold ${currentStep === 1 ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-emerald-500 text-black'}`}>1</div>
          <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500 mt-2">Drafting</span>
        </div>
        <div className="relative z-10 flex flex-col items-center flex-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold ${currentStep === 2 ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.65)] border border-amber-400' : 'bg-[#060A14] text-slate-600 border border-slate-800'}`}>2</div>
          <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500 mt-2">Dispatched</span>
        </div>
      </div>

      {currentStep === 1 && (
        <div className="bg-[#0b1329]/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-2xl transition-all">
          <div className="mb-6">
            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500 block">Grievance Telemetry</span>
            <h3 className="text-lg font-black font-display text-white mt-1 tracking-widest uppercase">Evidence & Location Details</h3>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 rounded-xl flex items-start gap-3 animate-fadeIn">
              <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={16} />
              <p className="text-red-400 font-mono text-xs font-medium">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-mono text-xs uppercase text-slate-400 mb-2 tracking-wide flex items-center gap-2">
                <ShieldAlert size={14} className="text-amber-500" />
                Issue Headline / Short Title
              </label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Severe Potholes or Broken Street Light Grid" className="w-full px-4 py-3 bg-[#060A14]/60 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all" />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase text-slate-400 mb-2 tracking-wide">Photo Evidence Upload (Max 4MB)</label>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/png, image/jpeg, image/jpg" className="hidden" disabled={isAnalyzingImage} />

              {isAnalyzingImage ? (
                <div className="border border-amber-500/30 bg-amber-500/5 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3 animate-pulse">
                  <Loader2 className="text-amber-500 animate-spin" size={28} />
                  <span className="font-mono text-xs uppercase text-amber-500 tracking-wider">Gemini AI Layer: Scanning Image Authenticity...</span>
                </div>
              ) : !selectedImage ? (
                <div onClick={triggerFileSelect} className="border border-dashed border-slate-800 hover:border-slate-700/80 transition-all bg-[#060A14]/30 rounded-xl p-8 text-center cursor-pointer group">
                  <div className="flex flex-col items-center gap-2">
                    <UploadCloud size={26} className="text-slate-500 group-hover:text-amber-500 transition-colors" />
                    <span className="font-body text-sm text-slate-300 font-medium">Tap to attach photo evidence</span>
                    <span className="text-[11px] text-slate-500 font-mono">Supports JPG, PNG up to 4MB</span>
                  </div>
                </div>
              ) : (
                <div className="border border-slate-800 bg-[#060A14]/50 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-16 h-16 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                      <img src={selectedImage.previewUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = `<div class="text-slate-500 font-mono text-[10px] text-center p-1">Image</div>`; }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-200 font-mono truncate">{selectedImage.name}</p>
                      {selectedImage.isVerifiedByAI && (
                        <p className="text-[10px] text-emerald-400 font-mono font-semibold">✓ AI Department Auto-Matched</p>
                      )}
                    </div>
                  </div>
                  <button type="button" onClick={removeImage} className="p-2 bg-red-950/40 border border-red-900/40 hover:bg-red-900/40 text-red-400 rounded-lg transition-colors cursor-pointer shrink-0">
                    <X size={15} />
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block font-mono text-xs uppercase text-slate-400 mb-2 tracking-wide">Describe the issue — include duration, impact on residents...</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="Provide a comprehensive breakdown of the crisis..." className="w-full px-4 py-3 bg-[#060A14]/60 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all resize-none" />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase text-slate-400 mb-2 tracking-wide flex items-center gap-2">
                <FileText size={14} className="text-amber-500" />
                Target Department Sector 
                {selectedImage?.isVerifiedByAI && <span className="text-emerald-400 font-normal text-[10px] lowercase font-mono">(auto-assigned by ai)</span>}
              </label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 bg-[#060A14]/60 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all appearance-none cursor-pointer" style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', backgroundSize: '14px' }}>
                <option value="" disabled className="bg-[#060A14] text-slate-600">Select administrative layer...</option>
                {categories.map((cat, index) => <option key={index} value={cat} className="bg-[#060A14] text-slate-300">{cat}</option>)}
              </select>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3">
              <button type="submit" disabled={isSubmitting || isAnalyzingImage} className="w-full sm:w-40 py-3.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-600 text-black font-mono text-xs uppercase font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 className="animate-spin text-black" size={16} /> : 'REVIEW'}
              </button>
            </div>
          </form>
        </div>
      )}

      {currentStep === 2 && (
        <div className="bg-[#0b1329]/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-8 text-center shadow-2xl max-w-xl mx-auto animate-fadeIn">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto mb-6"><CheckCircle size={32} /></div>
          <h3 className="text-2xl font-bold font-display text-white tracking-wide uppercase">Report Filed Successfully</h3>
          <p className="text-slate-400 font-body text-sm mt-3">Your grievance data package has been logged.</p>
          <div className="mt-6 p-4 bg-[#060A14] border border-slate-800 rounded-xl max-w-xs mx-auto"><span className="font-mono text-sm text-amber-500 font-bold">{ticketId}</span></div>
          <div className="mt-8 pt-2 border-t border-slate-800/60">
            <button onClick={resetForm} className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs uppercase font-semibold rounded-xl border border-slate-800 transition-colors inline-flex items-center gap-2"><ArrowLeft size={13} /> File Another Report</button>
          </div>
        </div>
      )}
    </div>
  );
}