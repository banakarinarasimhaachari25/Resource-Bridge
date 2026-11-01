import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  trendText?: string;
  isPositive?: boolean;
  subtitle?: string;
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  trendText,
  isPositive = true,
  subtitle,
  icon
}) => {
  return (
    <div className="bg-white rounded-xl border border-[#D8C3A5] p-6 shadow-sm relative overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* 4px Burnt Amber top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#BF6B2E]" />

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider font-inter text-[#6F4E37]">
          {label}
        </span>
        {icon && (
          <div className="p-2 rounded-lg bg-[#FFFAF2] text-[#6F4E37] border border-[#D8C3A5]">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-3 my-1">
        <span className="text-4xl lg:text-5xl font-extrabold tracking-tight text-[#34251F]">
          {value}
        </span>
        {trendText && (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium font-inter ${
              isPositive
                ? 'bg-[#879078]/15 text-[#4f5745] border border-[#879078]/30'
                : 'bg-[#A94438]/15 text-[#A94438] border border-[#A94438]/30'
            }`}
          >
            {trendText}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-[#50453e] font-inter mt-2">
          {subtitle}
        </p>
      )}
    </div>
  );
};
