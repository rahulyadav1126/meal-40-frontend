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
    <main className="page-shell p40-container">
      <PageHeader
        title="Help & Support"
        description="Find quick answers or get in touch with our support team."
      />

      {/* Quick Links */}
      <section className="help-quick-links">
        {quickLinks.map(({ icon: Icon, label, href }) => (
          <Link key={label} href={href} className="help-quick-card">
            <span className="help-quick-icon">
              <Icon size={22} />
            </span>
            <span>{label}</span>
            <ChevronRight size={16} className="help-quick-arrow" />
          </Link>
        ))}
      </section>

      {/* FAQs */}
      <section className="help-section">
        <h2 className="help-section-title">
          <HelpCircle size={20} />
          Frequently Asked Questions
        </h2>
        <div className="help-faq-list">
          {faqs.map((faq) => (
            <details key={faq.question} className="help-faq-item">
              <summary className="help-faq-question">{faq.question}</summary>
              <p className="help-faq-answer">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="help-section">
        <h2 className="help-section-title">
          <MessageCircle size={20} />
          Still need help?
        </h2>
        <div className="help-contact-grid">
          <div className="help-contact-card">
            <span className="help-contact-icon">
              <PhoneCall size={24} />
            </span>
            <div>
              <strong>Call Us</strong>
              <p>Available Mon–Sat, 9 AM – 9 PM</p>
              <a href="tel:+911800000040" className="help-contact-link">
                1800-000-0040 (Toll-free)
              </a>
            </div>
          </div>
          <div className="help-contact-card">
            <span className="help-contact-icon">
              <MessageCircle size={24} />
            </span>
            <div>
              <strong>Chat with Us</strong>
              <p>Get instant answers from our team</p>
              <span className="help-contact-link">Chat coming soon</span>
            </div>
          </div>
          <div className="help-contact-card">
            <span className="help-contact-icon">
              <FileText size={24} />
            </span>
            <div>
              <strong>Email Support</strong>
              <p>We reply within 24 hours</p>
              <a href="mailto:support@plate40.com" className="help-contact-link">
                support@plate40.com
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
