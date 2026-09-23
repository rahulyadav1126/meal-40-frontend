export default function CookiesPage() {
  return (
    <main className="bg-slate-50 pb-24 min-h-screen">
      {/* Banner */}
      <div className="bg-[#273249] pt-20 pb-28 px-4 text-center text-white">
        <h1 className="text-[2.8rem] font-[800] m-0 mb-4 tracking-[-0.02em]">Cookie Policy</h1>
        <p className="text-slate-300 text-[1.15rem] m-0 font-medium">How Plate40 uses cookies to improve your experience.</p>
      </div>

      {/* Content Card */}
      <div className="p40-container -mt-16">
        <div className="max-w-[850px] mx-auto py-10 md:py-16 px-5 md:px-[4.5rem] bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(15,23,42,0.1)] border border-slate-200">
          <div className="text-slate-600 leading-[1.85] text-[1.05rem]">
            <p className="font-bold text-[#fc8019] mb-10 text-[0.9rem] uppercase tracking-[0.08em]">Last Updated: September 22, 2026</p>
            
            <h3 className="text-slate-900 mt-10 mb-4 text-[1.35rem] font-bold">1. What are cookies?</h3>
            <p className="mb-6">Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to the owners of the site.</p>
            
            <h3 className="text-slate-900 mt-10 mb-4 text-[1.35rem] font-bold">2. How we use cookies</h3>
            <p className="mb-2">Plate40 uses cookies to:</p>
            <ul className="pl-6 mb-6 list-disc">
              <li className="mb-2">Keep you signed in across sessions (Authentication Cookies).</li>
              <li className="mb-2">Remember your delivery address and preferences (Functional Cookies).</li>
              <li className="mb-2">Understand how you use our application to improve our services (Analytics Cookies).</li>
            </ul>
            
            <h3 className="text-slate-900 mt-10 mb-4 text-[1.35rem] font-bold">3. Managing Cookies</h3>
            <p className="mb-6">You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. If you disable or refuse cookies, please note that some parts of the Plate40 application (like automatic login) may become inaccessible or not function properly.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
