'use client';

import { useId, useState } from 'react';
import { Star, X } from 'lucide-react';
import { useCreateReviewMutation } from '@plate40/state';
import { Button } from '@plate40/ui';
import { toast } from 'sonner';

interface Props {
  orderId: number;
  restaurantId: number;
  restaurantName: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReviewDialog({ orderId, restaurantId, restaurantName, open, onClose, onSuccess }: Props) {
  const titleId = useId();
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  
  const [createReview, { isLoading }] = useCreateReviewMutation();

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      await createReview({
        orderId,
        restaurantId,
        rating,
        comment: comment.trim() || undefined,
      }).unwrap();
      
      toast.success('Thank you for your review!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Failed to submit review. Please try again.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <section
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="px-6 py-5 border-b border-slate-100 flex justify-between items-start">
          <div>
            <h2 id={titleId} className="text-xl font-bold text-slate-800 m-0">Rate your meal</h2>
            <p className="text-slate-500 text-sm mt-1 m-0">from {restaurantName}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors border-0 bg-transparent cursor-pointer"
          >
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 grid gap-6">
          <div className="flex flex-col items-center gap-4">
            <span className="text-sm font-semibold text-slate-600">How was the food?</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110 active:scale-95 border-0 bg-transparent cursor-pointer"
                >
                  <Star
                    size={32}
                    className="transition-colors duration-200"
                    fill={(hoverRating || rating) >= star ? '#f59e0b' : 'transparent'}
                    color={(hoverRating || rating) >= star ? '#f59e0b' : '#cbd5e1'}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="comment" className="text-sm font-semibold text-slate-700">
              Leave a comment (optional)
            </label>
            <textarea
              id="comment"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like or dislike?"
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#fc8019]/20 focus:border-[#fc8019] outline-none transition-all resize-none text-sm font-sans"
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#fc8019] hover:bg-[#e06b12] border-transparent text-white"
              disabled={isLoading || rating === 0}
            >
              {isLoading ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
