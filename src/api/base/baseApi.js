//# RTK Query base API configuration

import {  fetchBaseQuery,createApi } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from './apiConfig';
import { getToken, removeToken } from '../../utils/storage';
import { logout } from '../../store/slices/authSlice';

// Base query with auth token injection
const baseQuery = fetchBaseQuery({
  baseUrl: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  prepareHeaders: async (headers) => {
    const token = await getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
   // ⬇️ Add this fetch options object (Android-specific)
  // fetchFn: (url, options) => {
  //   return fetch(url, {
  //     ...options,
  //     // This is insecure and for local development only
  //     agent: new (require('https')).Agent({
  //       rejectUnauthorized: false
  //     })
  //   });
  //}
});

const baseQueryWithReauth = async (/** @type {any} */ args, /** @type {any} */ api, /** @type {any} */ extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  if (result?.error && result?.error.status === 401) {
    const refreshResult = await baseQuery(
      { url: '/Auth/refresh-token', method: 'POST' },
      api,
      extraOptions
    );
    
    if (refreshResult?.data) {
      result = await baseQuery(args, api, extraOptions);
    } else {
      await removeToken();
      api.dispatch(logout());
    }
  }
  
  return result;
};

export const baseApi = createApi({
   reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth', 'User', 'Product', 'Order', 'ACService', 'ACBooking', 'SofaService', 'SofaBooking', 'CarpetService', 'CarpetBooking', 'PlumbingService', 'PlumbingBooking', 'Service', 'Booking', 'Offer', 'Address'],
  endpoints: () => ({}),
});
