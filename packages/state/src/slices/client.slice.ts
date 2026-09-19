import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { PaymentMethod } from '@plate40/types';

interface ClientState {
  selectedLocation: string;
  mobileMenuOpen: boolean;
  cartPreviewOpen: boolean;
  checkout: { addressId: number | null; paymentMethod: PaymentMethod; customerNote: string };
}

const initialState: ClientState = {
  selectedLocation: 'Choose location',
  mobileMenuOpen: false,
  cartPreviewOpen: false,
  checkout: { addressId: null, paymentMethod: PaymentMethod.COD, customerNote: '' },
};

export const clientSlice = createSlice({
  name: 'client',
  initialState,
  reducers: {
    setSelectedLocation: (state, action: PayloadAction<string>) => { state.selectedLocation = action.payload; },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => { state.mobileMenuOpen = action.payload; },
    setCartPreviewOpen: (state, action: PayloadAction<boolean>) => { state.cartPreviewOpen = action.payload; },
    setCheckoutAddress: (state, action: PayloadAction<number>) => { state.checkout.addressId = action.payload; },
    setPaymentMethod: (state, action: PayloadAction<PaymentMethod>) => { state.checkout.paymentMethod = action.payload; },
    setCustomerNote: (state, action: PayloadAction<string>) => { state.checkout.customerNote = action.payload; },
  },
});

export const { setSelectedLocation, setMobileMenuOpen, setCartPreviewOpen, setCheckoutAddress, setPaymentMethod, setCustomerNote } = clientSlice.actions;
