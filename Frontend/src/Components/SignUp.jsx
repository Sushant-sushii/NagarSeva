import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getWardByLocation } from '../utils/location';

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
    
    // Role-based local frontend validation
    if (role === 'citizen' && !wardLocation.trim()) {
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
      // FIX: Always include both properties to satisfy backend middleware checks
      const userData = {
        firstName: firstName.trim(),
        LastName: lastName.trim(), // Capital 'L' to strictly match backend
        email: email.trim(),
        password: password,
        role: role.toLowerCase(),
        wardLocation: role === 'citizen' ? wardLocation.trim() : "",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a.75.75 0 00-1.788 0l-7 140a.75.75 0 001.721.894l1.591-7.955h6.952l1.591 7.955a.75.75 0 101.721-.894l-7-140zM12.798 7H7.202L10 2.5l2.798 4.5z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">CIVICPULSE</h1>
          <p className="text-cyan-400 text-sm font-medium">Civic Grievance & Safety Agent</p>
        </div>

        {/* Card Body */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-6">Create Account</h2>

          {/* Validation Error Alert Box */}
          {localError && (
            <div className="mb-6 p-4 bg-red-900/80 border border-red-700 rounded-lg backdrop-blur-sm">
              <p className="text-red-200 text-sm font-medium">{localError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <div className="flex gap-3.5">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition-all"
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition-all"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition-all"
              />
            </div>

            {/* Role Tab Toggles */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">I am signing up as a:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('citizen')}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all border-2 ${
                    role === 'citizen'
                      ? 'bg-amber-400/10 border-amber-400 text-amber-400'
                      : 'bg-slate-700 border-slate-600 text-gray-400 hover:border-slate-500'
                  }`}
                >
                  Citizen
                </button>
                <button
                  type="button"
                  onClick={() => setRole('official')}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all border-2 ${
                    role === 'official'
                      ? 'bg-amber-400/10 border-amber-400 text-amber-400'
                      : 'bg-slate-700 border-slate-600 text-gray-400 hover:border-slate-500'
                  }`}
                >
                  Official
                </button>
              </div>
            </div>

            {/* Ward Location Field (Citizen only) */}
            {role === 'citizen' && (
              <div className="animate-fadeIn">
                <label className="block text-sm font-medium text-gray-300 mb-2">Ward Location</label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={wardLocation}
                    onChange={(e) => setWardLocation(e.target.value)}
                    placeholder="Enter locality / ward name or detect"
                    className="w-full pl-4 pr-32 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition-all"
                  />
                  <button
                    type="button"
                    disabled={isLocating}
                    onClick={handleDetectLocation}
                    className="absolute right-2 px-3 py-1.5 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-800 disabled:text-gray-600 text-amber-400 text-xs font-semibold rounded transition-colors"
                  >
                    {isLocating ? 'Locating...' : '🎯 Detect'}
                  </button>
                </div>
              </div>
            )}

            {/* Department Selector Dropdown (Official only) */}
            {role === 'official' && (
              <div className="animate-fadeIn">
                <label className="block text-sm font-medium text-gray-300 mb-2">Select Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition-all appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
                >
                  <option value="" disabled className="bg-slate-800 text-gray-400">Choose your department...</option>
                  {departments.map((dept, index) => (
                    <option key={index} value={dept} className="bg-slate-800 text-white">{dept}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Password Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition-all"
              />
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 disabled:from-gray-500 disabled:to-gray-600 text-slate-900 font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          {/* Bottom Navigation */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-gray-400">Already have an account?</span>
            </div>
          </div>

          <p className="text-center text-gray-400">
            Already signed up?{' '}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;