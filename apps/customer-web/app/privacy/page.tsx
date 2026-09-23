export default function PrivacyPage() {
  return (
    <main className="bg-slate-50 pb-24 min-h-screen">
      {/* Banner */}
      <div className="bg-[#273249] pt-20 pb-28 px-4 text-center text-white">
        <h1 className="text-[2.8rem] font-[800] m-0 mb-4 tracking-[-0.02em]">Privacy Policy</h1>
        <p className="text-slate-300 text-[1.15rem] m-0 font-medium">How we collect, use, and protect your personal information.</p>
      </div>

      {/* Content Card */}
      <div className="p40-container -mt-16">
        <div className="max-w-[850px] mx-auto py-10 md:py-16 px-5 md:px-[4.5rem] bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(15,23,42,0.1)] border border-slate-200">
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
