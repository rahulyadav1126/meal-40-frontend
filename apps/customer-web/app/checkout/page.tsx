'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, ShieldCheck, WalletCards } from 'lucide-react';
import { toast } from 'sonner';
import {
  useAddressesQuery,
  useAppDispatch,
  useAppSelector,
  useCartsQuery,
  useCreateOrderMutation,
  useQuoteOrderQuery,
  useRestaurantOffersQuery,
  setCheckoutAddress,
  setPaymentMethod,
} from '@plate40/state';
import { PaymentMethod } from '@plate40/types';
import { Button, Card, EmptyState, ErrorState, PageHeader, Price, Skeleton } from '@plate40/ui';

export default function CheckoutPage() {
  const router = useRouter();
  const [selectedCartId, setSelectedCartId] = useState<string | null>(null);
  useEffect(() => { setSelectedCartId(new URLSearchParams(window.location.search).get('cartId')); }, []);
  const dispatch = useAppDispatch();
  const checkout = useAppSelector((state) => state.client.checkout);
  const carts = useCartsQuery();
  const addresses = useAddressesQuery();
  const [createOrder, state] = useCreateOrderMutation();
  const [couponDraft, setCouponDraft] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const cart = selectedCartId ? carts.data?.find(item => String(item.id) === selectedCartId) : carts.data?.[0];
  const offers = useRestaurantOffersQuery(cart?.restaurantId ?? 0, { skip: !cart, pollingInterval: 60000 });
  const quote = useQuoteOrderQuery({ cartId: Number(cart?.id ?? 0), addressId: Number(checkout.addressId ?? 0), paymentMethod: PaymentMethod.COD, couponCode: couponCode || undefined }, { skip: !cart || !checkout.addressId, pollingInterval: 30000, refetchOnFocus: true });
  const totals = quote.currentData;
  const attempt = useRef<{ fingerprint: string; key: string } | null>(null);
  useEffect(() => { dispatch(setPaymentMethod(PaymentMethod.COD)); }, [dispatch]);
  useEffect(() => {
    const preferred = addresses.data?.find((address) => address.isDefault) ?? addresses.data?.[0];
    if (preferred && !addresses.data?.some(address => Number(address.id) === Number(checkout.addressId))) dispatch(setCheckoutAddress(preferred.id));
  }, [addresses.data, checkout.addressId, dispatch]);
  if (carts.isLoading || addresses.isLoading)
    return (
      <main className="p40-container py-8 pb-16 min-h-[70vh]">
        <Skeleton />
      </main>
    );
  if (carts.isError || addresses.isError)
    return (
      <main className="p40-container py-8 pb-16 min-h-[70vh]">
        <ErrorState message="Sign in to continue checkout." />
      </main>
    );
  if (!cart)
    return (
      <main className="p40-container py-8 pb-16 min-h-[70vh]">
        <EmptyState
          title="No cart to checkout"
          description="Add a meal before starting checkout."
        />
      </main>
    );
  if (!addresses.data?.length)
    return (
      <main className="p40-container py-8 pb-16 min-h-[70vh]">
        <PageHeader title="Checkout" />
        <EmptyState
          title="Add a delivery address"
          description="Plate40 needs an address inside the restaurant delivery radius before placing the order."
          action={
            <a className="p40-button p40-button--primary" href="/profile/addresses">
              Add address
            </a>
          }
        />
      </main>
    );
  async function placeOrder() {
    if (!checkout.addressId || !totals || quote.isFetching || quote.isError) return;
    const cartId = Number(cart!.id);
    const addressId = Number(checkout.addressId);
    if (!Number.isInteger(cartId) || cartId < 1 || !Number.isInteger(addressId) || addressId < 1) {
      toast.error('Your cart or delivery address is invalid. Please refresh and try again.');
      return;
    }
    try {
      const fingerprint = JSON.stringify([cartId, addressId, PaymentMethod.COD, checkout.customerNote, couponCode, totals.totalAmount, totals.items]);
      if (attempt.current?.fingerprint !== fingerprint) {
        let saved: { fingerprint: string; key: string } | null = null;
        try { saved = JSON.parse(sessionStorage.getItem('plate40.checkout-attempt') ?? 'null'); } catch { /* Optional storage. */ }
        attempt.current = saved?.fingerprint === fingerprint ? saved : { fingerprint, key: crypto.randomUUID() };
        try { sessionStorage.setItem('plate40.checkout-attempt', JSON.stringify(attempt.current)); } catch { /* Retry key remains in memory. */ }
      }
      const order = await createOrder({
        requestKey: attempt.current.key,
        cartId,
        addressId,
        paymentMethod: PaymentMethod.COD,
        couponCode: couponCode || undefined,
        quoteToken: totals.quoteToken,
        customerNote: checkout.customerNote || undefined,
      }).unwrap();
      toast.success('Order placed successfully');
      router.push(`/orders/${order.id}`);
    } catch (error) {
      const message =
        typeof error === 'object' && error && 'data' in error
          ? (error as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(message ?? 'Order could not be placed.');
      void quote.refetch();
    }
  }
  return (
    <main className="p40-container py-8 pb-16 min-h-[70vh]">
      <PageHeader
        title="Checkout & delivery"
        description="Confirm your address and payment preference."
      />
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
        <section className="grid gap-3.5">
          <Card className="p-5">
            <div className="flex items-start gap-3 mb-4">
              <MapPin className="text-p40-primary p-2 box-content bg-rose-100 rounded-[9px]" />
              <div>
                <span className="text-p40-primary text-[0.72rem] font-[800] tracking-[0.08em] uppercase">Delivery address</span>
                <h2 className="my-1">Where should we deliver?</h2>
              </div>
            </div>
            <div className="grid gap-2.5">
              {addresses.data.map((address) => (
                <label
                  className={`border rounded-[10px] p-3.5 flex items-center gap-3 cursor-pointer ${
                    checkout.addressId === address.id
                      ? 'border-p40-primary bg-rose-50 shadow-[0_0_0_2px_rgba(225,29,72,0.08)]'
                      : 'border-p40-border'
                  }`}
                  key={address.id}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={checkout.addressId === address.id}
                    onChange={() => dispatch(setCheckoutAddress(address.id))}
                  />
                  <div>
                    <strong>{address.label}</strong>
                    <p className="text-p40-muted mt-1 mb-0">
                      {address.addressLine1}, {address.city}, {address.postalCode}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </Card>
          <Card className="p-5"><h2>Restaurant offers</h2><p className="text-sm text-slate-500">One code per order. Minimum spend is based on food prices after dish discounts.</p><div className="flex flex-wrap gap-2"><input aria-label="Offer code" className="p40-input flex-1" maxLength={50} value={couponDraft} onChange={e => setCouponDraft(e.target.value.toUpperCase())} placeholder="Enter offer code" /><Button variant="secondary" disabled={state.isLoading} onClick={() => setCouponCode(couponDraft.trim())}>Apply</Button>{couponCode && <Button variant="secondary" onClick={() => { setCouponCode(''); setCouponDraft(''); }}>Remove</Button>}</div>{offers.isError && <p className="text-sm">Offer list unavailable. You can still enter a code.</p>}<div className="grid gap-3 mt-4">{offers.data?.map(offer => <button type="button" key={offer.id} className="text-left p-3 border border-orange-200 rounded-xl bg-orange-50" onClick={() => { setCouponDraft(offer.code); setCouponCode(offer.code); }}><strong>{offer.code} · {offer.discountType === 'PERCENTAGE' ? `${offer.discountValue}% off` : `₹${offer.discountValue} off`}</strong><small className="block mt-1">Minimum ₹{offer.minimumOrderAmount}{offer.maximumDiscount ? ` · Save up to ₹${offer.maximumDiscount}` : ''}{offer.menuItemIds?.length ? ' · Selected dishes only' : ''}{!offer.stackWithDishDiscount ? ' · Excludes dishes already on sale' : ''}</small><small className="block">{offer.description} · {offer.perUserUsageLimit} use(s) per customer</small></button>)}</div></Card>
          <Card className="p-5">
            <div className="flex items-start gap-3 mb-4">
              <WalletCards className="text-p40-primary p-2 box-content bg-rose-100 rounded-[9px]" />
              <div>
                <span className="text-p40-primary text-[0.72rem] font-[800] tracking-[0.08em] uppercase">Payment</span>
                <h2 className="my-1">Select payment method</h2>
              </div>
            </div>
            <p className="text-p40-muted">Online payments are unavailable during this rollout.</p>
            <label
              className={`border rounded-[10px] p-3.5 flex items-center gap-3 cursor-pointer mt-2.5 ${
                checkout.paymentMethod === PaymentMethod.COD
                  ? 'border-p40-primary bg-rose-50 shadow-[0_0_0_2px_rgba(225,29,72,0.08)]'
                  : 'border-p40-border'
              }`}
            >
              <input
                type="radio"
                checked={checkout.paymentMethod === PaymentMethod.COD}
                onChange={() => dispatch(setPaymentMethod(PaymentMethod.COD))}
              />
              <WalletCards />
              <span className="grid">
                <strong>Cash on delivery</strong>
                <small className="text-p40-muted mt-1">Pay when your meal arrives.</small>
              </span>
            </label>
          </Card>
        </section>
        <Card className="sticky top-[90px] p-5 grid gap-4">
          <ShieldCheck color="#10b981" />
          <span className="text-p40-primary text-[0.72rem] font-[800] tracking-[0.08em] uppercase">Secure checkout</span>
          <h2 className="my-1">{cart.restaurant?.name ?? 'Plate40 order'}</h2>
          <p className="text-p40-muted leading-[1.6] m-0">
            Backend pricing, availability, delivery radius, coupons, fees, and taxes are validated
            when you place the order.
          </p>
          {quote.isFetching && <p role="status">Updating your final total…</p>}
          {quote.isError && <div role="alert"><p className="text-red-700">{(quote.error as { data?: { message?: string } })?.data?.message ?? 'Unable to calculate the total.'}</p><Button variant="secondary" onClick={() => { void quote.refetch(); }}>Refresh total</Button></div>}
          {totals && !quote.isError && <div className="grid gap-2 text-sm">{totals.items.map(item => <div key={item.id} className="flex justify-between gap-3"><span>{item.quantity} × {item.name}</span><Price value={item.totalPrice} /></div>)}<hr className="border-slate-100" />{Number(totals.dishSavings) > 0 && <p className="text-green-700 m-0">Dish savings: <Price value={totals.dishSavings} /> (already included)</p>}{([['Food subtotal', totals.subtotal], ['Delivery', totals.deliveryFee], ['Platform fee', totals.platformFee], ['Tax', totals.taxAmount]] as const).map(([label, value]) => <div key={label} className="flex justify-between"><span>{label}</span><Price value={value} /></div>)}{Number(totals.discountAmount) > 0 && <div className="flex justify-between text-green-700"><span>Offer {totals.couponCode}</span><span>−<Price value={totals.discountAmount} /></span></div>}<div className="flex justify-between font-bold text-xl border-t pt-3"><span>Total payable</span><Price value={totals.totalAmount} /></div></div>}
          <Button disabled={state.isLoading || !checkout.addressId || !totals || quote.isFetching || quote.isError} onClick={placeOrder} className="w-full">
            {state.isLoading
              ? 'Placing order...'
              : 'Place COD order'}
          </Button>
          <small className="text-p40-muted leading-[1.5]">Online status is never marked paid from a browser redirect alone.</small>
        </Card>
      </div>
    </main>
  );
}
