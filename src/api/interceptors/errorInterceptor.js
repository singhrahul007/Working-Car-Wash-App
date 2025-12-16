 //# Error handling

 import { Alert } from 'react-native';
import { Platform } from 'react-native';

// Network error handler
export const handleNetworkError = (error) => {
  if (!navigator.onLine) {
    return {
      message: 'No internet connection',
      code: 'NETWORK_ERROR',
    };
  }
  
  if (error?.message?.includes('timeout')) {
    return {
      message: 'Request timeout. Please try again.',
      code: 'TIMEOUT_ERROR',
    };
  }
  
  return {
    message: 'Network error. Please check your connection.',
    code: 'NETWORK_ERROR',
  };
};

// API error handler
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  // Handle different error types
  switch (error?.status) {
    case 400:
      return {
        message: error?.data?.message || 'Bad request. Please check your input.',
        code: 'BAD_REQUEST',
        validationErrors: error?.data?.errors,
      };
    
    case 401:
      return {
        message: 'Your session has expired. Please login again.',
        code: 'UNAUTHORIZED',
      };
    
    case 403:
      return {
        message: 'You do not have permission to perform this action.',
        code: 'FORBIDDEN',
      };
    
    case 404:
      return {
        message: 'The requested resource was not found.',
        code: 'NOT_FOUND',
      };
    
    case 409:
      return {
        message: error?.data?.message || 'Conflict occurred.',
        code: 'CONFLICT',
      };
    
    case 422:
      return {
        message: 'Validation failed.',
        code: 'VALIDATION_ERROR',
        validationErrors: error?.data?.errors,
      };
    
    case 429:
      return {
        message: 'Too many requests. Please try again later.',
        code: 'RATE_LIMIT',
      };
    
    case 500:
        errorMessage = 'Server error. Please try again later.';
        code : 'SERVER_ERROR';
        break;
    case 502:
        errorMessage = 'Bad gateway. Please try again later.';
        code : 'BAD_GATEWAY';
        break;
    case 503:
        errorMessage = 'Service unavailable. Please try again later.';
        code : 'SERVICE_UNAVAILABLE';
        break;
    case 504:
      return {
        message: 'Server error. Please try again later.',
        code: 'SERVER_ERROR',
      };
    
    default:
      return {
        message:error.message || errorMessage,
        code: 'UNKNOWN_ERROR',
      };  
  }
};

// Show error alert (optional, can be customized)
export const showErrorAlert = (error, customMessage = null) => {
  const errorDetails = handleApiError(error);
  const message = customMessage || errorDetails.message;
  
  if (Platform.OS === 'web') {
    alert(message);
  } else {
    Alert.alert('Error', message, [{ text: 'OK' }]);
  }
  
  return errorDetails;
};

// Error interceptor middleware
export const errorInterceptor = async (args, api, extraOptions) => {
  try {
    const result = await api.baseQuery(args, api, extraOptions);
    
    if (result?.error) {
      const errorDetails = handleApiError(result.error);
      
      // You can dispatch an action to store the error in Redux
      // api.dispatch(setApiError(errorDetails));
      
      // Return enhanced error
      return {
        ...result,
        error: {
          ...result.error,
          ...errorDetails,
          timestamp: new Date().toISOString(),
        },
      };
    }
    
    return result;
  } catch (error) {
    // Handle network errors
    const networkError = handleNetworkError(error);
    
    return {
      error: {
        status: 'NETWORK_ERROR',
        data: networkError,
        timestamp: new Date().toISOString(),
      },
    };
  }
};