# State Management

## Overview
This document describes the state management architecture for the Car Wash Application using Redux Toolkit, ensuring predictable and maintainable application state.

## Redux Toolkit Setup

### Store Configuration
The application uses Redux Toolkit for state management with the following configuration:

```javascript
// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import bookingReducer from './slices/bookingSlice';
import userReducer from './slices/userSlice';
import serviceReducer from './slices/serviceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    booking: bookingReducer,
    user: userReducer,
    service: serviceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;
```

## Redux Slices

### Authentication Slice
```javascript
// src/store/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
```

### Booking Slice
```javascript
// src/store/slices/bookingSlice.js
import { createSlice } from '@reduxjs/toolkit';

const bookingSlice = createSlice({
  name: 'booking',
  initialState: {
    bookings: [],
    currentBooking: null,
    loading: false,
    error: null,
  },
  reducers: {
    fetchBookingsStart: (state) => {
      state.loading = true;
    },
    fetchBookingsSuccess: (state, action) => {
      state.loading = false;
      state.bookings = action.payload;
    },
    fetchBookingsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    createBookingStart: (state) => {
      state.loading = true;
    },
    createBookingSuccess: (state, action) => {
      state.loading = false;
      state.bookings.push(action.payload);
    },
    createBookingFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { 
  fetchBookingsStart, 
  fetchBookingsSuccess, 
  fetchBookingsFailure,
  createBookingStart,
  createBookingSuccess,
  createBookingFailure
} = bookingSlice.actions;
export default bookingSlice.reducer;
```

### Service Slice
```javascript
// src/store/slices/serviceSlice.js
import { createSlice } from '@reduxjs/toolkit';

const serviceSlice = createSlice({
  name: 'service',
  initialState: {
    services: [],
    selectedService: null,
    loading: false,
    error: null,
  },
  reducers: {
    fetchServicesStart: (state) => {
      state.loading = true;
    },
    fetchServicesSuccess: (state, action) => {
      state.loading = false;
      state.services = action.payload;
    },
    fetchServicesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    selectService: (state, action) => {
      state.selectedService = action.payload;
    },
  },
});

export const { 
  fetchServicesStart, 
  fetchServicesSuccess, 
  fetchServicesFailure,
  selectService
} = serviceSlice.actions;
export default serviceSlice.reducer;
```

## Async Thunks

### Authentication Thunks
```javascript
// src/store/thunks/authThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
```

### Booking Thunks
```javascript
// src/store/thunks/bookingThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchUserBookings = createAsyncThunk(
  'bookings/fetchUserBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/bookings/user');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createBooking = createAsyncThunk(
  'bookings/createBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await api.post('/bookings', bookingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
```

## Selectors

### Auth Selectors
```javascript
// src/store/selectors/authSelectors.js
export const selectAuthState = (state) => state.auth;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
```

### Booking Selectors
```javascript
// src/store/selectors/bookingSelectors.js
export const selectBookingState = (state) => state.booking;
export const selectBookings = (state) => state.booking.bookings;
export const selectCurrentBooking = (state) => state.booking.currentBooking;
export const selectBookingLoading = (state) => state.booking.loading;
```

## Middleware

### Logging Middleware
```javascript
// src/store/middleware/loggerMiddleware.js
const loggerMiddleware = (store) => (next) => (action) => {
  console.log('Dispatching:', action);
  const result = next(action);
  console.log('Next state:', store.getState());
  return result;
};

export default loggerMiddleware;
```

## State Persistence

### Persist Configuration
```javascript
// src/store/persistConfig.js
import { combineReducers } from 'redux';
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['auth', 'user'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
});

export const persistedReducer = persistReducer(persistConfig, rootReducer);
```

## Best Practices

### Immutable Updates
All state updates are handled through Redux Toolkit's immer library which ensures immutable updates.

### Async Operations
Async operations are handled using createAsyncThunk for consistent error handling and loading states.

### Performance Optimization
- Use useSelector with memoization to prevent unnecessary re-renders
- Implement proper middleware for logging and debugging
- Optimize selectors to avoid recomputation

### Testing
Each slice should have corresponding tests for:
- Initial state
- Reducer functions
- Async thunks
- Selectors