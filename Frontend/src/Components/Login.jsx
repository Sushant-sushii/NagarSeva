import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const navigate = useNavigate();
  const { login, isLoading, error, isAuthenticated, clearError } = useAuth();

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setLocalError(error);
  }, [error]);

  const validateForm = () => {
    if (!email.trim()) {
      setLocalError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLocalError('Please enter a valid email');
      return false;
    }
    if (!password.trim()) {
      setLocalError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
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
      await login(email, password);
    } catch (err) {
      setLocalError(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#060A14] flex items-center justify-center px-4 py-12 text-white">
      <div className="w-full max-w-md">
        
        {/* Logo and Header — Matched with TopBar Brand Layer */}
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

        {/* Login Form Card — Premium Glassmorphic Shell */}
        <div className="bg-[#0b1329]/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative">
          
          <div className="mb-6">
            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500 block">
              Authentication Portal
            </span>
            <h2 className="text-xl font-bold font-display text-white mt-0.5 tracking-wide">
              Sign In
            </h2>
          </div>

          {/* Error Alert — Balanced Warning Tone */}
          {localError && (
            <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 rounded-xl">
              <p className="text-red-400 font-mono text-xs font-medium">{localError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block font-mono text-xs uppercase text-slate-400 mb-2 tracking-wide">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-[#060A14]/60 border border-slate-800 rounded-xl text-white placeholder-slate-600 font-body text-sm outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block font-mono text-xs uppercase text-slate-400 mb-2 tracking-wide">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#060A14]/60 border border-slate-800 rounded-xl text-white placeholder-slate-600 font-body text-sm outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
              />
            </div>

            {/* Submit Button — Solid Cyber Glow */}
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
                  Processing...
                </>
              ) : (
                'Access Dashboard'
              )}
            </button>
          </form>

          {/* Divider Line */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800/80"></div>
            </div>
            <div className="relative flex justify-center text-[11px] font-mono">
              <span className="px-3 bg-[#0f1a36] text-slate-500 rounded-full border border-slate-800/40">New Layer?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <p className="text-center font-mono text-xs text-slate-400">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-amber-500 hover:text-amber-400 font-bold transition-colors ml-1"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Footer Technical Metadata Label */}
        <p className="text-center text-slate-600 font-mono text-[10px] uppercase tracking-wider mt-6">
          Security Protocol Layer Active // AES-256 Secured
        </p>
      </div>
    </div>
  );
};

export default Login;