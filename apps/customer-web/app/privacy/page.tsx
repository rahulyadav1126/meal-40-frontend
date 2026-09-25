export default function PrivacyPage() {
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
        <h1 className="relative z-10 text-[2.8rem] font-[800] m-0 mb-4 text-slate-800 tracking-tight">Privacy Policy</h1>
        <p className="relative z-10 text-slate-600 text-[1.15rem] m-0 font-medium max-w-2xl mx-auto">How we collect, use, and protect your personal information.</p>
      </div>

      {/* Content Card */}
      <div className="p40-container relative z-20 mt-16">
        <div className="max-w-[850px] mx-auto py-10 md:py-16 px-5 md:px-[4.5rem] bg-white rounded-2xl shadow-[0_8px_30px_-6px_rgba(0,0,0,0.06)] border border-slate-100 relative">
          {/* Icon */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(219,156,75,0.2)_0%,transparent_60%)]" />
            <svg viewBox="0 0 100 100" className="relative z-10 w-24 h-24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="35" r="2" fill="#dcb17a" />
              <circle cx="80" cy="45" r="1.5" fill="#dcb17a" />
              <path d="M85 20 L90 25 M90 20 L85 25" stroke="#dcb17a" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M 25 30 L 50 15 L 75 30 V 50 C 75 70 50 85 50 85 C 50 85 25 70 25 50 V 30 Z" fill="#f8fafc" stroke="#1f2937" strokeWidth="2.5" strokeLinejoin="round"/>
              <rect x="42" y="48" width="16" height="14" rx="2" fill="#dcb17a" stroke="#1f2937" strokeWidth="2.5" />
              <path d="M 46 48 V 42 A 4 4 0 0 1 54 42 V 48" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="50" cy="55" r="2" fill="#fff" />
            </svg>
          </div>
          <div className="text-slate-600 leading-[1.85] text-[1.05rem]">
            <p className="font-bold text-[#fc8019] mb-10 text-[0.9rem] uppercase tracking-[0.08em]">Last Updated: September 22, 2026</p>

            <h3 className="text-slate-900 mt-10 mb-4 text-[1.35rem] font-bold">1. Information We Collect</h3>
            <p className="mb-2">When you use Plate40, we collect the following information:</p>
            <ul className="pl-6 mb-6 list-disc">
              <li className="mb-2"><strong>Personal Details:</strong> Name, phone number, and email address for account creation.</li>
              <li className="mb-2"><strong>Location Data:</strong> Delivery addresses and precise location data to connect you with nearby kitchens.</li>
              <li className="mb-2"><strong>Transaction Data:</strong> Order history and payment information (processed securely through our partners).</li>
            </ul>

            <h3 className="text-slate-900 mt-10 mb-4 text-[1.35rem] font-bold">2. How We Use Your Information</h3>
            <p className="mb-6">Your information is used strictly to provide and improve our services. Specifically, we share your delivery address and contact number with our delivery partners and kitchen vendors solely for the purpose of fulfilling your order. We do not sell your personal data to third-party marketers.</p>

            <h3 className="text-slate-900 mt-10 mb-4 text-[1.35rem] font-bold">3. Data Security</h3>
            <p className="mb-6">We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. All sensitive data is encrypted in transit and at rest.</p>

            <h3 className="text-slate-900 mt-10 mb-4 text-[1.35rem] font-bold">4. Your Rights</h3>
            <p className="mb-6">You have the right to request a copy of your personal data, request corrections, or request deletion of your account and associated data. Please contact support@plate40.com for assistance.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
