import React, { useState } from 'react';
import { Booking } from '../../types';
import { StarRating } from '../common/StarRating';
import { X, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

interface SubmitReviewModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: {
    booking_id: string;
    resource_id: string;
    rating: number;
    comment: string;
    reliability_score?: number;
    cleanliness_score?: number;
  }) => void;
}

export const SubmitReviewModal: React.FC<SubmitReviewModalProps> = ({
  booking,
  isOpen,
  onClose,
  onSubmit
}) => {
  const [rating, setRating] = useState<number>(5);
  const [reliabilityScore, setReliabilityScore] = useState<number>(5);
  const [cleanlinessScore, setCleanlinessScore] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      alert('Please select an overall star rating (1 to 5 stars).');
      return;
    }
    if (!comment.trim()) {
      alert('Please share a brief comment about your experience with this equipment.');
      return;
    }

    onSubmit({
      booking_id: booking.id,
      resource_id: booking.resource_id,
      rating,
      comment: comment.trim(),
      reliability_score: reliabilityScore,
      cleanliness_score: cleanlinessScore
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#D8C3A5] space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-stone-400 hover:text-stone-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#879078]/20 text-[#4f5745] flex items-center justify-center mx-auto border-2 border-[#879078]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#34251F]">
              Review Submitted!
            </h3>
            <p className="text-xs text-stone-500 font-inter">
              Thank you for helping other campus researchers discover high-quality equipment.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#BF6B2E] font-inter">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verified Borrower Feedback</span>
              </div>
              <h2 className="text-xl font-bold text-[#34251F] mt-1">
                Rate & Review Equipment
              </h2>
              <p className="text-xs text-stone-500 font-inter mt-0.5">
                Share your operational experience for the completed reservation.
              </p>
            </div>

            {/* Equipment Snapshot Card */}
            <div className="flex items-center gap-3 p-3 bg-[#FFFAF2] rounded-xl border border-[#D8C3A5]">
              <img
                src={booking.resource_image}
                alt={booking.resource_title}
                className="w-14 h-14 rounded-lg object-cover border border-[#D8C3A5] shrink-0"
              />
              <div className="text-xs font-inter">
                <div className="font-bold text-[#34251F] line-clamp-1">
                  {booking.resource_title}
                </div>
                <div className="text-stone-500">{booking.resource_category}</div>
                <div className="text-[11px] text-[#BF6B2E] font-medium">
                  {booking.location_label}
                </div>
              </div>
            </div>

            {/* Overall Star Rating */}
            <div className="space-y-1.5 text-center p-4 bg-stone-50 rounded-xl border border-stone-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6F4E37] font-inter">
                Overall Experience Rating *
              </label>
              <div className="flex justify-center py-1">
                <StarRating
                  rating={rating}
                  size="lg"
                  interactive
                  onChange={setRating}
                />
              </div>
              <div className="text-xs font-semibold text-[#BF6B2E] font-inter">
                {rating === 5 && 'Outstanding — Flawless performance & calibration'}
                {rating === 4 && 'Good — Reliable and ready for service'}
                {rating === 3 && 'Average — Met baseline requirements with minor notes'}
                {rating === 2 && 'Below Average — Encountered unexpected issues'}
                {rating === 1 && 'Poor — Apparatus requires maintenance attention'}
              </div>
            </div>

            {/* Sub-Ratings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-inter">
              <div className="p-3 bg-[#FFFAF2] rounded-xl border border-[#D8C3A5]/60 flex items-center justify-between">
                <span className="font-medium text-stone-600">Reliability & Accuracy:</span>
                <StarRating
                  rating={reliabilityScore}
                  size="sm"
                  interactive
                  onChange={setReliabilityScore}
                />
              </div>
              <div className="p-3 bg-[#FFFAF2] rounded-xl border border-[#D8C3A5]/60 flex items-center justify-between">
                <span className="font-medium text-stone-600">Condition & Cleanliness:</span>
                <StarRating
                  rating={cleanlinessScore}
                  size="sm"
                  interactive
                  onChange={setCleanlinessScore}
                />
              </div>
            </div>

            {/* Written Comments */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6F4E37] font-inter mb-1.5">
                Review Comments & Operating Tips *
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Describe setup quality, speed, optical/mechanical precision, and any tips for other borrowers..."
                required
                className="w-full p-3 text-xs sm:text-sm rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] text-[#34251F] font-inter focus:outline-none focus:border-[#6F4E37]"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#D8C3A5] text-xs font-inter">
              <span className="text-stone-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#879078]" />
                <span>Verified borrower badge attached</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-[#BF6B2E] hover:bg-[#a35922] transition-colors rounded-lg shadow-xs"
                >
                  Submit Star Rating
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
