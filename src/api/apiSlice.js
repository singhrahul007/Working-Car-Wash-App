import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import * as SecureStore from 'expo-secure-store';

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://10.0.2.2:5000/api', // emulator fallback
  prepareHeaders: async (headers) => {
    try {
      const token = await SecureStore.getItemAsync('carwash_jwt');
      if (token) headers.set('authorization', `Bearer ${token}`);
    } catch (e) {
      // ignore
    }
    return headers;
  },
});

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Services','Products','Bookings'],
  endpoints: (builder) => ({
    getServices: builder.query({
      query: () => '/services',
      providesTags: ['Services']
    }),
    getProducts: builder.query({
      query: () => '/products',
      providesTags: ['Products']
    }),
    sendOtp: builder.mutation({
      query: (body) => ({ url: '/auth/send-otp', method: 'POST', body })
    }),
    verifyOtp: builder.mutation({
      query: (body) => ({ url: '/auth/verify-otp', method: 'POST', body })
    }),
    createBooking: builder.mutation({
      query: (body) => ({ url: '/bookings', method: 'POST', body }),
      invalidatesTags: ['Bookings']
    }),
    getRecentBookings: builder.query({
      query: () => '/bookings/recent',
      providesTags: ['Bookings']
    })
  })
});

export const {
  useGetServicesQuery,
  useGetProductsQuery,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useCreateBookingMutation,
  useGetRecentBookingsQuery
} = apiSlice;
