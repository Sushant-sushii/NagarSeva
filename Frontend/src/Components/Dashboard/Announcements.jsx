import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Plus, Image, Send, Megaphone, Calendar, Tag, User, Sparkles, X, CheckCircle } from 'lucide-react';

export default function Announcements({ user }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states (Only for officials)
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const isOfficial = user?.role === 'official' || user?.role === 'admin';

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('http://localhost:3000/api/announcements');
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to sync with announcement streams.');
      }

      setAnnouncements(result.announcements || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error communicating with announcement telemetry services.');
      setLoading(false);
    }
  };

  // Image Selector & Auto-Uploader
  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setUploadingImage(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/announcements/upload-image', {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'ImageKit node failed to compile resource.');
      }

      setImageUrl(result.imageUrl);
      setUploadingImage(false);
    } catch (err) {
      console.error('Image upload failed:', err);
      setError('Failed to upload image. Please try again.');
      setUploadingImage(false);
      setImageFile(null);
    }
  };

  const handlePublishSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setPublishing(true);
    setError('');
    setSuccessMsg('');

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/announcements/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          title,
          content,
          imageUrl
        })
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to dispatch announcement packet.');
      }

      setSuccessMsg('Announcement successfully published to all grids!');
      
      // Clear form
      setTitle('');
      setContent('');
      setImageUrl('');
      setImageFile(null);

      // Prepend the new announcement to state
      setAnnouncements(prev => [result.announcement, ...prev]);

      setTimeout(() => {
        setSuccessMsg('');
      }, 5000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to publish announcement.');
    } finally {
      setPublishing(false);
    }
  };

  const removeSelectedImage = () => {
    setImageUrl('');
    setImageFile(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="text-amber-500 animate-spin" size={32} />
        <span className="font-mono text-xs uppercase text-slate-500 tracking-wider">Syncing Bulletin Feeds...</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 text-white text-left animate-fadeIn">
      {/* Title Header */}
      <div className="border-b border-slate-900 pb-4">
        <span className="font-mono text-xs uppercase tracking-widest text-slate-500 block">Civic Bulletin Board</span>
        <h2 className="font-display text-4xl font-black tracking-wider text-white mt-0.5 uppercase">Announcements Hub</h2>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={16} />
          <p className="text-red-400 font-mono text-xs font-medium">{error}</p>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-start gap-3">
          <CheckCircle className="text-emerald-400 shrink-0 mt-0.5" size={16} />
          <p className="text-emerald-400 font-mono text-xs font-medium">{successMsg}</p>
        </div>
      )}

      {/* Main Grid: Publishing Form (Officials only) & Announcements Feed */}
      <div className={`grid grid-cols-1 ${isOfficial ? 'lg:grid-cols-12' : 'grid-cols-1'} gap-8`}>
        
        {/* OFFICIALS ONLY PUBLISHING SIDEBAR */}
        {isOfficial && (
          <div className="lg:col-span-4 bg-[#0b1329]/20 border border-slate-800/80 p-6 rounded-3xl space-y-6 self-start shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
              <Megaphone className="text-amber-500" size={16} />
              <h3 className="font-display text-lg font-bold uppercase tracking-wide">Publish Announcement</h3>
            </div>

            <form onSubmit={handlePublishSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="font-mono text-[10px] uppercase text-slate-400">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g., Road Maintenance Notice"
                  required
                  className="w-full px-4 py-2.5 bg-[#060A14] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[10px] uppercase text-slate-400">Content / Message</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Provide announcement details here..."
                  rows={6}
                  required
                  className="w-full px-4 py-3 bg-[#060A14] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-amber-500/50 resize-none"
                />
              </div>

              {/* Image Auto Uploader */}
              <div className="space-y-2">
                <label className="font-mono text-[10px] uppercase text-slate-400 block">Announcement Banner (Optional)</label>
                
                {!imageUrl ? (
                  <label className="flex flex-col items-center justify-center border border-dashed border-slate-800 hover:border-amber-500/50 bg-[#060A14]/40 h-28 rounded-xl cursor-pointer transition-all group">
                    {uploadingImage ? (
                      <div className="flex flex-col items-center gap-1">
                        <Loader2 className="text-amber-500 animate-spin" size={18} />
                        <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">Uploading...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5">
                        <Image className="text-slate-500 group-hover:text-amber-500 transition-colors" size={20} />
                        <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest font-bold">Select Banner Image</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative border border-slate-800 rounded-xl overflow-hidden group">
                    <img 
                      src={imageUrl} 
                      alt="Uploaded Banner Preview" 
                      className="w-full h-28 object-cover opacity-80"
                    />
                    <button
                      type="button"
                      onClick={removeSelectedImage}
                      className="absolute top-2 right-2 bg-slate-950/80 hover:bg-red-500 text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={publishing || uploadingImage}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-500 text-black text-xs font-mono uppercase font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.1)] flex items-center justify-center gap-2 cursor-pointer"
              >
                {publishing ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Dispatching...
                  </>
                ) : (
                  <>
                    <Send size={14} /> Publish Grid Notification
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ANNOUNCEMENTS FEEDS */}
        <div className={isOfficial ? 'lg:col-span-8' : 'w-full'}>
          {announcements.length === 0 ? (
            <div className="text-center py-24 border border-slate-900 bg-[#0b1329]/10 rounded-3xl text-slate-500 font-mono text-xs max-w-lg mx-auto">
              [ No active bulletin board announcements published yet ]
            </div>
          ) : (
            <div className="space-y-6">
              {announcements.map((ann) => (
                <div 
                  key={ann._id} 
                  className="bg-[#0b1329]/20 border border-slate-800/80 rounded-3xl overflow-hidden shadow-lg transition-transform hover:translate-y-[-2px] duration-350 flex flex-col md:flex-row"
                >
                  {/* Banner Image (if any) */}
                  {ann.imageUrl && (
                    <div className="md:w-2/5 shrink-0 border-b md:border-b-0 md:border-r border-slate-900 bg-[#060A14]/30 relative overflow-hidden min-h-[160px] md:min-h-full">
                      <img 
                        src={ann.imageUrl} 
                        alt={ann.title} 
                        className="absolute inset-0 w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  )}

                  {/* Announcement Details */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      
                      {/* Meta header */}
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                          <Tag size={8} /> {ann.department || 'Administration'}
                        </span>
                        
                        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                          <Calendar size={10} /> {new Date(ann.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>

                      <h3 className="font-display text-xl font-bold tracking-normal text-white uppercase mt-1">
                        {ann.title}
                      </h3>

                      <p className="text-slate-400 text-xs leading-relaxed whitespace-pre-line font-body font-medium">
                        {ann.content}
                      </p>
                    </div>

                    {/* Official signature footer */}
                    <div className="border-t border-slate-900/60 pt-3.5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <div className="flex items-center gap-2">
                        <User size={12} className="text-amber-500/60" />
                        <span>Posted by: <strong className="text-slate-300">{ann.officialName}</strong></span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-[9px] text-slate-600 uppercase tracking-widest">
                        <Sparkles size={10} className="text-amber-500/30" /> Official Bulletin
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
