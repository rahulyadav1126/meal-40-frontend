'use client';

import Link from 'next/link';
import {
  HelpCircle,
  PhoneCall,
  MessageCircle,
  FileText,
  ShoppingBag,
  MapPin,
  CreditCard,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import { ROUTES } from '@plate40/config';
import { PageHeader } from '@plate40/ui';

const faqs = [
  {
    question: 'How do I place an order?',
    answer:
      'Browse restaurants on our home page, select your favourite dishes, add them to your cart, and proceed to checkout. Choose your delivery address and payment method to confirm.',
  },
  {
    question: 'Can I change or cancel my order?',
    answer:
      'Orders can be cancelled within 2 minutes of placing them. Once the restaurant confirms and starts preparing, cancellations may not be possible. Contact support for urgent cases.',
  },
  {
    question: 'How do I track my delivery?',
    answer:
      'Go to "Orders" in the navigation bar. Click on your active order to see real-time status updates from the restaurant and your delivery agent.',
  },
  {
    question: 'What payment methods are accepted?',
    answer:
      'We currently support Cash on Delivery. Online payment options (UPI, cards, wallets) are coming soon.',
  },
  {
    question: 'How do I report an issue with my order?',
    answer:
      "Go to your Orders page, open the specific order, and use the 'Report Issue' option. Our support team will respond within 24 hours.",
  },
  {
    question: 'How do I update my delivery address?',
    answer:
      'Visit your Profile > Manage Addresses to add, edit, or delete saved addresses. You can also add a new address during checkout.',
  },
];

const quickLinks = [
  { icon: ShoppingBag, label: 'My Orders', href: ROUTES.customer.orders },
  { icon: MapPin, label: 'Manage Addresses', href: ROUTES.customer.addresses },
  { icon: CreditCard, label: 'Offers & Savings', href: ROUTES.customer.offers },
  { icon: RotateCcw, label: 'Restaurants', href: ROUTES.customer.restaurants },
];

export default function HelpPage() {
  return (
    <main className="p40-container py-8 pb-16 min-h-[70vh]">
      <PageHeader
        title="Help & Support"
        description="Find quick answers or get in touch with our support team."
      />

      {/* Quick Links */}
      <section className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-10">
        {quickLinks.map(({ icon: Icon, label, href }) => (
          <Link key={label} href={href} className="flex items-center gap-3 py-3 px-4 md:px-5 bg-white border-[1.5px] border-p40-border rounded-[14px] text-[0.92rem] font-semibold text-[#3d4152] transition-[border-color,box-shadow,transform] duration-200 hover:border-[#fc8019] hover:shadow-[0_4px_16px_rgba(252,128,25,0.12)] hover:-translate-y-0.5 hover:text-[#fc8019] no-underline">
            <span className="w-10 h-10 grid place-items-center rounded-[10px] bg-[#fff3ea] text-[#fc8019] flex-none">
              <Icon size={22} />
            </span>
            <span>{label}</span>
            <ChevronRight size={16} className="ml-auto text-slate-400 flex-none" />
          </Link>
        ))}
      </section>

      {/* FAQs */}
      <section className="mb-10">
        <h2 className="flex items-center gap-2.5 text-[1.2rem] font-[800] text-[#3d4152] mb-5 mt-0">
          <HelpCircle size={20} />
          Frequently Asked Questions
        </h2>
        <div className="grid gap-3">
          {faqs.map((faq) => (
            <details key={faq.question} className="group bg-white border-[1.5px] border-p40-border rounded-xl overflow-hidden transition-colors duration-200 open:border-[#fc8019]">
              <summary className="p-4 md:px-5 font-semibold text-[0.95rem] text-[#3d4152] cursor-pointer flex justify-between items-center gap-4 list-none [&::-webkit-details-marker]:hidden after:content-['+'] after:text-[1.3rem] after:text-[#fc8019] after:flex-none after:transition-transform after:duration-200 group-open:after:content-['−']">{faq.question}</summary>
              <p className="px-4 md:px-5 pb-4 text-[#686b78] text-[0.9rem] leading-[1.6] m-0">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="mb-10">
        <h2 className="flex items-center gap-2.5 text-[1.2rem] font-[800] text-[#3d4152] mb-5 mt-0">
          <MessageCircle size={20} />
          Still need help?
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          <div className="flex items-start gap-4 p-5 bg-white border-[1.5px] border-p40-border rounded-[14px]">
            <span className="w-[46px] h-[46px] grid place-items-center rounded-xl bg-[#fff3ea] text-[#fc8019] flex-none">
              <PhoneCall size={24} />
            </span>
            <div>
              <strong className="block text-[0.95rem] text-[#3d4152] mb-1">Call Us</strong>
              <p className="text-[0.8rem] text-slate-400 m-0 mb-1.5">Available Mon–Sat, 9 AM – 9 PM</p>
              <a href="tel:+911800000040" className="text-[0.85rem] font-bold text-[#fc8019] no-underline hover:underline">
                1800-000-0040 (Toll-free)
              </a>
            </div>
          </div>
          <div className="flex items-start gap-4 p-5 bg-white border-[1.5px] border-p40-border rounded-[14px]">
            <span className="w-[46px] h-[46px] grid place-items-center rounded-xl bg-[#fff3ea] text-[#fc8019] flex-none">
              <MessageCircle size={24} />
            </span>
            <div>
              <strong className="block text-[0.95rem] text-[#3d4152] mb-1">Chat with Us</strong>
              <p className="text-[0.8rem] text-slate-400 m-0 mb-1.5">Get instant answers from our team</p>
              <span className="text-[0.85rem] font-bold text-[#fc8019] no-underline hover:underline">Chat coming soon</span>
            </div>
          </div>
          <div className="flex items-start gap-4 p-5 bg-white border-[1.5px] border-p40-border rounded-[14px]">
            <span className="w-[46px] h-[46px] grid place-items-center rounded-xl bg-[#fff3ea] text-[#fc8019] flex-none">
              <FileText size={24} />
            </span>
            <div>
              <strong className="block text-[0.95rem] text-[#3d4152] mb-1">Email Support</strong>
              <p className="text-[0.8rem] text-slate-400 m-0 mb-1.5">We reply within 24 hours</p>
              <a href="mailto:support@plate40.com" className="text-[0.85rem] font-bold text-[#fc8019] no-underline hover:underline">
                support@plate40.com
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
