// Token injection
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout, setCredentials } from '../../store/slices/authSlice';
import { API_BASE_URL } from '../base/apiConfig';


// Token management utilities
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
   // Check if token is expired
  isTokenExpired: () => {
    try {
      const authData = TokenManager.getAuthDataSync();
      if (!authData?.accessTokenExpiry) return true;
      
      const expiryDate = new Date(authData.accessTokenExpiry);
      const now = new Date();
      return now >= expiryDate;
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return true;
    }
  },
   // Synchronous version for immediate checks
  getAuthDataSync: () => {
    try {
      // Note: AsyncStorage is async, so this might not be perfect
      // For real sync access, you'd need to store in Redux state
      return null;
    } catch (error) {
      return null;
    }
  },


  // Get stored token
  getToken: async () => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  // Get refresh token
  // getRefreshToken: async () => {
  //   try {
  //     const refreshToken = await AsyncStorage.getItem('@refresh_token');
  //     return refreshToken;
  //   } catch (error) {
  //     console.error('Error getting refresh token:', error);
  //     return null;
  //   }
  // },

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

  // Check if token is expired
  // isTokenExpired: async () => {
  //   try {
  //     const expiry = await AsyncStorage.getItem('@token_expiry');
  //     if (!expiry) return true;
      
  //     const expiryTime = parseInt(expiry, 10);
  //     return Date.now() >= expiryTime;
  //   } catch (error) {
  //     console.error('Error checking token expiry:', error);
  //     return true;
  //   }
  // },
};

// Request interceptor to add auth token
export const authRequestInterceptor = async (request) => {
  const token = await TokenManager.getToken();
  
  if (token && !(await TokenManager.isTokenExpired())) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  
  return request;
};

// Response interceptor to handle auth errors
export const authResponseInterceptor = async (response, store) => {
  if (response?.status === 401) {
    // Unauthorized - try to refresh token
    const refreshToken = await TokenManager.getRefreshToken();
    
    if (refreshToken) {
      // Attempt to refresh token
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const newTokens = await refreshResponse.json();
          await TokenManager.storeTokens(newTokens);
          
          // Update store with new tokens
          store.dispatch(setCredentials(newTokens));
          
          // Retry original request
          const originalRequest = response.config;
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          return fetch(originalRequest);
        } else {
          // Refresh failed - logout
          store.dispatch(logout());
          await TokenManager.clearTokens();
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        store.dispatch(logout());
        await TokenManager.clearTokens();
      }
    } else {
      // No refresh token - logout
      store.dispatch(logout());
      await TokenManager.clearTokens();
    }
  }
  
  return response;
};