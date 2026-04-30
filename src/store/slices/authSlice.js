// store/slices/authSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { TokenManager } from '../../api/utils/tokenManager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../utils/api';

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
  accessToken: null,
  token: null,
  refreshToken: null,
  sessionId: null,
  accessTokenExpiry: null,
  refreshTokenExpiry: null,
  isAuthenticated: false,
  requiresOTP: false,
  requires2FA: false,
  isLoading: false,
  error: null,
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
       const {
        user,
        accessToken,
        refreshToken,
        sessionId,
        accessTokenExpiry,
        refreshTokenExpiry,
        requiresOTP,
        requires2FA,
      } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.sessionId = sessionId;
      state.accessTokenExpiry = accessTokenExpiry;
      state.refreshTokenExpiry = refreshTokenExpiry;
      state.isAuthenticated = true;
      state.requiresOTP = requiresOTP || false;
      state.requires2FA = requires2FA || false;
      //state.token = token;
      state.refreshToken = refreshToken;
      state.user = user;
      state.isAuthenticated = true;
      state.error = null;
      state.isLoading = false;
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
    updateTokens: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.accessTokenExpiry = action.payload.accessTokenExpiry;
      state.refreshTokenExpiry = action.payload.refreshTokenExpiry;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.sessionId = null;
      state.isAuthenticated = false;
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

// Add this to your auth slice
export const fetchProfile = createAsyncThunk(
  'Auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/Auth/profile');
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
// Thunk to load auth data from AsyncStorage on app start
export const loadAuthDataFromStorage = () => async (dispatch) => {
  try {
    const authData = await TokenManager.getAuthData();
    
    if (authData && authData.accessToken) {
      // Check if token is expired
      const expiryDate = new Date(authData.accessTokenExpiry);
      const now = new Date();
      if (expiryDate > now) {
        // Token is valid, set credentials
        dispatch(setCredentials(authData));
      } else if (authData.refreshToken) {
        // Token expired but has refresh token
        // Optionally try to refresh here or let interceptor handle it
        dispatch(setCredentials(authData));
      } else {
        // Token expired and no refresh token
        await TokenManager.clearAuthData();
        dispatch(logout());
      }
    } else {
      dispatch(logout());
    }
    } catch (error) {
    console.error('Error loading auth data:', error);
    dispatch(logout());
  } finally {
    dispatch(setLoading(false));
  }
};
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
  updateTokens 
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