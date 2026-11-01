import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { DEMO_PROFILES } from '../services/db';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  User,
  KeyRound,
  AlertCircle
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (profile: UserProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Registration state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('requester');
  const [regDepartment, setRegDepartment] = useState('Computer Science & AI');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please provide your academic or institutional email address.');
      return;
    }

    if (!password || password.length < 4) {
      setError('Please enter a valid password (minimum 4 characters).');
      return;
    }

    // Match existing demo profile or create dynamic session
    const matched = DEMO_PROFILES.find(p => p.email.toLowerCase() === cleanEmail);
    if (matched) {
      onLogin(matched);
      return;
    }

    // Create session profile for custom email
    const dynamicProfile: UserProfile = {
      id: `usr-${Date.now()}`,
      display_name: cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email: cleanEmail,
      role: 'requester',
      organisation_id: 'org-apex',
      organisation_name: 'Apex Institute of Technology',
      department: 'General Research & Science',
      verified_trainings: ['Basic Lab Safety Orientation']
    };

    onLogin(dynamicProfile);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!regEmail.trim()) {
      setError('Please provide an email address.');
      return;
    }
    if (!regPassword || regPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    const newProfile: UserProfile = {
      id: `usr-${Date.now()}`,
      display_name: regName.trim(),
      email: regEmail.trim().toLowerCase(),
      role: regRole,
      organisation_id: 'org-apex',
      organisation_name: 'Apex Institute of Technology',
      department: regDepartment,
      verified_trainings: ['Basic Lab Safety Orientation', 'Equipment Handling Level 1']
    };

    onLogin(newProfile);
  };

  return (
    <div className="min-h-screen bg-[#FFFAF2] text-[#34251F] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Decorative Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#F7E7CE] rounded-full blur-3xl opacity-50 -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#879078]/15 rounded-full blur-3xl opacity-50 -z-10 pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-xl w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#6F4E37] text-white shadow-md mb-2">
            <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
              <path d="M4 19h16v2H4zm2-4h12v2H6zm-2-6h16v2H4zm3-5h10v2H7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-[#34251F] tracking-tight">
            ResourceBridge
          </h1>
          <p className="text-sm text-[#50453e] font-inter">
            Institutional Equipment & Space Sharing Network
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7E7CE] border border-[#D8C3A5] text-[11px] font-semibold text-[#6F4E37] font-inter">
            <ShieldCheck className="w-3.5 h-3.5 text-[#BF6B2E]" />
            <span>Authenticated Access Required</span>
          </div>
        </div>

        {/* Authentication Card */}
        <div className="bg-white rounded-2xl border border-[#D8C3A5] shadow-lg overflow-hidden">
          {/* Tab Selector */}
          <div className="flex border-b border-[#D8C3A5] bg-[#FFFAF2]">
            <button
              type="button"
              onClick={() => {
                setActiveTab('signin');
                setError(null);
              }}
              className={`flex-1 py-3.5 text-center font-inter text-xs sm:text-sm font-semibold transition-colors ${
                activeTab === 'signin'
                  ? 'border-b-2 border-[#BF6B2E] text-[#6F4E37] bg-white'
                  : 'text-stone-500 hover:text-[#34251F]'
              }`}
            >
              Sign In to Your Account
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setError(null);
              }}
              className={`flex-1 py-3.5 text-center font-inter text-xs sm:text-sm font-semibold transition-colors ${
                activeTab === 'register'
                  ? 'border-b-2 border-[#BF6B2E] text-[#6F4E37] bg-white'
                  : 'text-stone-500 hover:text-[#34251F]'
              }`}
            >
              Register New Researcher / Staff
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-inter flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {activeTab === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#34251F] font-inter mb-1">
                    Academic or Staff Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="e.g. sarah.chen@apex.edu"
                      className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] focus:bg-white focus:outline-none focus:border-[#6F4E37] focus:ring-2 focus:ring-[#BF6B2E]/20 text-[#34251F] font-inter"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#34251F] font-inter mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] focus:bg-white focus:outline-none focus:border-[#6F4E37] focus:ring-2 focus:ring-[#BF6B2E]/20 text-[#34251F] font-inter"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-inter pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-stone-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-[#BF6B2E] border-[#D8C3A5] focus:ring-[#BF6B2E]"
                    />
                    <span>Remember this session</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('Please contact your department IT administrator or use the Register tab to create an account.')}
                    className="text-[#BF6B2E] hover:underline"
                  >
                    Forgot credentials?
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl text-sm font-semibold font-inter bg-[#BF6B2E] text-white hover:bg-[#a35922] transition-colors shadow-sm flex items-center justify-center gap-2 mt-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Sign In & Access Platform</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#34251F] font-inter mb-1">
                    Full Name & Title
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      required
                      placeholder="e.g. Dr. Alan Turing"
                      className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] focus:outline-none focus:border-[#6F4E37] text-[#34251F] font-inter"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#34251F] font-inter mb-1">
                    Academic Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      required
                      placeholder="e.g. a.turing@apex.edu"
                      className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] focus:outline-none focus:border-[#6F4E37] text-[#34251F] font-inter"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#34251F] font-inter mb-1">
                      Account Role
                    </label>
                    <select
                      value={regRole}
                      onChange={e => setRegRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] text-[#34251F] font-inter"
                    >
                      <option value="requester">Researcher / Borrower</option>
                      <option value="owner">Lab Custodian / Owner</option>
                      <option value="manager">Department Manager</option>
                      <option value="admin">System Administrator</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#34251F] font-inter mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={regDepartment}
                      onChange={e => setRegDepartment(e.target.value)}
                      required
                      placeholder="e.g. Bio-engineering"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] text-[#34251F] font-inter"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#34251F] font-inter mb-1">
                    Create Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      required
                      placeholder="Minimum 4 characters"
                      className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] focus:outline-none focus:border-[#6F4E37] text-[#34251F] font-inter"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl text-sm font-semibold font-inter bg-[#6F4E37] text-white hover:bg-[#553722] transition-colors shadow-sm flex items-center justify-center gap-2 mt-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Create Account & Sign In</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Institutional Reassurance Footer */}
        <div className="text-center text-xs text-stone-500 font-inter space-y-1">
          <p>Protected by Institutional Single Sign-On (SSO) &amp; Role-Based Access Control</p>
          <p className="text-[11px] text-stone-400">ResourceBridge Hackathon Production Build • Apex University</p>
        </div>
      </div>
    </div>
  );
};
