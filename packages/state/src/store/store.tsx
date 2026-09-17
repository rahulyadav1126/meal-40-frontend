'use client';

import { configureStore } from '@reduxjs/toolkit';
import { Provider, useDispatch, useSelector } from 'react-redux';
import type { ReactNode } from 'react';
import { baseApi } from '../api/base-api';
import { clientSlice } from '../slices/client.slice';

export function createPlate40Store() {
  return configureStore({
    reducer: { [baseApi.reducerPath]: baseApi.reducer, client: clientSlice.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
  });
}

export const store = createPlate40Store();
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

export function Plate40StateProvider({ children }: { children: ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
