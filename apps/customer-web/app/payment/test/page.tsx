import Link from 'next/link';
import { BadgeIndianRupee, CheckCircle2, ShieldCheck } from 'lucide-react';
import { ROUTES } from '@plate40/config';
import { Card, Price } from '@plate40/ui';

type TestPaymentPageProps = {
  searchParams: Promise<{
    orderId?: string | string[];
    amount?: string | string[];
    returnUrl?: string | string[];
  }>;
};

const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const safeReturnUrl = (value: string | undefined, orderId: string | undefined) => {
  if (value) {
    try {
      const url = new URL(value);
      if (url.hostname === 'localhost' && url.protocol === 'http:') {
        return `${url.pathname}${url.search}${url.hash}`;
      }
    } catch {
      // Ignore invalid or external return URLs in this local-only payment simulator.
    }
  }

  return orderId ? `${ROUTES.customer.orders}/${encodeURIComponent(orderId)}` : ROUTES.customer.orders;
};

export default async function TestPaymentPage({ searchParams }: TestPaymentPageProps) {
  const query = await searchParams;
  const orderId = firstValue(query.orderId);
  const amount = firstValue(query.amount) ?? '0';
  const returnUrl = safeReturnUrl(firstValue(query.returnUrl), orderId);

  return (
    <main className="test-payment-page p40-container">
      <Card className="test-payment-card">
        <span className="test-payment-icon"><BadgeIndianRupee /></span>
        <span className="section-kicker">Plate40 payment sandbox</span>
        <h1>Test payment</h1>
        <p>This local page replaces Razorpay during development. It does not collect card details or mark an order as paid.</p>
        <div className="test-payment-details">
          <div><span>Order</span><strong>{orderId ? `#${orderId}` : 'Preview'}</strong></div>
          <div><span>Amount</span><Price value={amount} /></div>
          <div><span>Environment</span><strong>Testing only</strong></div>
        </div>
        <div className="test-payment-notice"><ShieldCheck size={18} /><span>Production payment confirmation must come from a verified backend webhook.</span></div>
        <Link className="p40-button p40-button--primary" href={returnUrl}><CheckCircle2 size={18} />Finish test and return</Link>
        <Link className="test-payment-cancel" href={returnUrl}>Cancel and return to order</Link>
      </Card>
    </main>
  );
}
