export const API_URLS = {
  auth: process.env.NEXT_PUBLIC_AUTH_API_URL ?? 'http://localhost:4001/api/v1',
  main: process.env.NEXT_PUBLIC_MAIN_API_URL ?? 'http://localhost:4002/api/v1',
  socket: process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4002',
  testPayment: process.env.NEXT_PUBLIC_TEST_PAYMENT_URL ?? 'http://localhost:3000/payment/test',
} as const;

export const API_PATHS = {
  search: '/search',
  tracking: (orderId: number | string) => `/tracking/orders/${orderId}`,
  deliveryLocation: (deliveryId: number) => `/tracking/deliveries/${deliveryId}/location`,
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    deliveryRegister: '/auth/delivery/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    logoutAll: '/auth/logout-all',
    sessions: '/auth/sessions',
  },
  restaurants: '/restaurants',
  categories: '/categories',
  menu: (restaurantId: number | string) => `/restaurants/${restaurantId}/menu`,
  cart: '/cart',
  cartItems: '/cart/items',
  cartItem: (itemId: number) => `/cart/items/${itemId}`,
  orders: '/orders',
  orderQuote: '/orders/quote',
  restaurantOffers: (id: number | string) => `/restaurants/${id}/offers`,
  order: (orderId: number | string) => `/orders/${orderId}`,
  addresses: '/addresses',
  notifications: '/notifications',
  profile: '/users/me',
  reviews: '/reviews',
  locations: {
    autocomplete: '/locations/autocomplete',
    details: (placeId: string) => `/locations/details/${encodeURIComponent(placeId)}`,
  },
  merchant: {
    availability: (id: number) => `/merchant/restaurants/${id}/availability`,
    offers: '/merchant/offers',
    restaurants: '/merchant/restaurants',
    orders: '/merchant/orders',
    menu: '/merchant/menu',
    menuImage: '/merchant/menu/image',
    menuItem: (itemId: number) => `/merchant/menu/${itemId}`,
    orderAction: (orderId: number, action: string) => `/merchant/orders/${orderId}/${action}`,
    reviews: '/merchant/reviews',
  },
  delivery: {
    profile: '/delivery/profile',
    availability: '/delivery/availability',
    available: '/delivery/available',
    active: '/delivery/active',
    history: '/delivery/history',
    earnings: '/delivery/earnings',
    action: (deliveryId: number, action: string) => `/delivery/${deliveryId}/${action}`,
  },
  admin: {
    dashboard: '/admin/dashboard',
    restaurants: '/admin/restaurants',
    orders: '/admin/orders',
    users: '/admin/users',
    restaurantAction: (restaurantId: number, action: string) =>
      `/admin/restaurants/${restaurantId}/${action}`,
    userAction: (userId: number, action: string) => `/admin/users/${userId}/${action}`,
    deliveryPartners: '/admin/delivery/partners',
    deliveries: '/admin/delivery/deliveries',
    deliveryPartnerAction: (id: number, action: string) =>
      `/admin/delivery/partners/${id}/${action}`,
    deliveryDocumentAction: (id: number, action: string) =>
      `/admin/delivery/documents/${id}/${action}`,
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
  deliver: 'deliver',
} as const;

export const ROUTES = {
  customer: {
    search: '/search',
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
    help: '/help',
    testPayment: '/payment/test',
    terms: '/terms',
    cookies: '/cookies',
    privacy: '/privacy',
  },
  admin: {
    dashboard: '/admin/dashboard',
    restaurants: '/admin/restaurants',
    orders: '/admin/orders',
    users: '/admin/users',
    payments: '/admin/payments',
    coupons: '/admin/coupons',
    reports: '/admin/reports',
    delivery: '/admin/delivery',
  },
  merchant: {
    dashboard: '/merchant/dashboard',
    offers: '/merchant/offers',
    orders: '/merchant/orders',
    menu: '/merchant/menu',
    earnings: '/merchant/earnings',
    reviews: '/merchant/reviews',
    settings: '/merchant/settings',
  },
  delivery: {
    dashboard: '/delivery/dashboard',
    available: '/delivery/available',
    active: '/delivery/active',
    history: '/delivery/history',
    earnings: '/delivery/earnings',
    profile: '/delivery/profile',
    settings: '/delivery/settings',
    register: '/delivery-register',
  },
} as const;

export const STORAGE_KEYS = {
  accessToken: 'plate40.access-token',
  refreshToken: 'plate40.refresh-token',
  user: 'plate40.user',
  deliveryLocation: 'plate40.delivery-location',
} as const;

export const APP_NAMES = {
  customer: 'Plate40',
  dashboard: 'Plate40 Operations',
} as const;
