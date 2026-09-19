export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  MERCHANT = 'MERCHANT',
  DELIVERY_PARTNER = 'DELIVERY_PARTNER',
  ADMIN = 'ADMIN',
}
export enum DeliveryPartnerApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}
export enum VehicleType {
  BICYCLE = 'BICYCLE',
  MOTORCYCLE = 'MOTORCYCLE',
  SCOOTER = 'SCOOTER',
  CAR = 'CAR',
}
export enum DeliveryStatus {
  AVAILABLE = 'AVAILABLE',
  ASSIGNED = 'ASSIGNED',
  ARRIVED_AT_MERCHANT = 'ARRIVED_AT_MERCHANT',
  PICKED_UP = 'PICKED_UP',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  ARRIVED_AT_CUSTOMER = 'ARRIVED_AT_CUSTOMER',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
  SUSPENDED = 'SUSPENDED',
}

export enum FoodType {
  VEG = 'VEG',
  NON_VEG = 'NON_VEG',
  EGG = 'EGG',
}

export enum RestaurantApprovalStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

export enum RestaurantOpeningStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  TEMPORARILY_CLOSED = 'TEMPORARILY_CLOSED',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  ASSIGNED = 'ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  ONLINE = 'ONLINE',
  COD = 'COD',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  AUTHORIZED = 'AUTHORIZED',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export enum AddressLabel {
  HOME = 'HOME',
  WORK = 'WORK',
  OTHER = 'OTHER',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  statusCode: number;
  error: string;
  message: string;
  path?: string;
  timestamp?: string;
}

export interface User {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  status?: UserStatus;
  createdAt?: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Restaurant {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  addressLine1?: string;
  city: string;
  state: string;
  averageRating: string | number;
  deliveryRadiusKm: string;
  minimumOrderAmount: string;
  approvalStatus: RestaurantApprovalStatus;
  openingStatus: RestaurantOpeningStatus;
  isActive: boolean;
  createdAt?: string;
}

export interface MenuItem {
  id: number;
  restaurantId: number;
  categoryId: number;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  foodType: FoodType;
  price: string;
  discountedPrice?: string | null;
  preparationTimeMinutes: number;
  isAvailable: boolean;
  isFeatured: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface Cart {
  id: number;
  restaurantId: number;
  userId: number;
  restaurant?: Restaurant;
}

export interface CartItem {
  id: number;
  cartId: number;
  menuItemId: number;
  quantity: number;
  menuItem: MenuItem;
}

export interface Address {
  id: number;
  label: AddressLabel;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  postalCode: string;
  latitude: string;
  longitude: string;
  isDefault: boolean;
}

export interface Order {
  id: number;
  orderNumber: string;
  restaurantId: number;
  restaurant?: Restaurant;
  totalAmount: string;
  subtotal: string;
  discountAmount: string;
  deliveryFee: string;
  platformFee: string;
  taxAmount: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  delivery?: Pick<Delivery, 'id' | 'status' | 'estimatedMinutes' | 'deliveryPartner'> | null;
  deliveryOtp?: string;
}

export interface DeliveryPartner {
  id: number;
  userId: number;
  user: User;
  name?: string;
  phone?: string | null;
  profilePhotoUrl: string | null;
  address: string;
  vehicleType: VehicleType;
  vehicleNumber: string;
  approvalStatus: DeliveryPartnerApprovalStatus;
  isOnline: boolean;
  documents?: Array<{
    id: number;
    type: string;
    documentNumber: string;
    documentUrl: string | null;
    status: string;
  }>;
}

export interface Delivery {
  id: number;
  orderId: number;
  deliveryPartnerId: number | null;
  status: DeliveryStatus;
  distanceKm: string;
  deliveryFee: string;
  estimatedMinutes: number;
  order: Order & {
    address?: Address;
    customer?: User;
    items?: Array<{ id: number; itemName: string; quantity: number }>;
  };
  deliveryPartner?: DeliveryPartner | null;
}

export interface DeliveryEarnings {
  today: string;
  week: string;
  month: string;
  total: string;
  completedDeliveries: string;
  history: Array<{ id: number; totalAmount: string; createdAt: string; delivery: Delivery }>;
}

export interface AdminDashboard {
  totalOrders: number;
  todayOrders: number;
  totalCustomers: number;
  totalMerchants: number;
  activeRestaurants: number;
  pendingApprovals: number;
  totalRevenue: string;
  todayRevenue: string;
  cancelledOrders: number;
  completedOrders: number;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}
