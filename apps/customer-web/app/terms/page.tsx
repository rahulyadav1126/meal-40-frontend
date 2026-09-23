export default function TermsPage() {
  return (
    <main className="bg-slate-50 pb-24 min-h-screen">
      {/* Banner */}
      <div className="bg-[#273249] pt-20 pb-28 px-4 text-center text-white">
        <h1 className="text-[2.8rem] font-[800] m-0 mb-4 tracking-[-0.02em]">Terms & Conditions</h1>
        <p className="text-slate-300 text-[1.15rem] m-0 font-medium">Please read these terms carefully before using Plate40.</p>
      </div>

      {/* Content Card */}
      <div className="p40-container -mt-16">
        <div className="max-w-[850px] mx-auto py-10 md:py-16 px-5 md:px-[4.5rem] bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(15,23,42,0.1)] border border-slate-200">
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
