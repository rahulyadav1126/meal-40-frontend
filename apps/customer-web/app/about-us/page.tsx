import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | Plate40',
};

export default function AboutUsPage() {
  return (
    <main className="relative bg-[#fdfaf5] pb-24 min-h-screen overflow-hidden">
      {/* Subtle Background Watermarks */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden flex items-center justify-center">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
           <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
             <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#1f2937" strokeWidth="0.5"/>
           </pattern>
           <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Banner */}
      <div className="pt-24 pb-16 px-4 text-center relative z-10">
        <h1 className="relative z-10 text-[2.8rem] font-[800] m-0 mb-4 text-slate-800 tracking-tight">About Us</h1>
        <p className="relative z-10 text-slate-600 text-[1.15rem] m-0 font-medium max-w-2xl mx-auto">Discover the story behind Plate40 and our mission.</p>
      </div>

      {/* Content Card */}
      <div className="p40-container relative z-20 mt-16">
        <div className="max-w-[850px] mx-auto py-10 md:py-16 px-5 md:px-[4.5rem] bg-white rounded-2xl shadow-[0_8px_30px_-6px_rgba(0,0,0,0.06)] border border-slate-100 relative">
          {/* Icon */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(219,156,75,0.2)_0%,transparent_60%)]" />
            <svg viewBox="0 0 100 100" className="relative z-10 w-24 h-24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="15" cy="45" r="2" fill="#dcb17a" />
              <path d="M25 25 L30 30 M30 25 L25 30" stroke="#dcb17a" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="85" cy="35" r="1.5" fill="#dcb17a" />
              <path d="M50 20 L58 38 L78 40 L62 54 L68 74 L50 62 L32 74 L38 54 L22 40 L42 38 Z" fill="#f8fafc" stroke="#1f2937" strokeWidth="2.5" strokeLinejoin="round"/>
              <circle cx="50" cy="48" r="8" fill="#dcb17a" stroke="#1f2937" strokeWidth="2.5" />
            </svg>
          </div>
          <div className="text-slate-600 leading-[1.85] text-[1.05rem]">
            <h3 className="text-slate-900 mt-2 mb-4 text-[1.35rem] font-bold">Our Mission</h3>
            <p className="mb-6">At Plate40, we believe that everyone deserves access to affordable, high-quality, and delicious meals every day. Our mission is to bridge the gap between hungry customers and talented neighborhood kitchens, bringing you comforting food at an unbeatable starting price of just ₹40.</p>
            
            <h3 className="text-slate-900 mt-10 mb-4 text-[1.35rem] font-bold">What We Do</h3>
            <p className="mb-6">We operate as a hyper-local food delivery aggregator, partnering closely with verified local chefs, home cooks, and small-scale kitchens. This allows us to offer you a wide variety of meals, from North Indian thalis to South Indian delicacies and quick snacks, ensuring that you never have to compromise on taste or budget.</p>

            <h3 className="text-slate-900 mt-10 mb-4 text-[1.35rem] font-bold">Why Plate40?</h3>
            <ul className="pl-6 mb-6 list-disc">
              <li className="mb-2"><strong>Unbeatable Prices:</strong> Pocket-friendly meals that do not break the bank.</li>
              <li className="mb-2"><strong>Lightning Fast:</strong> Hyperlocal deliveries mean your food arrives hot, usually within 25 minutes.</li>
              <li className="mb-2"><strong>Quality Assured:</strong> We strictly verify every kitchen for hygiene and quality before they go live on our platform.</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
