import { createApi, type BaseQueryFn } from '@reduxjs/toolkit/query/react';
import type { AxiosRequestConfig } from 'axios';
import { apiRequest, type ClientName, Plate40ApiError } from '@plate40/api-client';

export interface ApiQueryArgs extends AxiosRequestConfig {
  client?: ClientName;
}
export interface QueryError {
  status: number;
  data: { code: string; message: string };
}

const axiosBaseQuery: BaseQueryFn<ApiQueryArgs, unknown, QueryError> = async ({
  client = 'main',
  ...config
}) => {
  try {
    return { data: await apiRequest(client, config) };
  } catch (error) {
    const normalized =
      error instanceof Plate40ApiError
        ? error
        : new Plate40ApiError('Unable to complete the request.', 500, 'REQUEST_FAILED');
    return {
      error: {
        status: normalized.statusCode,
        data: { code: normalized.code, message: normalized.message },
      },
    };
  }
};

export const TAG_TYPES = [
  'Restaurants',
  'Menu',
  'Cart',
  'Orders',
  'Addresses',
  'Notifications',
  'MerchantOrders',
  'AdminRestaurants',
  'AdminOrders',
  'Users',
  'Payments',
  'Reviews',
  'Dashboard',
  'Delivery',
  'DeliveryProfile',
  'DeliveryEarnings',
  'AdminDelivery',
  'Profile',
] as const;

export const baseApi = createApi({
  reducerPath: 'plate40Api',
  baseQuery: axiosBaseQuery,
  tagTypes: [...TAG_TYPES],
  endpoints: () => ({}),
});
