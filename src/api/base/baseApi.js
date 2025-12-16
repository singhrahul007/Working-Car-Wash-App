//# RTK Query base API configuration

import {  fetchBaseQuery,createApi } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from './apiConfig';
import { getToken, removeToken } from '../../utils/storage';

// Base query with auth token injection
const baseQuery = fetchBaseQuery({
  baseUrl: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  prepareHeaders: async (headers) => {
    const token = await getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    Object.entries(API_CONFIG.HEADERS).forEach(([key, value]) => {
      headers.set(key, value);
    });
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  if (result.error && result.error.status === 401) {
    const refreshResult = await baseQuery(
      { url: '/auth/refresh-token', method: 'POST' },
      api,
      extraOptions
    );
    
    if (refreshResult.data) {
      result = await baseQuery(args, api, extraOptions);
    } else {
      await removeToken();
      api.dispatch({ type: 'auth/logout' });
    }
  }
  
  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth', 'User', 'Product', 'Order'],
  endpoints: () => ({}),
});
