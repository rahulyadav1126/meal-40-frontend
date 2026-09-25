import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Direct Support | Plate40',
};

export default function DirectSupportPage() {
  return (
    <main className="bg-[#fdfaf5] pb-24 min-h-screen">
      {/* Banner */}
      <div className="bg-[#ebe3d3] pt-24 pb-32 px-4 text-center rounded-b-[32px] relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.5))] pointer-events-none"></div>
        <h1 className="relative z-10 text-[2.8rem] font-[800] m-0 mb-4 text-slate-800 tracking-tight">Direct Support</h1>
        <p className="relative z-10 text-slate-600 text-[1.15rem] m-0 font-medium max-w-2xl mx-auto">We're here to help you with any issues or queries.</p>
      </div>

      {/* Content Card */}
      <div className="p40-container -mt-20 relative z-20">
        <div className="max-w-[850px] mx-auto py-10 md:py-16 px-5 md:px-[4.5rem] bg-[#fcfaf6] rounded-2xl shadow-[0_15px_40px_-10px_rgba(0,0,0,0.08)] border border-[#ebdcc4]">
          <div className="text-slate-600 leading-[1.85] text-[1.05rem]">
            <h3 className="text-slate-900 mt-2 mb-4 text-[1.35rem] font-bold">Contact Methods</h3>
            <p className="mb-6">Reach out to us through any of the channels below, and our support team will get back to you as soon as possible.</p>
            
            <div className="grid gap-6 md:grid-cols-2 mt-8">
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
                <strong className="text-slate-900 block mb-2 text-lg">Email Support</strong>
                <p className="mb-2 text-sm text-slate-500">Drop us an email for general inquiries or detailed issues.</p>
                <a href="mailto:support@plate40.com" className="text-[#fc8019] font-semibold hover:underline">support@plate40.com</a>
              </div>
              
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
                <strong className="text-slate-900 block mb-2 text-lg">Phone Support</strong>
                <p className="mb-2 text-sm text-slate-500">Call our helpline for immediate assistance with active orders.</p>
                <a href="tel:+919876543210" className="text-[#fc8019] font-semibold hover:underline">+91 (0) 9876 543 210</a>
              </div>
            </div>

            <h3 className="text-slate-900 mt-10 mb-4 text-[1.35rem] font-bold">Business Hours</h3>
            <p className="mb-2">Our support team is available during the following hours:</p>
            <ul className="pl-6 mb-6 list-disc">
              <li>Monday - Friday: 8:00 AM - 11:00 PM</li>
              <li>Saturday - Sunday: 9:00 AM - 12:00 AM (Midnight)</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
