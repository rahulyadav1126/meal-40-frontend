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
      <main className="page-shell p40-container">
        <Skeleton />
      </main>
    );
  if (carts.isError || addresses.isError)
    return (
      <main className="page-shell p40-container">
        <ErrorState message="Sign in to continue checkout." />
      </main>
    );
  const cart = carts.data?.[0];
  if (!cart)
    return (
      <main className="page-shell p40-container">
        <EmptyState
          title="No cart to checkout"
          description="Add a meal before starting checkout."
        />
      </main>
    );
  if (!addresses.data?.length)
    return (
      <main className="page-shell p40-container">
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
    <main className="page-shell p40-container">
      <PageHeader
        title="Checkout & delivery"
        description="Confirm your address and payment preference."
      />
      <div className="checkout-layout">
        <section className="checkout-stack">
          <Card className="checkout-card">
            <div className="checkout-card__heading">
              <MapPin />
              <div>
                <span className="section-kicker">Delivery address</span>
                <h2>Where should we deliver?</h2>
              </div>
            </div>
            <div className="address-options">
              {addresses.data.map((address) => (
                <label
                  className={
                    checkout.addressId === address.id
                      ? 'address-option address-option--selected'
                      : 'address-option'
                  }
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
                    <p>
                      {address.addressLine1}, {address.city}, {address.postalCode}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </Card>
          <Card className="checkout-card">
            <div className="checkout-card__heading">
              <WalletCards />
              <div>
                <span className="section-kicker">Payment</span>
                <h2>Select payment method</h2>
              </div>
            </div>
            <label
              className={
                checkout.paymentMethod === PaymentMethod.ONLINE
                  ? 'payment-option payment-option--selected'
                  : 'payment-option'
              }
            >
              <input
                type="radio"
                checked={checkout.paymentMethod === PaymentMethod.ONLINE}
                onChange={() => dispatch(setPaymentMethod(PaymentMethod.ONLINE))}
              />
              <CreditCard />
              <span>
                <strong>Test online payment</strong>
                <small>Redirects to the configured testing URL. Razorpay is not loaded.</small>
              </span>
            </label>
            <label
              className={
                checkout.paymentMethod === PaymentMethod.COD
                  ? 'payment-option payment-option--selected'
                  : 'payment-option'
              }
            >
              <input
                type="radio"
                checked={checkout.paymentMethod === PaymentMethod.COD}
                onChange={() => dispatch(setPaymentMethod(PaymentMethod.COD))}
              />
              <WalletCards />
              <span>
                <strong>Cash on delivery</strong>
                <small>Pay when your meal arrives.</small>
              </span>
            </label>
          </Card>
        </section>
        <Card className="checkout-summary">
          <ShieldCheck color="#10b981" />
          <span className="section-kicker">Secure checkout</span>
          <h2>{cart.restaurant?.name ?? 'Plate40 order'}</h2>
          <p>
            Backend pricing, availability, delivery radius, coupons, fees, and taxes are validated
            when you place the order.
          </p>
          <Button disabled={state.isLoading || !checkout.addressId} onClick={placeOrder}>
            {state.isLoading
              ? 'Placing order...'
              : checkout.paymentMethod === PaymentMethod.ONLINE
                ? 'Place order & open test payment'
                : 'Place COD order'}
          </Button>
          <small>Online status is never marked paid from a browser redirect alone.</small>
        </Card>
      </div>
    </main>
  );
}
