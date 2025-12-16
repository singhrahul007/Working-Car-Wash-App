// api/apiSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from './apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Token management utilities
export const TokenManager = {
  storeTokens: async (tokens) => {
    try {
      await AsyncStorage.multiSet([
        ['@auth_token', tokens.accessToken || tokens.token],
        ['@refresh_token', tokens.refreshToken],
        ['@token_expiry', tokens.expiry?.toString() || (Date.now() + 3600000).toString()],
      ]);
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw error;
    }
  },

  getToken: async () => {
    try {
      return await AsyncStorage.getItem('@auth_token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  getRefreshToken: async () => {
    try {
      return await AsyncStorage.getItem('@refresh_token');
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },

  clearTokens: async () => {
    try {
      await AsyncStorage.multiRemove([
        '@auth_token',
        '@refresh_token',
        '@token_expiry',
      ]);
    } catch (error) {
      console.error('Error clearing tokens:', error);
      throw error;
    }
  },
};

// Base query with reauth logic
const baseQuery = fetchBaseQuery({
  baseUrl: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  prepareHeaders: async (headers) => {
    const token = await TokenManager.getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  // If 401 error, try to refresh token
  if (result.error && result.error.status === 401) {
    const refreshToken = await TokenManager.getRefreshToken();
    
    if (refreshToken) {
      const refreshResult = await baseQuery(
        { 
          url: API_ENDPOINTS.AUTH.REFRESH_TOKEN, 
          method: 'POST',
          body: { refreshToken }
        },
        api,
        extraOptions
      );
      
      if (refreshResult.data) {
        // Store new tokens
        await TokenManager.storeTokens(refreshResult.data);
        // Retry original request
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh failed - logout
        await TokenManager.clearTokens();
        api.dispatch({ type: 'auth/logout' });
      }
    } else {
      // No refresh token - logout
      await TokenManager.clearTokens();
      api.dispatch({ type: 'auth/logout' });
    }
  }
  
  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth', 'User', 'Product', 'Order', 'Services', 'Bookings'],
  endpoints: (builder) => ({
    // Auth endpoints
    registerUser: builder.mutation({
      query: (userData) => ({
        url: API_ENDPOINTS.AUTH.REGISTER,
        method: 'POST',
        body: userData,
      }),
    }),
    
    verifyOtp: builder.mutation({
      query: (otpData) => ({
        url: API_ENDPOINTS.AUTH.VERIFY_OTP,
        method: 'POST',
        body: otpData,
      }),
    }),
    
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: API_ENDPOINTS.AUTH.LOGIN,
        method: 'POST',
        body: credentials,
      }),
    }),
    
    // Service endpoints
    getServices: builder.query({
      query: () => '/services',
      providesTags: ['Services']
    }),
    
    getProducts: builder.query({
      query: () => '/products',
      providesTags: ['Products']
    }),
    
    createBooking: builder.mutation({
      query: (bookingData) => ({
        url: '/bookings',
        method: 'POST',
        body: bookingData,
      }),
      invalidatesTags: ['Bookings']
    }),
    
    getRecentBookings: builder.query({
      query: () => '/bookings/recent',
      providesTags: ['Bookings']
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useVerifyOtpMutation,
  useLoginUserMutation,
  useGetServicesQuery,
  useGetProductsQuery,
  useCreateBookingMutation,
  useGetRecentBookingsQuery,
} = baseApi;