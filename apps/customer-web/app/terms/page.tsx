export default function TermsPage() {
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
        <h1 className="relative z-10 text-[2.8rem] font-[800] m-0 mb-4 text-slate-800 tracking-tight">Terms & Conditions</h1>
        <p className="relative z-10 text-slate-600 text-[1.15rem] m-0 font-medium max-w-2xl mx-auto">Please read these terms carefully before using Plate40.</p>
      </div>

      {/* Content Card */}
      <div className="p40-container relative z-20 mt-16">
        <div className="max-w-[850px] mx-auto py-10 md:py-16 px-5 md:px-[4.5rem] bg-white rounded-2xl shadow-[0_8px_30px_-6px_rgba(0,0,0,0.06)] border border-slate-100 relative">
          {/* Icon */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(219,156,75,0.2)_0%,transparent_60%)]" />
            <svg viewBox="0 0 100 100" className="relative z-10 w-24 h-24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="15" cy="55" r="1.5" fill="#dcb17a" />
              <circle cx="85" cy="30" r="2" fill="#dcb17a" />
              <path d="M20 20 L25 25 M25 20 L20 25" stroke="#dcb17a" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M 30 20 H 60 L 75 35 V 80 A 4 4 0 0 1 71 84 H 30 A 4 4 0 0 1 26 80 V 24 A 4 4 0 0 1 30 20 Z" fill="#f8fafc" stroke="#1f2937" strokeWidth="2.5" strokeLinejoin="round"/>
              <path d="M 60 20 V 35 H 75" fill="#dcb17a" stroke="#1f2937" strokeWidth="2.5" strokeLinejoin="round"/>
              <path d="M 40 45 H 60" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 40 55 H 60" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="65" cy="65" r="12" fill="#dcb17a" stroke="#1f2937" strokeWidth="2.5" />
              <path d="M 59 65 L 63 69 L 71 61" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="text-slate-600 leading-[1.85] text-[1.05rem]">
            <p className="font-bold text-[#fc8019] mb-10 text-[0.9rem] uppercase tracking-[0.08em]">Last Updated: September 22, 2026</p>

            <h3 className="text-slate-900 mt-10 mb-4 text-[1.35rem] font-bold">1. Introduction</h3>
            <p className="mb-6">Welcome to Plate40. By accessing our platform, you agree to these Terms and Conditions. Plate40 acts as a hyper-local food delivery aggregator providing affordable ₹40 meals through verified neighborhood kitchens.</p>

            <h3 className="text-slate-900 mt-10 mb-4 text-[1.35rem] font-bold">2. Ordering and Delivery</h3>
            <p className="mb-6">All orders placed on the platform are subject to availability. While we strive for 25-minute delivery, actual delivery times may vary due to weather, traffic, and kitchen preparation times. Plate40 reserves the right to cancel orders if kitchens are unresponsive or unavailable.</p>

            <h3 className="text-slate-900 mt-10 mb-4 text-[1.35rem] font-bold">3. Pricing and Payments</h3>
            <p className="mb-6">Prices are clearly displayed on the app. The ₹40 base price is subject to taxes and delivery fees where applicable. We maintain a zero-surge pricing policy, meaning food prices will not artificially inflate during peak hours.</p>

            <h3 className="text-slate-900 mt-10 mb-4 text-[1.35rem] font-bold">4. Cancellation Policy</h3>
            <p className="mb-6">Orders can only be cancelled before the kitchen has accepted the preparation request. Once an order enters the &quot;preparing&quot; stage, cancellations are generally not permitted.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
