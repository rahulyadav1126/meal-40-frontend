import { API_PATHS } from '@plate40/config';
import type { Address, AdminDashboard, AuthSession, Cart, CartItem, MenuItem, Order, PaginatedResult, Restaurant, User } from '@plate40/types';
import { baseApi } from './base-api';

export interface RestaurantFilters { page?: number; limit?: number; search?: string; foodType?: string; minimumRating?: number; sortBy?: string; sortOrder?: string }
export interface Credentials { email: string; password: string; deviceName?: string }
export interface Registration extends Credentials { name: string; phone: string; role: string }

export const plate40Api = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthSession, Credentials>({ query: (data) => ({ client: 'auth', url: API_PATHS.auth.login, method: 'POST', data }) }),
    register: builder.mutation<AuthSession, Registration>({ query: (data) => ({ client: 'auth', url: API_PATHS.auth.register, method: 'POST', data }) }),
    restaurants: builder.query<PaginatedResult<Restaurant>, RestaurantFilters | void>({ query: (params) => ({ url: API_PATHS.restaurants, params: params ?? undefined }), providesTags: ['Restaurants'] }),
    restaurant: builder.query<Restaurant, number | string>({ query: (id) => ({ url: `${API_PATHS.restaurants}/${id}` }), providesTags: (_r, _e, id) => [{ type: 'Restaurants', id }] }),
    menu: builder.query<MenuItem[], number | string>({ query: (id) => ({ url: API_PATHS.menu(id) }), providesTags: ['Menu'] }),
    carts: builder.query<Cart[], void>({ query: () => ({ url: API_PATHS.cart }), providesTags: ['Cart'] }),
    cartItems: builder.query<CartItem[], number>({ query: (cartId) => ({ url: `${API_PATHS.cart}/${cartId}/items` }), providesTags: ['Cart'] }),
    addCartItem: builder.mutation<CartItem, { menuItemId: number; quantity: number }>({ query: (data) => ({ url: API_PATHS.cartItems, method: 'POST', data }), invalidatesTags: ['Cart'] }),
    updateCartItem: builder.mutation<CartItem, { itemId: number; quantity: number }>({ query: ({ itemId, quantity }) => ({ url: API_PATHS.cartItem(itemId), method: 'PATCH', data: { quantity } }), invalidatesTags: ['Cart'] }),
    removeCartItem: builder.mutation<void, number>({ query: (itemId) => ({ url: API_PATHS.cartItem(itemId), method: 'DELETE' }), invalidatesTags: ['Cart'] }),
    orders: builder.query<Order[], void>({ query: () => ({ url: API_PATHS.orders }), providesTags: ['Orders'] }),
    order: builder.query<Order, number | string>({ query: (id) => ({ url: API_PATHS.order(id) }), providesTags: (_r, _e, id) => [{ type: 'Orders', id }] }),
    createOrder: builder.mutation<Order, { cartId: number; addressId: number; paymentMethod: string; customerNote?: string }>({ query: (data) => ({ url: API_PATHS.orders, method: 'POST', data }), invalidatesTags: ['Orders', 'Cart'] }),
    addresses: builder.query<Address[], void>({ query: () => ({ url: API_PATHS.addresses }), providesTags: ['Addresses'] }),
    createAddress: builder.mutation<Address, Omit<Address, 'id' | 'isDefault'>>({ query: (data) => ({ url: API_PATHS.addresses, method: 'POST', data }), invalidatesTags: ['Addresses'] }),
    merchantOrders: builder.query<Order[], void>({ query: () => ({ url: API_PATHS.merchant.orders }), providesTags: ['MerchantOrders'] }),
    merchantRestaurants: builder.query<Restaurant[], void>({ query: () => ({ url: API_PATHS.merchant.restaurants }), providesTags: ['Restaurants'] }),
    updateMerchantOrder: builder.mutation<Order, { orderId: number; action: string; note?: string }>({ query: ({ orderId, action, note }) => ({ url: API_PATHS.merchant.orderAction(orderId, action), method: 'PATCH', data: { note } }), invalidatesTags: ['MerchantOrders', 'Orders'] }),
    merchantMenu: builder.query<MenuItem[], void>({ query: () => ({ url: API_PATHS.merchant.menu }), providesTags: ['Menu'] }),
    adminDashboard: builder.query<AdminDashboard, void>({ query: () => ({ url: API_PATHS.admin.dashboard }), providesTags: ['Dashboard'] }),
    adminRestaurants: builder.query<Restaurant[], void>({ query: () => ({ url: API_PATHS.admin.restaurants }), providesTags: ['AdminRestaurants'] }),
    adminOrders: builder.query<Order[], void>({ query: () => ({ url: API_PATHS.admin.orders }), providesTags: ['AdminOrders'] }),
    adminUsers: builder.query<User[], void>({ query: () => ({ url: API_PATHS.admin.users }), providesTags: ['Users'] }),
    updateRestaurantApproval: builder.mutation<Restaurant, { restaurantId: number; action: string; reason?: string }>({ query: ({ restaurantId, action, reason }) => ({ url: API_PATHS.admin.restaurantAction(restaurantId, action), method: 'PATCH', data: reason ? { reason } : undefined }), invalidatesTags: ['AdminRestaurants', 'Dashboard'] }),
    updateUserStatus: builder.mutation<User, { userId: number; action: string }>({ query: ({ userId, action }) => ({ url: API_PATHS.admin.userAction(userId, action), method: 'PATCH' }), invalidatesTags: ['Users'] }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useRestaurantsQuery, useRestaurantQuery, useMenuQuery, useCartsQuery, useCartItemsQuery, useAddCartItemMutation, useUpdateCartItemMutation, useRemoveCartItemMutation, useOrdersQuery, useOrderQuery, useCreateOrderMutation, useAddressesQuery, useCreateAddressMutation, useMerchantOrdersQuery, useMerchantRestaurantsQuery, useUpdateMerchantOrderMutation, useMerchantMenuQuery, useAdminDashboardQuery, useAdminRestaurantsQuery, useAdminOrdersQuery, useAdminUsersQuery, useUpdateRestaurantApprovalMutation, useUpdateUserStatusMutation } = plate40Api;
