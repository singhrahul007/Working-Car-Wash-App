// Auth Interceptor
// NOTE: Do NOT import from authSlice here — that causes a circular dependency.
// Redux actions (logout, setCredentials) are accessed via the `store` parameter
// passed into authResponseInterceptor at runtime.
import { API_BASE_URL } from '../base/apiConfig';
import { TokenManager } from '../utils/tokenManager';


// Re-export TokenManager for any files that still import it from here
export { TokenManager } from '../utils/tokenManager';

// Request interceptor to add auth token
export const authRequestInterceptor = async (request) => {
  const token = await TokenManager.getToken();
  
  if (token && !(await TokenManager.isTokenExpired())) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  
  return request;
};

// Response interceptor to handle auth errors
// `store` is injected at runtime — we use store.dispatch() to avoid
// importing directly from authSlice (which would cause a circular dependency)
export const authResponseInterceptor = async (response, store) => {
  if (response?.status === 401) {
    // Unauthorized - try to refresh token
    const refreshToken = await TokenManager.getRefreshToken();

    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const newTokens = await refreshResponse.json();
          await TokenManager.storeAuthData(newTokens);

          // Dynamically import to avoid circular dependency at module load time
          const { setCredentials } = await import('../../store/slices/authSlice');
          store.dispatch(setCredentials(newTokens));

          // Retry original request
          const originalRequest = response.config;
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          return fetch(originalRequest);
        } else {
          // Refresh failed - logout
          const { logout } = await import('../../store/slices/authSlice');
          store.dispatch(logout());
          await TokenManager.clearTokens();
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        const { logout } = await import('../../store/slices/authSlice');
        store.dispatch(logout());
        await TokenManager.clearTokens();
      }
    } else {
      // No refresh token - logout
      const { logout } = await import('../../store/slices/authSlice');
      store.dispatch(logout());
      await TokenManager.clearTokens();
    }
  }

  return response;
};