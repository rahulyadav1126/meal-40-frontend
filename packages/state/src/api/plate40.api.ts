import { API_PATHS } from '@plate40/config';
import type {
  Address,
  AdminDashboard,
  AuthSession,
  Cart,
  CartItem,
  Category,
  Delivery,
  DeliveryEarnings,
  DeliveryPartner,
  FoodType,
  MenuItem,
  Order,
  PaginatedResult,
  Restaurant,
  Review,
  CreateReviewDto,
  User,
} from '@plate40/types';
import { baseApi } from './base-api';

export interface RestaurantFilters {
  page?: number;
  limit?: number;
  search?: string;
  foodType?: string;
  minimumRating?: number;
  sortBy?: string;
  sortOrder?: string;
}
export interface Credentials {
  email: string;
  password: string;
  deviceName?: string;
}
export interface Registration extends Credentials {
  name: string;
  phone: string;
  role: string;
}
export interface DeliveryRegistration extends Registration {
  profilePhotoUrl?: string;
  address: string;
  vehicleType: string;
  vehicleNumber: string;
  documentType: string;
  documentNumber: string;
  documentUrl?: string;
}
export interface CreateMenuItemInput {
  restaurantId: number;
  categoryId: number;
  name: string;
  description?: string;
  imageUrl?: string;
  foodType: FoodType;
  price: string;
  discountedPrice?: string | null;
  preparationTimeMinutes: number;
  isAvailable: boolean;
}
export interface UploadedImage {
  publicId: string;
  url: string;
  bytes: number;
  format: string;
}
export interface CreateRestaurantInput {
  name: string;
  description?: string;
  phone: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: string;
  longitude: string;
  deliveryRadiusKm: string;
  minimumOrderAmount: string;
}

function normalizeMenuItem(item: MenuItem): MenuItem {
  return {
    ...item,
    id: Number(item.id),
    restaurantId: Number(item.restaurantId),
    categoryId: Number(item.categoryId),
  };
}

function normalizeCart(cart: Cart): Cart {
  return {
    ...cart,
    id: Number(cart.id),
    restaurantId: Number(cart.restaurantId),
    userId: Number(cart.userId),
    restaurant: cart.restaurant
      ? { ...cart.restaurant, id: Number(cart.restaurant.id) }
      : undefined,
  };
}

function normalizeCartItem(item: CartItem): CartItem {
  return {
    ...item,
    id: Number(item.id),
    cartId: Number(item.cartId),
    menuItemId: Number(item.menuItemId),
    menuItem: item.menuItem ? normalizeMenuItem(item.menuItem) : item.menuItem,
  };
}

function normalizeAddress(address: Address): Address {
  return { ...address, id: Number(address.id) };
}

function normalizeOrder(order: Order): Order {
  return {
    ...order,
    id: Number(order.id),
    restaurantId: Number(order.restaurantId),
    restaurant: order.restaurant
      ? { ...order.restaurant, id: Number(order.restaurant.id) }
      : undefined,
  };
}

export const plate40Api = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthSession, Credentials>({
      query: (data) => ({ client: 'auth', url: API_PATHS.auth.login, method: 'POST', data }),
    }),
    register: builder.mutation<AuthSession, Registration>({
      query: (data) => ({ client: 'auth', url: API_PATHS.auth.register, method: 'POST', data }),
    }),
    registerDeliveryPartner: builder.mutation<AuthSession, DeliveryRegistration>({
      query: (data) => ({
        client: 'auth',
        url: API_PATHS.auth.deliveryRegister,
        method: 'POST',
        data,
      }),
    }),
    profile: builder.query<User, void>({
      query: () => ({ url: API_PATHS.profile }),
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation<User, { name: string; email: string; phone: string }>({
      query: (data) => ({ url: API_PATHS.profile, method: 'PATCH', data }),
      invalidatesTags: ['Profile'],
    }),
    restaurants: builder.query<PaginatedResult<Restaurant>, RestaurantFilters | void>({
      query: (params) => ({ url: API_PATHS.restaurants, params: params ?? undefined }),
      providesTags: ['Restaurants'],
    }),
    restaurant: builder.query<Restaurant, number | string>({
      query: (id) => ({ url: `${API_PATHS.restaurants}/${id}` }),
      providesTags: (_r, _e, id) => [{ type: 'Restaurants', id }],
    }),
    menu: builder.query<MenuItem[], number | string>({
      query: (id) => ({ url: API_PATHS.menu(id) }),
      transformResponse: (items: MenuItem[]) => items.map(normalizeMenuItem),
      providesTags: ['Menu'],
    }),
    carts: builder.query<Cart[], void>({
      query: () => ({ url: API_PATHS.cart }),
      transformResponse: (carts: Cart[]) => carts.map(normalizeCart),
      providesTags: ['Cart'],
    }),
    cartItems: builder.query<CartItem[], number>({
      query: (cartId) => ({ url: `${API_PATHS.cart}/${cartId}/items` }),
      transformResponse: (items: CartItem[]) => items.map(normalizeCartItem),
      providesTags: ['Cart'],
    }),
    addCartItem: builder.mutation<CartItem, { menuItemId: number; quantity: number }>({
      query: (data) => ({ url: API_PATHS.cartItems, method: 'POST', data }),
      transformResponse: normalizeCartItem,
      invalidatesTags: ['Cart'],
    }),
    updateCartItem: builder.mutation<CartItem, { itemId: number; quantity: number }>({
      query: ({ itemId, quantity }) => ({
        url: API_PATHS.cartItem(itemId),
        method: 'PATCH',
        data: { quantity },
      }),
      transformResponse: normalizeCartItem,
      invalidatesTags: ['Cart'],
    }),
    removeCartItem: builder.mutation<void, number>({
      query: (itemId) => ({ url: API_PATHS.cartItem(itemId), method: 'DELETE' }),
      invalidatesTags: ['Cart'],
    }),
    orders: builder.query<Order[], void>({
      query: () => ({ url: API_PATHS.orders }),
      transformResponse: (orders: Order[]) => orders.map(normalizeOrder),
      providesTags: ['Orders'],
    }),
    order: builder.query<Order, number | string>({
      query: (id) => ({ url: API_PATHS.order(id) }),
      transformResponse: normalizeOrder,
      providesTags: (_r, _e, id) => [{ type: 'Orders', id }],
    }),
    createOrder: builder.mutation<
      Order,
      { cartId: number; addressId: number; paymentMethod: string; customerNote?: string }
    >({
      query: (data) => ({ url: API_PATHS.orders, method: 'POST', data }),
      transformResponse: normalizeOrder,
      invalidatesTags: ['Orders', 'Cart'],
    }),
    addresses: builder.query<Address[], void>({
      query: () => ({ url: API_PATHS.addresses }),
      transformResponse: (addresses: Address[]) => addresses.map(normalizeAddress),
      providesTags: ['Addresses'],
    }),
    createAddress: builder.mutation<Address, Omit<Address, 'id' | 'isDefault'>>({
      query: (data) => ({ url: API_PATHS.addresses, method: 'POST', data }),
      transformResponse: normalizeAddress,
      invalidatesTags: ['Addresses'],
    }),
    updateAddress: builder.mutation<Address, { id: number; data: Partial<Omit<Address, 'id'>> }>({
      query: ({ id, data }) => ({ url: `${API_PATHS.addresses}/${id}`, method: 'PATCH', data }),
      transformResponse: normalizeAddress,
      invalidatesTags: ['Addresses'],
    }),
    deleteAddress: builder.mutation<void, number>({
      query: (id) => ({ url: `${API_PATHS.addresses}/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Addresses'],
    }),
    merchantOrders: builder.query<Order[], void>({
      query: () => ({ url: API_PATHS.merchant.orders }),
      providesTags: ['MerchantOrders'],
    }),
    merchantRestaurants: builder.query<Restaurant[], void>({
      query: () => ({ url: API_PATHS.merchant.restaurants }),
      providesTags: ['Restaurants'],
    }),
    createMerchantRestaurant: builder.mutation<Restaurant, CreateRestaurantInput>({
      query: (data) => ({ url: API_PATHS.merchant.restaurants, method: 'POST', data }),
      invalidatesTags: ['Restaurants'],
    }),
    updateMerchantRestaurant: builder.mutation<Restaurant, Partial<CreateRestaurantInput> & { id: number; openingStatus?: string }>({
      query: (data) => {
        const { id, ...body } = data;
        return { url: `${API_PATHS.merchant.restaurants}/${id}`, method: 'PATCH', data: body };
      },
      invalidatesTags: ['Restaurants'],
    }),
    categories: builder.query<Category[], void>({ query: () => ({ url: API_PATHS.categories }) }),
    updateMerchantOrder: builder.mutation<
      Order,
      { orderId: number; action: string; note?: string }
    >({
      query: ({ orderId, action, note }) => ({
        url: API_PATHS.merchant.orderAction(orderId, action),
        method: 'PATCH',
        data: { note },
      }),
      invalidatesTags: ['MerchantOrders', 'Orders'],
    }),
    merchantMenu: builder.query<MenuItem[], void>({
      query: () => ({ url: API_PATHS.merchant.menu }),
      transformResponse: (items: MenuItem[]) => items.map(normalizeMenuItem),
      providesTags: ['Menu'],
    }),
    uploadMenuImage: builder.mutation<UploadedImage, File>({
      query: (file) => {
        const data = new FormData();
        data.append('file', file);
        return { url: API_PATHS.merchant.menuImage, method: 'POST', data };
      },
    }),
    createMerchantMenuItem: builder.mutation<MenuItem, CreateMenuItemInput>({
      query: (data) => ({ url: API_PATHS.merchant.menu, method: 'POST', data }),
      transformResponse: normalizeMenuItem,
      invalidatesTags: ['Menu'],
    }),
    updateMerchantMenuItem: builder.mutation<
      MenuItem,
      { itemId: number; data: Partial<CreateMenuItemInput> }
    >({
      query: ({ itemId, data }) => ({
        url: API_PATHS.merchant.menuItem(itemId),
        method: 'PATCH',
        data,
      }),
      transformResponse: normalizeMenuItem,
      invalidatesTags: ['Menu'],
    }),
    deleteMerchantMenuItem: builder.mutation<void, number>({
      query: (itemId) => ({
        url: API_PATHS.merchant.menuItem(itemId),
        method: 'DELETE',
      }),
      invalidatesTags: ['Menu'],
    }),
    adminDashboard: builder.query<AdminDashboard, void>({
      query: () => ({ url: API_PATHS.admin.dashboard }),
      providesTags: ['Dashboard'],
    }),
    adminRestaurants: builder.query<Restaurant[], void>({
      query: () => ({ url: API_PATHS.admin.restaurants }),
      providesTags: ['AdminRestaurants'],
    }),
    adminOrders: builder.query<Order[], void>({
      query: () => ({ url: API_PATHS.admin.orders }),
      providesTags: ['AdminOrders'],
    }),
    adminUsers: builder.query<User[], void>({
      query: () => ({ url: API_PATHS.admin.users }),
      providesTags: ['Users'],
    }),
    updateRestaurantApproval: builder.mutation<
      Restaurant,
      { restaurantId: number; action: string; reason?: string }
    >({
      query: ({ restaurantId, action, reason }) => ({
        url: API_PATHS.admin.restaurantAction(restaurantId, action),
        method: 'PATCH',
        data: reason ? { reason } : undefined,
      }),
      invalidatesTags: ['AdminRestaurants', 'Dashboard'],
    }),
    updateUserStatus: builder.mutation<User, { userId: number; action: string }>({
      query: ({ userId, action }) => ({
        url: API_PATHS.admin.userAction(userId, action),
        method: 'PATCH',
      }),
      invalidatesTags: ['Users'],
    }),
    deliveryProfile: builder.query<DeliveryPartner, void>({
      query: () => ({ url: API_PATHS.delivery.profile }),
      providesTags: ['DeliveryProfile'],
    }),
    deliveryAvailable: builder.query<Delivery[], void>({
      query: () => ({ url: API_PATHS.delivery.available }),
      providesTags: ['Delivery'],
    }),
    deliveryActive: builder.query<Delivery[], void>({
      query: () => ({ url: API_PATHS.delivery.active }),
      providesTags: ['Delivery'],
    }),
    deliveryHistory: builder.query<Delivery[], void>({
      query: () => ({ url: API_PATHS.delivery.history }),
      providesTags: ['Delivery'],
    }),
    deliveryEarnings: builder.query<DeliveryEarnings, void>({
      query: () => ({ url: API_PATHS.delivery.earnings }),
      providesTags: ['DeliveryEarnings'],
    }),
    setDeliveryAvailability: builder.mutation<DeliveryPartner, boolean>({
      query: (isOnline) => ({
        url: API_PATHS.delivery.availability,
        method: 'PATCH',
        data: { isOnline },
      }),
      invalidatesTags: ['DeliveryProfile', 'Delivery'],
    }),
    deliveryAction: builder.mutation<unknown, { deliveryId: number; action: string; otp?: string }>(
      {
        query: ({ deliveryId, action, otp }) => ({
          url: API_PATHS.delivery.action(deliveryId, action),
          method: 'POST',
          data: otp ? { otp } : undefined,
        }),
        invalidatesTags: ['Delivery', 'DeliveryEarnings', 'Orders', 'MerchantOrders'],
      },
    ),
    adminDeliveryPartners: builder.query<DeliveryPartner[], void>({
      query: () => ({ url: API_PATHS.admin.deliveryPartners }),
      providesTags: ['AdminDelivery'],
    }),
    adminDeliveries: builder.query<Delivery[], void>({
      query: () => ({ url: API_PATHS.admin.deliveries }),
      providesTags: ['AdminDelivery'],
    }),
    adminDeliveryAction: builder.mutation<
      unknown,
      { id: number; action: string; document?: boolean }
    >({
      query: ({ id, action, document }) => ({
        url: document
          ? API_PATHS.admin.deliveryDocumentAction(id, action)
          : API_PATHS.admin.deliveryPartnerAction(id, action),
        method: 'PATCH',
      }),
      invalidatesTags: ['AdminDelivery'],
    }),
    createReview: builder.mutation<Review, CreateReviewDto>({
      query: (data) => ({ url: 'http://localhost:3001/api/mock/reviews', method: 'POST', data }),
      async onQueryStarted({ restaurantId, rating }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          plate40Api.util.updateQueryData('restaurants', undefined, (draft) => {
            const restaurant = draft.items.find((r) => r.id === restaurantId);
            if (restaurant) {
              const currentRating = Number(restaurant.averageRating) || 0;
              restaurant.averageRating = currentRating === 0 ? rating.toFixed(1) : ((currentRating + rating) / 2).toFixed(1);
            }
          })
        );

        try {
          await queryFulfilled;
          dispatch(plate40Api.util.invalidateTags(['MerchantOrders']));
        } catch {
          patchResult.undo();
        }
      },
    }),
    merchantReviews: builder.query<Review[], void>({
      query: () => ({ url: 'http://localhost:3001/api/mock/reviews' }),
      providesTags: ['MerchantOrders'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRegisterDeliveryPartnerMutation,
  useProfileQuery,
  useUpdateProfileMutation,
  useRestaurantsQuery,
  useRestaurantQuery,
  useMenuQuery,
  useCartsQuery,
  useCartItemsQuery,
  useAddCartItemMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useOrdersQuery,
  useOrderQuery,
  useCreateOrderMutation,
  useAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useMerchantOrdersQuery,
  useMerchantRestaurantsQuery,
  useCreateMerchantRestaurantMutation,
  useUpdateMerchantRestaurantMutation,
  useCategoriesQuery,
  useUpdateMerchantOrderMutation,
  useMerchantMenuQuery,
  useUploadMenuImageMutation,
  useCreateMerchantMenuItemMutation,
  useUpdateMerchantMenuItemMutation,
  useDeleteMerchantMenuItemMutation,
  useAdminDashboardQuery,
  useAdminRestaurantsQuery,
  useAdminOrdersQuery,
  useAdminUsersQuery,
  useUpdateRestaurantApprovalMutation,
  useUpdateUserStatusMutation,
  useDeliveryProfileQuery,
  useDeliveryAvailableQuery,
  useDeliveryActiveQuery,
  useDeliveryHistoryQuery,
  useDeliveryEarningsQuery,
  useSetDeliveryAvailabilityMutation,
  useDeliveryActionMutation,
  useAdminDeliveryPartnersQuery,
  useAdminDeliveriesQuery,
  useAdminDeliveryActionMutation,
  useCreateReviewMutation,
  useMerchantReviewsQuery,
} = plate40Api;
