// navigation.js

/**
 * @typedef {Object} MainTabParamList
 * @property {undefined} Home
 * @property {undefined} Order
 * @property {undefined} Booking
 * @property {undefined} Support
 * @property {undefined} Profile
 */

/**
 * @typedef {Object} OTPVerificationParams
 * @property {'mobile' | 'email'} type
 * @property {string} value
 * @property {'login' | 'registration'} flow
 * @property {string} [tempToken]
 */

/**
 * @typedef {Object} RootStackParamList
 * @property {undefined} Login
 * @property {undefined} SignUp
 * @property {undefined} ForgotPassword
 * @property {OTPVerificationParams} OTPVerification
 * @property {undefined} TwoFactorAuth
 * @property {undefined} MainTabs
 */ 