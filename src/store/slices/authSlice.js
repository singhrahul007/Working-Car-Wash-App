// store/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { TokenManager } from '../../api/interceptors/authInterceptor';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add missing utility functions
const removeToken = async () => {
  try {
    await TokenManager.clearTokens();
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

const removeUserData = async () => {
  try {
    // Clear any user-related data
    await AsyncStorage.removeItem('@user_data');
  } catch (error) {
    console.error('Error removing user data:', error);
  }
};

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  requiresOtp: false,
  otpUserId: null,
  otpSentTo: 'mobile',
  registrationData: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { token, refreshToken, user } = action.payload;
      state.token = token;
      state.refreshToken = refreshToken;
      state.user = user;
      state.isAuthenticated = true;
      state.error = null;
    },
    
    setRegistrationData: (state, action) => {
      state.registrationData = action.payload;
    },
    
    clearRegistrationData: (state) => {
      state.registrationData = null;
    },
    
    setOtpRequired: (state, action) => {
      state.requiresOtp = true;
      state.otpUserId = action.payload.userId;
      state.otpSentTo = action.payload.otpSentTo || 'mobile';
    },
    
    clearOtp: (state) => {
      state.requiresOtp = false;
      state.otpUserId = null;
    },
    
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.registrationData = null;
      state.requiresOtp = false;
      state.otpUserId = null;
      state.error = null;
      state.isLoading = false;
      // Clear storage
      removeToken();
      removeUserData();
    },
  },
});

export const {
  setCredentials,
  setRegistrationData,
  clearRegistrationData,
  setOtpRequired,
  clearOtp,
  setLoading,
  setError,
  clearError,
  logout,
} = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthToken = (state) => state.auth.token;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectRequiresOtp = (state) => state.auth.requiresOtp;
export const selectOtpUserId = (state) => state.auth.otpUserId;
export const selectOtpSentTo = (state) => state.auth.otpSentTo;