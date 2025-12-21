// # API endpoints, headers, etc.

export const API_BASE_URL = 'http://192.168.1.3:64316/api';
export const API_TIMEOUT = 30000;
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/Auth/register',
    LOGIN: '/Auth/login',
    VERIFY_OTP: '/Auth/verify-otp',
    RESEND_OTP: '/Auth/resend-otp',
    LOGOUT: '/Auth/logout',
    REFRESH_TOKEN: '/Auth/refresh-token',
  },
  USER: {
    PROFILE: '/Users/profile',
    UPDATE_PROFILE: '/Users/profile',
    CHANGE_PASSWORD: '/Users/change-password',
  },
};
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};


export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ?  API_BASE_URL
    : 'http://192.168.1.3:64316/api',
  TIMEOUT: API_TIMEOUT,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};