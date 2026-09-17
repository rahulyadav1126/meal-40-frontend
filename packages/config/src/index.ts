export const API_URLS = {
  auth: process.env.NEXT_PUBLIC_AUTH_API_URL ?? 'http://localhost:4001/api/v1',
  main: process.env.NEXT_PUBLIC_MAIN_API_URL ?? 'http://localhost:4002/api/v1',
  socket: process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4002',
  testPayment: process.env.NEXT_PUBLIC_TEST_PAYMENT_URL ?? 'http://localhost:3000/payment/test',
} as const;

export const API_PATHS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    logoutAll: '/auth/logout-all',
    sessions: '/auth/sessions',
  },
  restaurants: '/restaurants',
  menu: (restaurantId: number | string) => `/restaurants/${restaurantId}/menu`,
  cart: '/cart',
  cartItems: '/cart/items',
  cartItem: (itemId: number) => `/cart/items/${itemId}`,
  orders: '/orders',
  order: (orderId: number | string) => `/orders/${orderId}`,
  addresses: '/addresses',
  notifications: '/notifications',
  merchant: {
    restaurants: '/merchant/restaurants',
    orders: '/merchant/orders',
    menu: '/merchant/menu',
    orderAction: (orderId: number, action: string) => `/merchant/orders/${orderId}/${action}`,
  },
  admin: {
    dashboard: '/admin/dashboard',
    restaurants: '/admin/restaurants',
    orders: '/admin/orders',
    users: '/admin/users',
    restaurantAction: (restaurantId: number, action: string) =>
      `/admin/restaurants/${restaurantId}/${action}`,
    userAction: (userId: number, action: string) => `/admin/users/${userId}/${action}`,
  },
} as const;

export const ACTIONS = {
  approve: 'approve',
  reject: 'reject',
  suspend: 'suspend',
  block: 'block',
  unblock: 'unblock',
  accept: 'accept',
  preparing: 'preparing',
  ready: 'ready',
  outForDelivery: 'out-for-delivery',
} as const;

export const ROUTES = {
  customer: {
    home: '/',
    login: '/login',
    register: '/register',
    restaurants: '/restaurants',
    cart: '/cart',
    checkout: '/checkout',
    orders: '/orders',
    profile: '/profile',
    addresses: '/profile/addresses',
    offers: '/offers',
    testPayment: '/payment/test',
  },
  admin: {
    dashboard: '/admin/dashboard',
    restaurants: '/admin/restaurants',
    orders: '/admin/orders',
    users: '/admin/users',
    payments: '/admin/payments',
    coupons: '/admin/coupons',
    reports: '/admin/reports',
  },
  merchant: {
    dashboard: '/merchant/dashboard',
    orders: '/merchant/orders',
    menu: '/merchant/menu',
    earnings: '/merchant/earnings',
    reviews: '/merchant/reviews',
    settings: '/merchant/settings',
  },
} as const;

export const STORAGE_KEYS = {
  accessToken: 'plate40.access-token',
  refreshToken: 'plate40.refresh-token',
  user: 'plate40.user',
} as const;

export const APP_NAMES = {
  customer: 'Plate40',
  dashboard: 'Plate40 Operations',
} as const;
