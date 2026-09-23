'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, MapPin, ShieldCheck, WalletCards } from 'lucide-react';
import { toast } from 'sonner';
import { API_URLS } from '@plate40/config';
import {
  useAddressesQuery,
  useAppDispatch,
  useAppSelector,
  useCartsQuery,
  useCreateOrderMutation,
  setCheckoutAddress,
  setPaymentMethod,
} from '@plate40/state';
import { PaymentMethod } from '@plate40/types';
import { Button, Card, EmptyState, ErrorState, PageHeader, Skeleton } from '@plate40/ui';

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const checkout = useAppSelector((state) => state.client.checkout);
  const carts = useCartsQuery();
  const addresses = useAddressesQuery();
  const [createOrder, state] = useCreateOrderMutation();
  useEffect(() => {
    const preferred = addresses.data?.find((address) => address.isDefault) ?? addresses.data?.[0];
    if (preferred && !checkout.addressId) dispatch(setCheckoutAddress(preferred.id));
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
  const cart = carts.data?.[0];
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
    if (!checkout.addressId) return;
    const cartId = Number(cart!.id);
    const addressId = Number(checkout.addressId);
    if (!Number.isInteger(cartId) || cartId < 1 || !Number.isInteger(addressId) || addressId < 1) {
      toast.error('Your cart or delivery address is invalid. Please refresh and try again.');
      return;
    }
    try {
      const order = await createOrder({
        cartId,
        addressId,
        paymentMethod: checkout.paymentMethod,
        customerNote: checkout.customerNote || undefined,
      }).unwrap();
      toast.success('Order placed successfully');
      if (checkout.paymentMethod === PaymentMethod.ONLINE) {
        const paymentUrl = new URL(API_URLS.testPayment);
        paymentUrl.searchParams.set('orderId', String(order.id));
        paymentUrl.searchParams.set('amount', order.totalAmount);
        paymentUrl.searchParams.set('returnUrl', `${window.location.origin}/orders/${order.id}`);
        window.location.assign(paymentUrl.toString());
      } else router.push(`/orders/${order.id}`);
    } catch (error) {
      const message =
        typeof error === 'object' && error && 'data' in error
          ? (error as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(message ?? 'Order could not be placed.');
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
          <Card className="p-5">
            <div className="flex items-start gap-3 mb-4">
              <WalletCards className="text-p40-primary p-2 box-content bg-rose-100 rounded-[9px]" />
              <div>
                <span className="text-p40-primary text-[0.72rem] font-[800] tracking-[0.08em] uppercase">Payment</span>
                <h2 className="my-1">Select payment method</h2>
              </div>
            </div>
            <label
              className={`border rounded-[10px] p-3.5 flex items-center gap-3 cursor-pointer ${
                checkout.paymentMethod === PaymentMethod.ONLINE
                  ? 'border-p40-primary bg-rose-50 shadow-[0_0_0_2px_rgba(225,29,72,0.08)]'
                  : 'border-p40-border'
              }`}
            >
              <input
                type="radio"
                checked={checkout.paymentMethod === PaymentMethod.ONLINE}
                onChange={() => dispatch(setPaymentMethod(PaymentMethod.ONLINE))}
              />
              <CreditCard />
              <span className="grid">
                <strong>Test online payment</strong>
                <small className="text-p40-muted mt-1">Redirects to the configured testing URL. Razorpay is not loaded.</small>
              </span>
            </label>
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
          <Button disabled={state.isLoading || !checkout.addressId} onClick={placeOrder} className="w-full">
            {state.isLoading
              ? 'Placing order...'
              : checkout.paymentMethod === PaymentMethod.ONLINE
                ? 'Place order & open test payment'
                : 'Place COD order'}
          </Button>
          <small className="text-p40-muted leading-[1.5]">Online status is never marked paid from a browser redirect alone.</small>
        </Card>
      </div>
    </main>
  );
}
