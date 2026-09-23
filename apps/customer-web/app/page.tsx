'use client';

import Link from 'next/link';
import { ArrowRight, BadgeIndianRupee, Bike, ShieldCheck, Building2, Home, Thermometer, ClipboardCheck, Waypoints, Compass } from 'lucide-react';
import { ROUTES } from '@plate40/config';
import { useRestaurantsQuery } from '@plate40/state';
import { Button, Card, ErrorState, Skeleton } from '@plate40/ui';
import { RestaurantCard } from '../components/restaurant-card';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const BENEFITS = [
  { title: 'Pocket-friendly ₹40 meals', detail: 'Everyday food without the everyday budget stress.', icon: BadgeIndianRupee },
  { title: 'Fast 10-minute delivery', detail: 'Hyperlocal kitchens keep every route short.', icon: Bike },
  { title: 'Verified neighborhood kitchens', detail: 'Quality and hygiene checks before kitchens go live.', icon: ShieldCheck },
] as const;

export default function HomePage() {
  const { data, isLoading, isError } = useRestaurantsQuery({ page: 1, limit: 4 });
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!mainRef.current) return;
    const ctx = gsap.context(() => {
      // Existing hero animations
      gsap.fromTo('.hero-parallax-bg', 
        { yPercent: -10 },
        {
          yPercent: 10,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero-section',
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          }
        }
      );
      
      gsap.fromTo('.hero-parallax-text',
        { y: 0 },
        {
          y: -60,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero-section',
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          }
        }
      );

      // Promise cards animation
      gsap.fromTo('.promise-card',
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.25,
          delay: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.promise-section',
            start: 'top 65%',
            toggleActions: 'play none none reverse',
          }
        }
      );

      // Section Title animation
      gsap.fromTo('.promise-title',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.promise-section',
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    }, mainRef);
    return () => ctx.revert();
  }, []);

  return (
    <main ref={mainRef}>
      <section className="relative bg-[#ebe3d3] pt-[calc(5rem+81px)] pb-20 -mt-[81px] min-h-[max(550px,calc(100vh-80px))] rounded-b-[24px] overflow-hidden hero-section">
        {/* Parallax Background */}
        <div className="absolute inset-0 w-full h-[120%] -top-[10%] hero-parallax-bg z-0 pointer-events-none will-change-transform">
          <img src="/hero-bg.jpg" alt="Hero Background" className="w-full h-full object-cover object-right" />
        </div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ebe3d3_0%,#ebe3d3_35%,transparent_75%)] z-10 pointer-events-none"></div>
        
        <div className="p40-container flex items-center relative z-20">
          <div className="w-full md:max-w-[60%] lg:max-w-[50%] hero-parallax-text will-change-transform pr-4">
            <h1 className="font-serif text-[clamp(2.35rem,5vw,4.8rem)] font-bold text-slate-800 leading-[1.02] my-4 max-w-[600px]">
              Tasty meals starting <br /> at <em className="text-p40-primary not-italic underline underline-offset-[7px]">₹40</em>
            </h1>
            <p className="text-slate-600 leading-[1.7] max-w-[650px]">
              Wholesome homestyle North and South Indian meals, thalis, and quick snacks cooked fresh daily and delivered hot.
            </p>
            <div className="flex gap-3 my-6">
              <Link href={ROUTES.customer.restaurants}>
                <Button className="transition-all duration-300 border-[1.5px] border-transparent bg-[#df5c4e] text-white rounded-xl shadow-[0_6px_20px_-4px_rgba(223,92,78,0.6)] font-semibold px-5 py-2 hover:bg-transparent hover:text-green-800 hover:border-green-800 hover:shadow-[0_6px_25px_-2px_rgba(223,92,78,0.6)]">
                  Order now <ArrowRight size={17} />
                </Button>
              </Link>
              <Link href={ROUTES.customer.offers}>
                <Button variant="secondary" className="transition-all duration-300 border-[1.5px] border-green-800 bg-transparent text-green-800 rounded-xl font-semibold px-5 py-2 hover:bg-transparent hover:text-green-800 hover:border-green-800 hover:shadow-[0_6px_25px_-2px_rgba(223,92,78,0.6)]">
                  Explore ₹40 thalis
                </Button>
              </Link>
            </div>
            <div className="flex gap-5 text-xs font-bold">
              <span>50k+ daily orders</span>
              <span>4.6/5 food rating</span>
              <span>25 min avg dispatch</span>
            </div>
          </div>
          <div className="hidden" aria-label="Plate40 meal selection">
            <div className="row-span-2 min-h-[342px] bg-[linear-gradient(0deg,rgba(15,23,42,0.85),transparent),linear-gradient(135deg,#f59e0b,#be123c)] rounded-2xl p-4 flex flex-col justify-end text-white shadow-p40-2">
              <strong className="font-[800] text-[1.1rem] font-heading">Rajma rice bowl</strong>
              <span className="text-[0.78rem] opacity-85">Pure comfort, from ₹40</span>
            </div>
            <div className="min-h-[165px] rounded-2xl p-4 flex flex-col justify-end text-white bg-[linear-gradient(0deg,rgba(15,23,42,0.8),rgba(225,29,72,0.2)),linear-gradient(135deg,#f97316,#e11d48)] shadow-p40-2">
              <strong className="font-[800] text-[1.1rem] font-heading">Executive veg thali</strong>
              <span className="text-[0.78rem] opacity-85">Balanced and filling</span>
            </div>
            <div className="min-h-[165px] rounded-2xl p-4 flex flex-col justify-end text-white bg-[linear-gradient(0deg,rgba(15,23,42,0.8),rgba(225,29,72,0.2)),linear-gradient(135deg,#f97316,#e11d48)] shadow-p40-2">
              <strong className="font-[800] text-[1.1rem] font-heading">Paneer deluxe</strong>
              <span className="text-[0.78rem] opacity-85">A weekend favourite</span>
            </div>
          </div>
        </div>
      </section>
      <section className="p40-container grid grid-cols-1 md:grid-cols-3 gap-4 -mt-[60px] relative z-10 pb-0">
        {BENEFITS.map(({ title, detail, icon: Icon }) => (
          <Card className="p-6 flex gap-4 items-start bg-[#fcfaf6] border border-[#ebdcc4] rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] transition-[transform,box-shadow] duration-200 hover:-translate-y-[5px] hover:shadow-[0_10px_20px_-5px_rgba(0,0,0,0.1)]" key={title}>
            <span className="bg-rose-100 text-p40-primary rounded-xl p-3">
              <Icon size={21} />
            </span>
            <div>
              <strong className="text-[1.05rem]">{title}</strong>
              <p className="m-0 mt-1.5 text-p40-muted text-[0.9rem] leading-[1.5]">{detail}</p>
            </div>
          </Card>
        ))}
      </section>
      <section className="p40-container py-8 pb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
          <div>
            <span className="text-p40-primary text-[0.72rem] font-[800] tracking-[0.08em] uppercase">Hyperlocal kitchens</span>
            <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] my-1.5">Popular near you</h2>
            <p className="m-0 text-p40-muted">Top-rated neighborhood kitchens serving fresh, budget-friendly meals.</p>
          </div>
          <Link href={ROUTES.customer.restaurants} className="text-p40-primary inline-flex gap-1.5 items-center font-bold text-[0.85rem] shrink-0">
            View all restaurants <ArrowRight size={16} />
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} />
            ))}
          </div>
        ) : isError ? (
          <ErrorState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data?.items.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </section>
      <section className="relative py-24 text-center bg-[#fdfaf5] promise-section overflow-hidden border-t border-slate-100">
        {/* Subtle Background Watermarks */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden flex items-center justify-center">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
             <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
               <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#1f2937" strokeWidth="0.5"/>
             </pattern>
             <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="p40-container relative z-10">
          <span className="promise-title text-[#db9c4b] text-[0.7rem] font-[850] tracking-[0.1em] uppercase block">
            The Plate40 promise
          </span>
          <h2 className="promise-title text-[clamp(1.8rem,3vw,2.4rem)] mt-2 mb-10 font-bold text-[#1f2937] flex flex-col items-center">
            Why choose Plate40?
            <span className="w-10 h-1 bg-[#dcb17a] rounded-full mt-4 block"></span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 mt-20 text-center px-4 md:px-0">
            
            {/* Card 1 */}
            <div className="promise-card">
              <div className="relative h-full bg-white rounded-2xl p-8 pt-16 transition-all duration-300 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.06)] border border-slate-100 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(219,156,75,0.2)] hover:border-[#db9c4b]/30">
              
              {/* Icon 1: Wallet & Coins */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(219,156,75,0.2)_0%,transparent_60%)]" />
                <svg viewBox="0 0 100 100" className="relative z-10 w-24 h-24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Sparkles */}
                  <circle cx="15" cy="45" r="2" fill="#dcb17a" />
                  <path d="M25 25 L30 30 M30 25 L25 30" stroke="#dcb17a" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="85" cy="35" r="1.5" fill="#dcb17a" />
                  {/* Coins */}
                  <circle cx="45" cy="35" r="12" fill="#f8fafc" stroke="#1f2937" strokeWidth="2.5" />
                  <circle cx="45" cy="35" r="7" fill="none" stroke="#1f2937" strokeWidth="1.5" />
                  <circle cx="58" cy="22" r="9" fill="#f8fafc" stroke="#1f2937" strokeWidth="2.5" />
                  <circle cx="58" cy="22" r="4" fill="none" stroke="#1f2937" strokeWidth="1.5" />
                  {/* Main Gold Coin */}
                  <circle cx="65" cy="45" r="14" fill="#dcb17a" stroke="#1f2937" strokeWidth="2.5" />
                  <circle cx="65" cy="45" r="8" fill="none" stroke="#1f2937" strokeWidth="1.5" />
                  {/* Wallet */}
                  <rect x="25" y="45" width="50" height="34" rx="4" fill="#fff" stroke="#1f2937" strokeWidth="2.5" />
                  <path d="M25 55 h 50" stroke="#1f2937" strokeWidth="2" strokeDasharray="3 3" />
                  {/* Clasp */}
                  <rect x="65" y="55" width="12" height="14" rx="3" fill="#fff" stroke="#1f2937" strokeWidth="2.5" />
                  <circle cx="71" cy="62" r="2.5" fill="#dcb17a" />
                </svg>
              </div>
              
              <h3 className="text-[#1f2937] font-bold mb-3 mt-4 text-[1.1rem]">Zero surge and transparent pricing</h3>
              <p className="text-[#64748b] leading-[1.6] m-0 text-[0.92rem]">Meals stay affordable across college, office, and residential neighborhoods.</p>
              
              {/* Watermarks */}
              <Building2 className="absolute bottom-3 left-3 text-[#db9c4b] opacity-15" size={48} strokeWidth={1} />
              <Home className="absolute bottom-3 right-3 text-[#db9c4b] opacity-15" size={40} strokeWidth={1} />
              </div>
            </div>

            {/* Card 2 */}
            <div className="promise-card">
              <div className="relative h-full bg-white rounded-2xl p-8 pt-16 transition-all duration-300 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.06)] border border-slate-100 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(219,156,75,0.2)] hover:border-[#db9c4b]/30">
              
              {/* Icon 2: Shield & Chef Hat */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(219,156,75,0.2)_0%,transparent_60%)]" />
                <svg viewBox="0 0 100 100" className="relative z-10 w-24 h-24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="15" cy="55" r="1.5" fill="#dcb17a" />
                  <circle cx="80" cy="30" r="2" fill="#dcb17a" />
                  {/* Shield */}
                  <path d="M25 25 h 50 v 25 c 0 15 -25 30 -25 30 s -25 -15 -25 -30 v -25 Z" fill="#fff" stroke="#1f2937" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M32 32 h 36 v 18 c 0 11 -18 22 -18 22 s -18 -11 -18 -22 v -18 Z" fill="none" stroke="#dcb17a" strokeWidth="1.5" strokeLinejoin="round" />
                  {/* Chef Hat */}
                  <path d="M40 55 h 20 v 5 c 0 3 -2 5 -5 5 h -10 c -3 0 -5 -2 -5 -5 v -5 Z" fill="#fff" stroke="#1f2937" strokeWidth="2.5" />
                  <path d="M38 55 c -5 0 -8 -5 -5 -10 c -2 -5 3 -8 7 -7 c 3 -6 11 -6 14 0 c 4 -1 9 2 7 7 c 3 5 0 10 -5 10" fill="#fff" stroke="#1f2937" strokeWidth="2.5" strokeLinejoin="round" />
                  {/* Check Badge */}
                  <circle cx="72" cy="72" r="14" fill="#dcb17a" />
                  <circle cx="72" cy="72" r="14" fill="none" stroke="#fff" strokeWidth="2.5" />
                  <path d="M66 72 l 4 4 l 8 -8" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <h3 className="text-[#1f2937] font-bold mb-3 mt-4 text-[1.1rem]">Strict kitchen verification</h3>
              <p className="text-[#64748b] leading-[1.6] m-0 text-[0.92rem]">Every kitchen is reviewed for safety, hygiene, and responsible preparation.</p>
              
              {/* Watermarks */}
              <Thermometer className="absolute bottom-3 left-3 text-[#db9c4b] opacity-15" size={40} strokeWidth={1} />
              <ClipboardCheck className="absolute bottom-3 right-3 text-[#db9c4b] opacity-15" size={40} strokeWidth={1} />
              </div>
            </div>

            {/* Card 3 */}
            <div className="promise-card">
              <div className="relative h-full bg-white rounded-2xl p-8 pt-16 transition-all duration-300 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.06)] border border-slate-100 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(219,156,75,0.2)] hover:border-[#db9c4b]/30">
              
              {/* Icon 3: Scooter & Delivery */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-40 h-32 flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(219,156,75,0.2)_0%,transparent_60%)]" />
                <svg viewBox="0 0 130 100" className="relative z-10 w-32 h-24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Wind lines */}
                  <path d="M10 50 h 15 M 15 65 h 20 M 20 35 h 10" stroke="#dcb17a" strokeWidth="2" strokeLinecap="round" />
                  {/* Box */}
                  <rect x="25" y="35" width="20" height="15" fill="#fff" stroke="#1f2937" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M25 42 h 20" stroke="#1f2937" strokeWidth="2" />
                  {/* Scooter wheels */}
                  <circle cx="40" cy="65" r="8" fill="#fff" stroke="#1f2937" strokeWidth="2.5" />
                  <circle cx="40" cy="65" r="3" fill="#dcb17a" />
                  <circle cx="85" cy="65" r="8" fill="#fff" stroke="#1f2937" strokeWidth="2.5" />
                  <circle cx="85" cy="65" r="3" fill="#dcb17a" />
                  {/* Scooter body */}
                  <path d="M30 65 a 8 8 0 0 1 -5 -5 v -10 h 22 l 5 15" fill="#f8fafc" stroke="#1f2937" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M52 65 h 25 l 10 -25 h -12" fill="none" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Handlebar */}
                  <path d="M72 45 l -6 -15 h 8" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Food Cloche */}
                  <path d="M98 62 h 26 M 100 62 a 11 11 0 0 1 22 0" fill="#dcb17a" stroke="#1f2937" strokeWidth="2" />
                  <circle cx="111" cy="51" r="2.5" fill="#1f2937" />
                  {/* Steam */}
                  <path d="M105 45 s 2 -5 -2 -5 M 111 43 s 2 -5 -2 -5 M 117 45 s 2 -5 -2 -5" stroke="#dcb17a" strokeWidth="1.5" strokeLinecap="round" />
                  {/* Location Pin */}
                  <path d="M80 20 c 0 -7 14 -7 14 0 c 0 5 -7 13 -7 13 s -7 -8 -7 -13 Z" fill="#dcb17a" stroke="#1f2937" strokeWidth="2" strokeLinejoin="round" />
                  <circle cx="87" cy="18" r="3" fill="#fff" />
                </svg>
              </div>

              <h3 className="text-[#1f2937] font-bold mb-3 mt-4 text-[1.1rem]">Precision local delivery</h3>
              <p className="text-[#64748b] leading-[1.6] m-0 text-[0.92rem]">Shorter routes help meals arrive warm, with live order progress.</p>
              
              {/* LIVE Badge */}
              <div className="absolute bottom-4 right-4 flex flex-col items-end">
                <span className="text-[#db9c4b] text-[0.65rem] font-[850] uppercase tracking-wider mb-1">Live</span>
                <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                   <div className="w-2/3 h-full bg-[#db9c4b] rounded-full"></div>
                </div>
              </div>

              {/* Watermarks */}
              <Waypoints className="absolute bottom-3 left-3 text-[#db9c4b] opacity-15" size={44} strokeWidth={1} />
              <Compass className="absolute bottom-10 right-4 text-[#db9c4b] opacity-10" size={32} strokeWidth={1} />
              </div>
            </div>

          </div>
        </div>
      </section>
      <section className="p40-container mt-16 p-6 md:p-9 bg-[#273249] text-white rounded-[18px] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8 shadow-p40-3 transition-[transform,box-shadow] duration-200 hover:-translate-y-[5px] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
        <div>
          <span className="text-rose-300 text-[0.72rem] font-[800] tracking-[0.08em] uppercase">Live order experience</span>
          <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] my-1.5">Order in three taps and track every stage</h2>
          <p className="text-slate-300 text-sm md:text-base">See the kitchen accept, prepare, dispatch, and complete your order in real time.</p>
        </div>
        <Link href={ROUTES.customer.orders} className="w-full md:w-auto shrink-0">
          <Button className="w-full md:w-auto">
            Track an order <ArrowRight size={17} />
          </Button>
        </Link>
      </section>
    </main>
  );
}
