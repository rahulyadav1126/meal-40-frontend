'use client';

import { Star } from 'lucide-react';
import { useMerchantReviewsQuery } from '@plate40/state';
import { Card, ErrorState, PageHeader, Skeleton } from '@plate40/ui';

export default function ReviewsPage() {
  const { data: reviews, isLoading, isError } = useMerchantReviewsQuery();

  if (isLoading) {
    return (
    <main className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader title="Customer reviews" description="Restaurant feedback and ratings." />
        <div className="grid gap-4 mt-6">
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      </main>
    );
  }

  if (isError) {
    return (
    <main className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader title="Customer reviews" description="Restaurant feedback and ratings." />
        <ErrorState message="Could not load reviews at this time." />
      </main>
    );
  }

  // Calculate summary stats
  const totalReviews = reviews?.length || 0;
  const averageRating = totalReviews > 0 
    ? (reviews!.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0';

  return (
    <main className="p-4 sm:p-6 max-w-[1600px] mx-auto">
      <PageHeader title="Customer reviews" description="Restaurant feedback and ratings." />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 mb-8">
        <Card className="p-6 bg-slate-50/50 border-slate-100 flex flex-col justify-center items-center text-center">
          <span className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-2">Average Rating</span>
          <div className="flex items-center gap-2">
            <Star size={36} fill="#f59e0b" color="#f59e0b" />
            <strong className="text-4xl font-bold text-slate-800">{averageRating}</strong>
          </div>
        </Card>
        <Card className="p-6 bg-slate-50/50 border-slate-100 flex flex-col justify-center items-center text-center">
          <span className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-2">Total Reviews</span>
          <strong className="text-4xl font-bold text-slate-800">{totalReviews}</strong>
        </Card>
      </div>

      {!reviews || reviews.length === 0 ? (
        <Card className="p-12 text-center text-slate-500">
          <p>No reviews have been submitted yet.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <Card key={review.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-800 m-0">{review.customer?.name || 'Anonymous Customer'}</h3>
                  <span className="text-xs text-slate-400">Order #{review.orderId} • {new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-1 bg-amber-50 px-2 py-1 rounded-md">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      fill={i < review.rating ? '#f59e0b' : 'transparent'} 
                      color={i < review.rating ? '#f59e0b' : '#cbd5e1'} 
                    />
                  ))}
                </div>
              </div>
              {review.comment ? (
                <p className="text-slate-600 m-0 leading-relaxed italic bg-slate-50 p-4 rounded-xl border border-slate-100">
                  "{review.comment}"
                </p>
              ) : (
                <p className="text-slate-400 text-sm m-0 italic">No comment provided.</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
