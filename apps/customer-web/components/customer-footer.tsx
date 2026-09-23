'use client';
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { ROUTES } from '@plate40/config';
import { Facebook, Instagram, Linkedin, Twitter, Play, Building2, ShieldCheck } from 'lucide-react';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function CustomerFooter() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!parallaxRef.current) return;
    
    const ctx = gsap.context(() => {
      gsap.fromTo('.parallax-bg', 
        { yPercent: -15 },
        {
          yPercent: 15,
          ease: 'none',
          scrollTrigger: {
            trigger: parallaxRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1, // Adds a slight smoothing delay to the scrub
          }
        }
      );
    }, parallaxRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <footer className="mt-40 bg-[#383838] text-gray-300 relative pb-0 before:absolute before:-top-8 before:left-0 before:w-full before:h-16 before:bg-[#383838] before:[clip-path:polygon(0_100%,100%_0,100%_100%,0_100%)] before:-z-10">
      <div className="p40-container">
        {/* Newsletter Section */}
        <div ref={parallaxRef} className="relative mx-auto max-w-5xl -top-24 border-[12px] border-[#f58220] rounded flex flex-col p-10 md:p-14 gap-8 shadow-[0_10px_25px_rgba(0,0,0,0.1)] -mb-16 overflow-hidden min-h-[300px] justify-center items-center text-center">
          
          {/* Parallax Background */}
          <div className="absolute inset-0 w-full h-[140%] -top-[20%] parallax-bg z-0 pointer-events-none will-change-transform">
            <img src="/hero-bg.jpg" alt="Background" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/70"></div>
          </div>

          <div className="flex flex-col justify-center relative z-10 w-full max-w-3xl items-center text-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#f58220] font-bold text-base flex items-center before:content-['🌿'] before:mr-2">Newsletters</span>
            </div>
            <h2 className="text-[2rem] font-extrabold m-0 mb-6 text-white">Get Our Every Single Menu Notifications</h2>
            
            <div className="flex flex-wrap gap-6 mb-8 text-sm text-gray-200 justify-center">
              <span className="flex items-center gap-1.5"><ShieldCheck size={16} color="#f58220" /> Regular Updates</span>
              <span className="flex items-center gap-1.5"><ShieldCheck size={16} color="#f58220" /> Weekly Updates</span>
              <span className="flex items-center gap-1.5"><ShieldCheck size={16} color="#f58220" /> Monthly Updates</span>
            </div>
            
            <form className="w-full">
              <div className="flex border border-gray-200/20 rounded overflow-hidden shadow-lg">
                <input type="email" placeholder="Enter your email" required className="flex-1 p-4 border-none outline-none text-base bg-white text-[#333] placeholder-gray-500" />
                <button type="button" className="bg-[#f58220] text-white border-none px-8 font-semibold text-base cursor-pointer transition-colors hover:bg-[#e07217]">Subscribe &gt;</button>
              </div>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] gap-12 pb-16 items-start">
          {/* Column 1: Brand & Desc */}
          <div className="flex flex-col items-start">
            <Link className="inline-block" href={ROUTES.customer.home}>
              <img src="/logo.png" alt="Plate40" className="h-12 w-auto mb-4" />
            </Link>

            <p className="text-[#a3a3a3] text-[0.95rem] leading-relaxed mt-4">
              Plate40 is your go-to destination for delicious meals delivered straight to your door. Fresh, fast, and always satisfying.
            </p>

            <div className="flex gap-4 mt-4">
              <Link className="text-[#383838] bg-white w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-[#f58220] hover:text-white hover:-translate-y-[3px]" href="#"><Facebook size={20} /></Link>
              <Link className="text-[#383838] bg-white w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-[#f58220] hover:text-white hover:-translate-y-[3px]" href="#"><Instagram size={20} /></Link>
              <Link className="text-[#383838] bg-white w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-[#f58220] hover:text-white hover:-translate-y-[3px]" href="#"><Twitter size={20} /></Link>
              <Link className="text-[#383838] bg-white w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-[#f58220] hover:text-white hover:-translate-y-[3px]" href="#"><Linkedin size={20} /></Link>
            </div>
          </div>

          {/* Column 2: Our Menus / About Plate40 */}
          <div className="flex flex-col">
            <strong className="text-[1.2rem] font-bold text-white mb-6 relative inline-block pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-10 after:h-0.5 after:border-b-2 after:border-dashed after:border-[#f58220]">Our Menus</strong>
            <ul className="flex flex-col gap-3 m-0 p-0 list-none">
              <li><Link className="text-[#a3a3a3] no-underline text-[0.95rem] transition-colors flex items-center before:content-['→'] before:mr-2 before:text-xs before:text-[#666] before:transition-colors hover:text-[#f58220] hover:before:text-[#f58220]" href="#">Plate40 Pro</Link></li>
              <li><Link className="text-[#a3a3a3] no-underline text-[0.95rem] transition-colors flex items-center before:content-['→'] before:mr-2 before:text-xs before:text-[#666] before:transition-colors hover:text-[#f58220] hover:before:text-[#f58220]" href="#">Plate40 Daily</Link></li>
              <li><Link className="text-[#a3a3a3] no-underline text-[0.95rem] transition-colors flex items-center before:content-['→'] before:mr-2 before:text-xs before:text-[#666] before:transition-colors hover:text-[#f58220] hover:before:text-[#f58220]" href="#">Explore with Plate40</Link></li>
              <li><Link className="text-[#a3a3a3] no-underline text-[0.95rem] transition-colors flex items-center before:content-['→'] before:mr-2 before:text-xs before:text-[#666] before:transition-colors hover:text-[#f58220] hover:before:text-[#f58220]" href="#">Plate40 News</Link></li>
              <li><Link className="text-[#a3a3a3] no-underline text-[0.95rem] transition-colors flex items-center before:content-['→'] before:mr-2 before:text-xs before:text-[#666] before:transition-colors hover:text-[#f58220] hover:before:text-[#f58220]" href="#">Snackables</Link></li>
            </ul>
          </div>

          {/* Column 3: Useful Links */}
          <div className="flex flex-col">
            <strong className="text-[1.2rem] font-bold text-white mb-6 relative inline-block pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-10 after:h-0.5 after:border-b-2 after:border-dashed after:border-[#f58220]">Useful Links</strong>
            <ul className="flex flex-col gap-3 m-0 p-0 list-none">
              <li><Link className="text-[#a3a3a3] no-underline text-[0.95rem] transition-colors flex items-center before:content-['→'] before:mr-2 before:text-xs before:text-[#666] before:transition-colors hover:text-[#f58220] hover:before:text-[#f58220]" href="#">About Us</Link></li>
              <li><Link className="text-[#a3a3a3] no-underline text-[0.95rem] transition-colors flex items-center before:content-['→'] before:mr-2 before:text-xs before:text-[#666] before:transition-colors hover:text-[#f58220] hover:before:text-[#f58220]" href="#">Direct Support</Link></li>
              <li><Link className="text-[#a3a3a3] no-underline text-[0.95rem] transition-colors flex items-center before:content-['→'] before:mr-2 before:text-xs before:text-[#666] before:transition-colors hover:text-[#f58220] hover:before:text-[#f58220]" href="#">Help & Support</Link></li>
              <li><Link className="text-[#a3a3a3] no-underline text-[0.95rem] transition-colors flex items-center before:content-['→'] before:mr-2 before:text-xs before:text-[#666] before:transition-colors hover:text-[#f58220] hover:before:text-[#f58220]" href={ROUTES.customer.terms}>Terms & Conditions</Link></li>
              <li><Link className="text-[#a3a3a3] no-underline text-[0.95rem] transition-colors flex items-center before:content-['→'] before:mr-2 before:text-xs before:text-[#666] before:transition-colors hover:text-[#f58220] hover:before:text-[#f58220]" href={ROUTES.customer.privacy}>Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div className="flex flex-col">
            <strong className="text-[1.2rem] font-bold text-white mb-6 relative inline-block pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-10 after:h-0.5 after:border-b-2 after:border-dashed after:border-[#f58220]">Contact Us</strong>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <div className="bg-[rgba(245,130,32,0.1)] p-1.5 rounded-full flex"><ShieldCheck size={20} color="#f58220" /></div>
                <div>
                  <span className="text-[#a3a3a3] text-sm leading-relaxed">+91 (0) 9876 543 210</span><br />
                  <span className="text-[#a3a3a3] text-sm leading-relaxed">+91 (0) 1234 567 890</span>
                </div>
              </div>
              <div className="flex items-start gap-4 mt-4">
                <div className="bg-[rgba(245,130,32,0.1)] p-1.5 rounded-full flex"><ShieldCheck size={20} color="#f58220" /></div>
                <div>
                  <span className="text-[#a3a3a3] text-sm leading-relaxed">www.plate40.com</span><br />
                  <span className="text-[#a3a3a3] text-sm leading-relaxed">info@plate40.com</span>
                </div>
              </div>
              <div className="flex items-start gap-4 mt-4">
                <div className="bg-[rgba(245,130,32,0.1)] p-1.5 rounded-full flex"><Building2 size={20} color="#f58220" /></div>
                <div>
                  <span className="text-[#a3a3a3] text-sm leading-relaxed">Mohali, Punjab, India</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#2d2d2d] py-6 mt-8">
        <div className="p40-container text-center">
          <span className="text-[#a3a3a3] text-sm">©2026. All rights reserved by Plate40 Limited</span>
        </div>
      </div>
    </footer>
  );
}
