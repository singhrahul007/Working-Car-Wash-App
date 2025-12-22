import { baseApi } from '../base/baseApi';

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {string} message
 * @property {Object} data
 */
/**
 * @typedef {Object} OTPVerifyResponse
 * @property {boolean} success
 * @property {string} message
 * @property {string} token
 * @property {string} refreshToken
 * @property {string} sessionId
 * @property {string} expiresAt
 * @property {Object} user
 * @property {boolean} requiresOTP
 * @property {boolean} requires2FA
 * @property {string} tempToken
 * @property {string} accessToken
 * @property {string} accessTokenExpiry
 * @property {string} refreshTokenExpiry
 */
/**
 * Auth API Service (JavaScript + RTK Query)
 */
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /* =========================
       REGISTER USER
    ========================== */
    registerUser: builder.mutation({
      query: (userData) => ({
        url: '/Auth/register',
        method: 'POST',
        body: userData,
      }),

      transformResponse: (
        /** @type {ApiResponse} */ response
      ) => {
        return {
          success: response.success,
          message: response.message,
          data: {
            userId: response.data?.userId || response.data?.id,
            email: response.data?.email,
            mobile: response.data?.mobile,
            requiresOtp: response.data?.requiresOtp ?? true,
            otpSentTo: response.data?.otpSentTo ?? 'mobile',
          },
        };
      },

      invalidatesTags: ['Auth'],
    }),

    /* =========================
       VERIFY OTP
    ========================== */
    verifyOtp: builder.mutation({
      query: (otpData) => ({
        url: '/Auth/verify-otp',
        method: 'POST',
        body: otpData,
      }),

      transformResponse: ( /** @type {OTPVerifyResponse} */ response) => {
        console.log("🔍 verify-otp transformResponse received:", response);
    
    return {
      success: response.success,
      message: response.message,
      token: response.token,
      refreshToken: response.refreshToken,
      sessionId: response.sessionId,
      expiresAt: response.expiresAt,
      user: response.user,
      requiresOTP: response.requiresOTP,
      requires2FA: response.requires2FA,
      tempToken: response.tempToken,
      accessToken: response.accessToken || response.token, // Use token if accessToken is empty
      accessTokenExpiry: response.accessTokenExpiry,
      refreshTokenExpiry: response.refreshTokenExpiry,
    };
      },

      invalidatesTags: ['Auth'],
    }),

    /* =========================
       RESEND OTP
    ========================== */
    resendOtp: builder.mutation({
      query: (resendData) => ({
        url: '/Auth/resend-otp',
        method: 'POST',
        body: resendData,
      }),

      transformResponse: (
        /** @type {ApiResponse} */ response
      ) => {
        return {
          success: response.success,
          message: response.message,
          data: {
            otpSentTo: response.data?.otpSentTo,
            nextResendIn: response.data?.nextResendIn,
          },
        };
      },
    }),

    /* =========================
       LOGIN
    ========================== */
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: '/Auth/login',
        method: 'POST',
        body: credentials,
      }),

      transformResponse: (
        /** @type {ApiResponse} */ response
      ) => {
        return {
          success: response.success,
          message: response.message,
          token : response.data?.token,
          refreshToken : response.data?.refreshToken,
          sessionId : response.data?.sessionId,
          expiresAt : response.data?.expiresAt,
          user : response.data?.user,
          requiresOTP : response.data?.requiresOTP,
          requires2FA : response.data?.requires2FA,
          tempToken : response.data?.tempToken,
          accessToken : response.data?.accessToken,
          accessTokenExpiry : response.data?.accessTokenExpiry,
          refreshTokenExpiry : response.data?.refreshTokenExpiry
        };
      },

      invalidatesTags: ['Auth'],
    }),

    /* =========================
       LOGOUT
    ========================== */
    logoutUser: builder.mutation({
      query: () => ({
        url: '/Auth/logout',
        method: 'POST',
      }),

      invalidatesTags: ['Auth', 'User'],
    }),

    /* =========================
       REFRESH TOKEN
    ========================== */
    refreshToken: builder.mutation({
      query: (refreshToken) => ({
        url: '/Auth/refresh-token',
        method: 'POST',
        body: { refreshToken },
      }),
    }),

    /* =========================
       CHECK EMAIL / MOBILE
    ========================== */
    checkAvailability: builder.query({
      query: ({ field, value }) => ({
        url: `/Auth/check-${field}`,
        method: 'GET',
        params: { [field]: value },
      }),

      transformResponse: (
        /** @type {ApiResponse} */ response
      ) => {
        return {
          available: response.data?.available,
          message: response.message,
        };
      },
    }),
  }),

  overrideExisting: false,
});

/* =========================
   EXPORT HOOKS
========================== */
export const {
  useRegisterUserMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useLoginUserMutation,
  useLogoutUserMutation,
  useRefreshTokenMutation,
  useLazyCheckAvailabilityQuery,
} = authApi;

/* =========================
   EXPORT ENDPOINTS
========================== */
export const authEndpoints = authApi.endpoints;
