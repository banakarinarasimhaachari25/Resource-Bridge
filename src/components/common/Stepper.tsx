import React from 'react';
import { Check } from 'lucide-react';

export interface StepItem {
  id: string;
  label: string;
  description?: string;
}

interface StepperProps {
  steps: StepItem[];
  currentStepIndex: number; // 0-indexed
  onStepClick?: (index: number) => void;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStepIndex, onStepClick }) => {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isActive = index === currentStepIndex;
          const isUpcoming = index > currentStepIndex;

          return (
            <React.Fragment key={step.id}>
              {/* Connector line */}
              {index > 0 && (
                <div
                  className="flex-1 h-0.5 mx-2 transition-colors duration-300"
                  style={{
                    backgroundColor: index <= currentStepIndex ? '#6F4E37' : '#D8C3A5'
                  }}
                />
              )}

              {/* Step node */}
              <button
                type="button"
                onClick={() => onStepClick?.(index)}
                disabled={!onStepClick || isUpcoming}
                className={`flex flex-col items-center group relative focus:outline-none ${
                  onStepClick && !isUpcoming ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <div className="flex items-center justify-center">
                  {isCompleted ? (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105"
                      style={{ backgroundColor: '#6F4E37' }}
                      title={`${step.label} (Completed)`}
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  ) : isActive ? (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-transform group-hover:scale-105"
                      style={{
                        borderColor: '#BF6B2E',
                        backgroundColor: '#FFFAF2'
                      }}
                      title={`${step.label} (Current)`}
                    >
                      <span
                        className="w-3 h-3 rounded-full animate-pulse"
                        style={{ backgroundColor: '#BF6B2E' }}
                      />
                    </div>
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors"
                      style={{
                        borderColor: '#D8C3A5',
                        backgroundColor: '#FFFAF2',
                        color: '#82746d'
                      }}
                      title={`${step.label} (Upcoming)`}
                    >
                      <span className="text-xs font-inter font-medium">{index + 1}</span>
                    </div>
                  )}
                </div>

                <div className="mt-2 text-center">
                  <span
                    className={`block text-xs font-medium font-inter transition-colors ${
                      isActive
                        ? 'font-bold text-[#BF6B2E]'
                        : isCompleted
                        ? 'text-[#6F4E37] font-semibold'
                        : 'text-[#82746d]'
                    }`}
                  >
                    {step.label}
                  </span>
                  {step.description && (
                    <span className="hidden md:block text-[11px] text-[#50453e] mt-0.5">
                      {step.description}
                    </span>
                  )}
                </div>
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
