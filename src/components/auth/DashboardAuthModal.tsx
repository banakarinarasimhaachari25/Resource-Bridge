import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  X,
  KeyRound,
  GraduationCap,
  Wrench,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { UserProfile, UserRole } from '../../types';
import { DashboardType, verifyCredentials } from '../../utils/auth';

interface DashboardAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetDashboard: DashboardType;
  suggestedEmail?: string;
  onSuccess: (profile: UserProfile, targetDashboard: DashboardType) => void;
}

export const DashboardAuthModal: React.FC<DashboardAuthModalProps> = ({
  isOpen,
  onClose,
  targetDashboard,
  suggestedEmail = '',
  onSuccess
}) => {
  const [email, setEmail] = useState(suggestedEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (suggestedEmail) {
      setEmail(suggestedEmail);
    } else {
      if (targetDashboard === 'borrower_dashboard') setEmail('sarah.chen@apex.edu');
      else if (targetDashboard === 'custodian_dashboard') setEmail('m.vance@apex.edu');
      else if (targetDashboard === 'admin_dashboard') setEmail('admin@apex.edu');
    }
    setPassword('');
    setError(null);
    setShowPassword(false);
  }, [suggestedEmail, targetDashboard, isOpen]);

  if (!isOpen) return null;

  const getDashboardDetails = () => {
    switch (targetDashboard) {
      case 'borrower_dashboard':
        return {
          title: 'Borrower Dashboard Login',
          roleLabel: 'Researcher / Equipment Borrower',
          icon: <GraduationCap className="w-5 h-5 text-blue-600" />,
          color: 'blue',
          recommendedCreds: 'sarah.chen@apex.edu (Password: password123)'
        };
      case 'custodian_dashboard':
        return {
          title: 'Custodian Dashboard Login',
          roleLabel: 'Lab Custodian & Equipment Owner',
          icon: <Wrench className="w-5 h-5 text-amber-700" />,
          color: 'amber',
          recommendedCreds: 'm.vance@apex.edu (Password: password123)'
        };
      case 'admin_dashboard':
        return {
          title: 'Institutional Admin Dashboard Login',
          roleLabel: 'System Administrator / Research Dean',
          icon: <Building2 className="w-5 h-5 text-purple-700" />,
          color: 'purple',
          recommendedCreds: 'admin@apex.edu or e.rostova@apex.edu (Password: password123)'
        };
    }
  };

  const details = getDashboardDetails();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsVerifying(true);

    setTimeout(() => {
      const res = verifyCredentials(email, password, targetDashboard);
      setIsVerifying(false);

      if (!res.success || !res.profile) {
        setError(res.error || 'Authentication failed. Please verify credentials.');
        return;
      }

      onSuccess(res.profile, targetDashboard);
      onClose();
    }, 300);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#D8C3A5] shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-[#D8C3A5]/60 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFFAF2] border border-[#D8C3A5] flex items-center justify-center">
              {details.icon}
            </div>
            <div>
              <h3 id="auth-modal-title" className="text-base font-bold text-[#34251F]">
                {details.title}
              </h3>
              <p className="text-[11px] font-medium text-stone-500 font-inter">
                Role Required: <span className="text-[#BF6B2E] font-bold">{details.roleLabel}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Security Reassurance Callout */}
        <div className="bg-[#FFFAF2] border border-[#D8C3A5] rounded-xl p-3 text-xs font-inter text-[#50453e] space-y-1">
          <div className="font-bold text-[#6F4E37] flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-[#BF6B2E]" />
            <span>Institutional Role Authorization</span>
          </div>
          <p className="text-[11px] text-stone-600">
            Access to this separated dashboard requires verified academic credentials with matching authorization privileges.
          </p>
          <div className="pt-1 text-[10px] text-stone-500 bg-white/70 p-1.5 rounded border border-[#D8C3A5]/50">
            <strong>Test Credentials:</strong> {details.recommendedCreds}
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-inter flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-inter text-xs">
          <div>
            <label className="block font-bold uppercase tracking-wider text-stone-600 text-[10px] mb-1">
              Academic or Staff Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="e.g. m.vance@apex.edu"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D8C3A5] bg-[#FFFAF2] focus:bg-white text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-[#BF6B2E]/30 focus:border-[#BF6B2E]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-stone-600 text-[10px] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Enter account password (e.g. password123)"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[#D8C3A5] bg-[#FFFAF2] focus:bg-white text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-[#BF6B2E]/30 focus:border-[#BF6B2E]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#BF6B2E] text-white hover:bg-[#a35922] transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isVerifying ? 'Authenticating...' : 'Sign In & Open Dashboard'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
