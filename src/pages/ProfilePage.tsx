import React from 'react';
import { UserProfile, UserRole } from '../types';
import { DEMO_PROFILES } from '../services/db';
import {
  User,
  ShieldCheck,
  Building,
  Mail,
  Award,
  CheckCircle2,
  Sliders,
  ExternalLink
} from 'lucide-react';

interface ProfilePageProps {
  currentProfile: UserProfile;
  onSwitchProfile: (profile: UserProfile) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentProfile,
  onSwitchProfile
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-[#D8C3A5] pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-[#BF6B2E] font-inter">
          // IDENTITY & ACCREDITATION
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#34251F] mt-1">
          User Profile & Safety Credentials
        </h1>
        <p className="text-xs sm:text-sm text-[#50453e] mt-1 font-inter">
          Verified academic affiliation, institutional department, and certified equipment training qualifications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* User Badge Card (5 cols) */}
        <div className="md:col-span-5 bg-white rounded-2xl border border-[#D8C3A5] p-6 shadow-xs text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-[#6F4E37] text-white flex items-center justify-center font-bold text-2xl mx-auto shadow-md">
            {currentProfile.display_name.charAt(0)}
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#34251F]">
              {currentProfile.display_name}
            </h2>
            <div className="text-xs text-[#BF6B2E] font-semibold font-inter capitalize">
              Role: {currentProfile.role}
            </div>
            <div className="text-xs text-stone-500 font-inter mt-0.5">
              {currentProfile.department}
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 text-xs font-inter text-left space-y-2">
            <div className="flex items-center gap-2 text-stone-600">
              <Mail className="w-4 h-4 text-[#6F4E37]" />
              <span>{currentProfile.email}</span>
            </div>
            <div className="flex items-center gap-2 text-stone-600">
              <Building className="w-4 h-4 text-[#6F4E37]" />
              <span>{currentProfile.organisation_name}</span>
            </div>
          </div>
        </div>

        {/* Credentials & Role Switcher (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          {/* Safety Certifications */}
          <div className="bg-white rounded-2xl border border-[#D8C3A5] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#D8C3A5] pb-3">
              <Award className="w-4 h-4 text-[#BF6B2E]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#6F4E37] font-inter">
                Verified Safety Certifications
              </h3>
            </div>

            <p className="text-xs text-[#50453e] font-inter leading-relaxed">
              These verified qualifications automatically unlock restricted equipment reservations across labs.
            </p>

            <div className="space-y-2">
              {currentProfile.verified_trainings.map((cert, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-[#879078]/15 border border-[#879078]/30 flex items-center gap-2.5 text-xs font-inter text-[#4f5745]"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#879078] shrink-0" />
                  <span className="font-semibold">{cert}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Persona Switcher for Hackathon Evaluation */}
          <div className="bg-[#FFFAF2] rounded-2xl border border-[#D8C3A5] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#6F4E37]" />
              <h3 className="text-sm font-bold text-[#6F4E37] font-inter uppercase tracking-wider">
                Simulate Another Demo Persona
              </h3>
            </div>

            <p className="text-xs text-stone-600 font-inter">
              Switch roles with one click to test requester, owner, manager, or admin views:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DEMO_PROFILES.map(prof => (
                <button
                  key={prof.id}
                  onClick={() => onSwitchProfile(prof)}
                  className={`p-3 rounded-xl border text-left text-xs font-inter transition-all ${
                    prof.id === currentProfile.id
                      ? 'bg-white border-[#BF6B2E] shadow-xs'
                      : 'bg-white/80 border-[#D8C3A5] hover:bg-white hover:border-[#6F4E37]'
                  }`}
                >
                  <div className="font-bold text-[#34251F]">{prof.display_name}</div>
                  <div className="text-[11px] text-[#BF6B2E] font-medium capitalize">{prof.role}</div>
                  <div className="text-[10px] text-stone-500 truncate mt-0.5">{prof.department}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
