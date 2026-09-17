import { z } from 'zod';
import { AddressLabel, FoodType, PaymentMethod, UserRole } from '@plate40/types';

export const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = loginSchema.extend({
  name: z.string().trim().min(2).max(120),
  phone: z.string().regex(/^\+91[6-9]\d{9}$/, 'Use an Indian number such as +919876543210'),
  role: z.enum([UserRole.CUSTOMER, UserRole.MERCHANT]).default(UserRole.CUSTOMER),
});

export const addressSchema = z.object({
  label: z.enum(AddressLabel),
  addressLine1: z.string().trim().min(5).max(255),
  addressLine2: z.string().trim().max(255).optional(),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  postalCode: z.string().regex(/^\d{6}$/),
  latitude: z.string(),
  longitude: z.string(),
});

export const checkoutSchema = z.object({
  addressId: z.coerce.number().int().positive(),
  paymentMethod: z.enum(PaymentMethod),
  customerNote: z.string().max(500).optional(),
});

export const menuItemSchema = z.object({
  restaurantId: z.coerce.number().int().positive(),
  categoryId: z.coerce.number().int().positive(),
  name: z.string().trim().min(2).max(160),
  description: z.string().max(2000).optional(),
  imageUrl: z.url().optional().or(z.literal('')),
  foodType: z.enum(FoodType),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/),
  discountedPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).optional().or(z.literal('')),
  preparationTimeMinutes: z.coerce.number().int().positive(),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type AddressValues = z.infer<typeof addressSchema>;
export type CheckoutValues = z.infer<typeof checkoutSchema>;
export type MenuItemValues = z.infer<typeof menuItemSchema>;
