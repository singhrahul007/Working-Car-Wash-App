// src/api/utils/tokenManager.js
// Standalone TokenManager - no imports from store or interceptors
// This breaks the circular dependency between authSlice <-> authInterceptor

import AsyncStorage from '@react-native-async-storage/async-storage';

export const TokenManager = {

  // Store complete auth data
  storeAuthData: async (authData) => {
    try {
      await AsyncStorage.setItem('@auth_data', JSON.stringify(authData));
    } catch (error) {
      console.error('Error storing auth data:', error);
      throw error;
    }
  },

  // Get stored auth data
  getAuthData: async () => {
    try {
      const authData = await AsyncStorage.getItem('@auth_data');
      return authData ? JSON.parse(authData) : null;
    } catch (error) {
      console.error('Error getting auth data:', error);
      return null;
    }
  },

  // Clear all auth data
  clearAuthData: async () => {
    try {
      await AsyncStorage.removeItem('@auth_data');
    } catch (error) {
      console.error('Error clearing auth data:', error);
      throw error;
    }
  },

  // Get access token
  getAccessToken: async () => {
    try {
      const authData = await TokenManager.getAuthData();
      return authData?.accessToken || null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  },

  // Get refresh token
  getRefreshToken: async () => {
    try {
      const authData = await TokenManager.getAuthData();
      return authData?.refreshToken || null;
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },

  // Get stored token (legacy key)
  getToken: async () => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  // Check if token is expired (sync - reads from Redux state, not storage)
  getAuthDataSync: () => {
    // AsyncStorage is async-only; use Redux state for sync access
    return null;
  },

  isTokenExpired: () => {
    try {
      const authData = TokenManager.getAuthDataSync();
      if (!authData?.accessTokenExpiry) return true;
      const expiryDate = new Date(authData.accessTokenExpiry);
      return new Date() >= expiryDate;
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return true;
    }
  },

  // Clear all tokens
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
