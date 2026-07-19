import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getWardByLocation } from '../utils/location';
// ⚙️ ADDED: LocateFixed icon imported from lucide-react
import { Shield, LocateFixed } from 'lucide-react';

const SignUp = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('citizen'); // 'citizen' or 'official'
  const [wardLocation, setWardLocation] = useState(''); 
  const [department, setDepartment] = useState(''); 
  const [localError, setLocalError] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const navigate = useNavigate();
  const { signup, isLoading, error, isAuthenticated, clearError } = useAuth();

  const departments = [
    'Public Works Department (PWD) / Infrastructure',
    'Electricity & Public Lighting Board',
    'Sanitation & Waste Management',
    'Enforcement & Anti-Encroachment Cell',
    'Local Law Enforcement / Police Department'
  ];

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setLocalError(error);
  }, [error]);

  const validateForm = () => {
    if (!firstName.trim()) {
      setLocalError('First name is required.');
      return false;
    }
    if (!lastName.trim()) {
      setLocalError('Last name is required.');
      return false;
    }
    if (firstName.trim().length < 2 || lastName.trim().length < 2) {
      setLocalError('First and Last names must be at least 2 characters.');
      return false;
    }
    if (!email.trim()) {
      setLocalError('Email address is required.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLocalError('Please enter a valid email address.');
      return false;
    }
    
    if (!wardLocation.trim()) {
      setLocalError('Please enter or detect your Ward Location.');
      return false;
    }

    if (role === 'official' && !department) {
      setLocalError('Please select your department.');
      return false;
    }

    if (!password) {
      setLocalError('Password is required.');
      return false;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return false;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      const userData = {
        firstName: firstName.trim(),
        LastName: lastName.trim(), 
        email: email.trim(),
        password: password,
        role: role.toLowerCase(),
        wardLocation: wardLocation.trim(),
        department: role === 'official' ? department : ""
      };
      
      await signup(userData);
    } catch (err) {
      setLocalError(err.message || 'Sign up failed');
    }
  };

  const handleDetectLocation = async () => {
    setIsLocating(true);
    setLocalError('');
    try {
      const detectedArea = await getWardByLocation();
      setWardLocation(detectedArea);
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060A14] flex items-center justify-center px-4 py-12 text-white">
      <div className="w-full max-w-md">
        
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-xl border border-amber-500/40 flex items-center justify-center text-amber-500 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              <Shield size={22} className="text-amber-500" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-black tracking-widest text-white uppercase leading-none">
            CIVICPULSE
          </h1>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mt-1.5">
            Civic Grievance & Safety Agent
          </span>
        </div>

        {/* Card Body */}
        <div className="bg-[#0b1329]/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative">
          
          <div className="mb-6">
            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500 block">
              Registration Pipeline
            </span>
            <h2 className="text-xl font-bold font-display text-white mt-0.5 tracking-wide">
              Create Account
            </h2>
          </div>

          {/* Validation Error Alert Box */}
          {localError && (
            <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 rounded-xl">
              <p className="text-red-400 font-mono text-xs font-medium">{localError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name Fields */}
            <div>
              <label className="block font-mono text-xs uppercase text-slate-400 mb-2 tracking-wide">
                Full Name
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full px-4 py-3 bg-[#060A14]/60 border border-slate-800 rounded-xl text-white placeholder-slate-600 font-body text-sm outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full px-4 py-3 bg-[#060A14]/60 border border-slate-800 rounded-xl text-white placeholder-slate-600 font-body text-sm outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block font-mono text-xs uppercase text-slate-400 mb-2 tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-[#060A14]/60 border border-slate-800 rounded-xl text-white placeholder-slate-600 font-body text-sm outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
              />
            </div>

            {/* Role Tab Toggles */}
            <div>
              <label className="block font-mono text-xs uppercase text-slate-400 mb-2 tracking-wide">
                System Registry Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('citizen')}
                  className={`py-2.5 px-4 rounded-xl font-mono text-xs uppercase font-semibold transition-all border cursor-pointer ${
                    role === 'citizen'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                      : 'bg-[#060A14]/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Citizen
                </button>
                <button
                  type="button"
                  onClick={() => setRole('official')}
                  className={`py-2.5 px-4 rounded-xl font-mono text-xs uppercase font-semibold transition-all border cursor-pointer ${
                    role === 'official'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                      : 'bg-[#060A14]/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Official
                </button>
              </div>
            </div>

            {/* Ward Location Input */}
            <div className="animate-fadeIn">
              <label className="block font-mono text-xs uppercase text-slate-400 mb-2 tracking-wide">
                Ward Node / Locality
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={wardLocation}
                  onChange={(e) => setWardLocation(e.target.value)}
                  placeholder="Enter ward name or detect"
                  className="w-full pl-4 pr-32 py-3 bg-[#060A14]/60 border border-slate-800 rounded-xl text-white placeholder-slate-600 font-body text-sm outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                />
                {/* ⚙️ UPDATED: Replaced emoji with LocateFixed and aligned flex layout */}
                <button
                  type="button"
                  disabled={isLocating}
                  onClick={handleDetectLocation}
                  className="absolute right-2 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:bg-slate-950 disabled:text-slate-600 text-amber-500 text-[11px] font-mono uppercase font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <LocateFixed size={13} className={isLocating ? 'animate-pulse' : ''} />
                  {isLocating ? 'Locating' : 'Detect'}
                </button>
              </div>
            </div>

            {/* Department Selector Dropdown (Official only) */}
            {role === 'official' && (
              <div className="animate-fadeIn">
                <label className="block font-mono text-xs uppercase text-slate-400 mb-2 tracking-wide">
                  Assigned Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-3 bg-[#060A14]/60 border border-slate-800 rounded-xl text-white placeholder-slate-600 font-body text-sm outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all appearance-none cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', backgroundSize: '14px' }}
                >
                  <option value="" disabled className="bg-[#060A14] text-slate-600">Choose your department...</option>
                  {departments.map((dept, index) => (
                    <option key={index} value={dept} className="bg-[#060A14] text-slate-300">{dept}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Password Fields */}
            <div>
              <label className="block font-mono text-xs uppercase text-slate-400 mb-2 tracking-wide">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#060A14]/60 border border-slate-800 rounded-xl text-white placeholder-slate-600 font-body text-sm outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase text-slate-400 mb-2 tracking-wide">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#060A14]/60 border border-slate-800 rounded-xl text-white placeholder-slate-600 font-body text-sm outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
              />
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 py-3.5 px-4 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-600 text-black font-mono text-xs uppercase font-bold rounded-xl transition-all cursor-pointer tracking-wider shadow-[0_4px_20px_rgba(245,158,11,0.15)] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-black" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Registering Node...
                </>
              ) : (
                'Initialize Account'
              )}
            </button>
          </form>

          {/* Divider Line */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800/80"></div>
            </div>
            <div className="relative flex justify-center text-[11px] font-mono">
              <span className="px-3 bg-[#0f1a36] text-slate-500 rounded-full border border-slate-800/40">Linked Nodes</span>
            </div>
          </div>

          <p className="text-center font-mono text-xs text-slate-400">
            Already signed up?{' '}
            <Link to="/login" className="text-amber-500 hover:text-amber-400 font-bold transition-colors ml-1">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;