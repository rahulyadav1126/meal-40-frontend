export interface MerchantOffer {
  id: number; restaurantId: number; version: number; code: string; description: string | null;
  discountType: 'FIXED' | 'PERCENTAGE'; discountValue: string; minimumOrderAmount: string; maximumDiscount: string | null;
  startAt: string; expiresAt: string; totalUsageLimit: number | null; perUserUsageLimit: number;
  isActive: boolean; stackWithDishDiscount: boolean; menuItemIds: number[] | null;
}
export type OfferInput = Omit<MerchantOffer, 'id' | 'version'>;
export interface OrderQuote {
  quoteToken: string; expiresAt: string; subtotal: string; dishSavings: string; discountAmount: string;
  deliveryFee: string; platformFee: string; taxAmount: string; totalAmount: string; couponCode: string | null;
  items: Array<{ id: number; name: string; quantity: number; unitPrice: string; totalPrice: string }>;
}
export interface CheckoutInput { cartId: number; addressId: number; paymentMethod: string; customerNote?: string; couponCode?: string; quoteToken?: string }
