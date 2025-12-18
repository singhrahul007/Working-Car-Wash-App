/**
 * @template T
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {string} message
 * @property {T} data
 */

/* ================= REGISTER ================= */

/**
 * @typedef {Object} RegisterRequest
 * @property {string} fullName
 * @property {string} email
 * @property {string} mobile
 * @property {string} password
 * @property {string} confirmPassword
 * @property {boolean} marketingEmails
 */

/**
 * @typedef {Object} RegisterResponseData
 * @property {string} userId
 * @property {string} email
 * @property {string} mobile
 * @property {boolean} requiresOtp
 * @property {'email' | 'mobile'} otpSentTo
 */

/**
 * @typedef {ApiResponse<RegisterResponseData>} RegisterResponse
 */

/* ================= OTP ================= */

/**
 * @typedef {Object} VerifyOtpRequest
 * @property {string} userId
 * @property {string} otp
 * @property {'email' | 'mobile'} type
 */

/**
 * @typedef {Object} VerifyOtpResponseData
 * @property {string} token
 * @property {string} refreshToken
 * @property {Object} user
 * @property {string} user.id
 * @property {string} user.fullName
 * @property {string} user.email
 * @property {string} user.mobile
 * @property {boolean} user.isVerified
 */

/**
 * @typedef {ApiResponse<VerifyOtpResponseData>} VerifyOtpResponse
 */

export {};
