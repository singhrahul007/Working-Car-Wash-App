import { baseApi } from '../base/baseApi';

// Type definitions for request/response
export const AuthTypes = {
  // Registration types
  RegisterRequest: {
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    marketingEmails: false,
  },
  
  RegisterResponse: {
    success: false,
    message: '',
    data: {
      userId: '',
      email: '',
      mobile: '',
      requiresOtp: false,
      otpSentTo: '', // 'email' or 'mobile'
    },
  },
  
  // OTP types
  OtpVerifyRequest: {
    userId: '',
    otp: '',
    type: 'email', // 'email' or 'mobile'
  },
  
  OtpVerifyResponse: {
    success: false,
    message: '',
    data: {
      token: '',
      refreshToken: '',
      user: {
        id: '',
        fullName: '',
        email: '',
        mobile: '',
        isVerified: false,
      },
    },
  },
  
  // Resend OTP
  ResendOtpRequest: {
    userId: '',
    type: 'email', // 'email' or 'mobile'
  },
  
  // Login types
  LoginRequest: {
    email: '',
    password: '',
  },
  
  LoginResponse: {
    success: false,
    message: '',
    data: {
      token: '',
      refreshToken: '',
      user: {
        id: '',
        fullName: '',
        email: '',
        mobile: '',
        isVerified: false,
      },
    },
  },
};

// Auth API service
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // User Registration
    registerUser: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      transformResponse: (response) => {
        // Transform response to match our app structure
        return {
          success: response.success,
          message: response.message,
          data: {
            userId: response.data?.userId || response.data?.id,
            email: response.data?.email,
            mobile: response.data?.mobile,
            requiresOtp: response.data?.requiresOtp || true,
            otpSentTo: response.data?.otpSentTo || 'mobile',
          },
        };
      },
      invalidatesTags: ['Auth'],
      // Optimistic updates can be added here
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        // Optimistic update logic if needed
        // dispatch(authSlice.actions.setTempUser(arg));
      },
    }),

    // Verify OTP
    verifyOtp: builder.mutation({
      query: (otpData) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body: otpData,
      }),
      transformResponse: (response) => {
        // Store tokens in AsyncStorage
        if (response.data?.token) {
          // TokenManager.storeTokens(response.data); // Will be called in authSlice
        }
        
        return {
          success: response.success,
          message: response.message,
          data: {
            token: response.data?.token,
            refreshToken: response.data?.refreshToken,
            user: {
              id: response.data?.user?.id,
              fullName: response.data?.user?.fullName,
              email: response.data?.user?.email,
              mobile: response.data?.user?.mobile,
              isVerified: response.data?.user?.isVerified || true,
            },
          },
        };
      },
      invalidatesTags: ['Auth'],
    }),

    // Resend OTP
    resendOtp: builder.mutation({
      query: (resendData) => ({
        url: '/auth/resend-otp',
        method: 'POST',
        body: resendData,
      }),
      transformResponse: (response) => ({
        success: response.success,
        message: response.message,
        data: {
          otpSentTo: response.data?.otpSentTo,
          nextResendIn: response.data?.nextResendIn, // seconds
        },
      }),
    }),

    // Login User
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response) => {
        if (response.data?.token) {
          // TokenManager.storeTokens(response.data);
        }
        
        return {
          success: response.success,
          message: response.message,
          data: {
            token: response.data?.token,
            refreshToken: response.data?.refreshToken,
            user: response.data?.user,
          },
        };
      },
      invalidatesTags: ['Auth'],
    }),

    // Logout User
    logoutUser: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth', 'User'],
    }),

    // Refresh Token
    refreshToken: builder.mutation({
      query: (refreshToken) => ({
        url: '/auth/refresh-token',
        method: 'POST',
        body: { refreshToken },
      }),
    }),

    // Check Email/Mobile Availability
    checkAvailability: builder.query({
      query: ({ field, value }) => ({
        url: `/auth/check-${field}`,
        method: 'GET',
        params: { [field]: value },
      }),
      transformResponse: (response) => ({
        available: response.available,
        message: response.message,
      }),
    }),
  }),
  overrideExisting: false,
});

// Export hooks for usage in components
export const {
  useRegisterUserMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useLoginUserMutation,
  useLogoutUserMutation,
  useRefreshTokenMutation,
  useLazyCheckAvailabilityQuery,
} = authApi;

// Export endpoints for use in other parts of the app
export const authEndpoints = authApi.endpoints;