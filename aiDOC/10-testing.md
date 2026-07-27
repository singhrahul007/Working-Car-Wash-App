# Testing

## Overview
This document outlines the testing strategy and practices for the Car Wash Application, ensuring code quality, reliability, and maintainability through comprehensive testing.

## Testing Framework

### Jest Setup
The application uses Jest as the primary testing framework with React Native testing utilities:

```javascript
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/test-utils.js',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/',
    '/src/navigation/',
    '/src/store/',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/**/index.js',
  ],
};
```

## Unit Testing

### Component Testing
```javascript
// src/components/__tests__/BookingCard.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BookingCard from '../BookingCard';

describe('BookingCard', () => {
  const mockBooking = {
    id: '1',
    service: 'Basic Wash',
    date: '2023-05-15',
    status: 'confirmed',
    amount: 25.00,
  };

  it('renders booking details correctly', () => {
    const { getByText } = render(
      <BookingCard booking={mockBooking} />
    );

    expect(getByText('Basic Wash')).toBeTruthy();
    expect(getByText('2023-05-15')).toBeTruthy();
    expect(getByText('$25.00')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <BookingCard 
        booking={mockBooking} 
        onPress={onPressMock} 
      />
    );

    fireEvent.press(getByTestId('booking-card'));
    expect(onPressMock).toHaveBeenCalled();
  });
});
```

### Redux Store Testing
```javascript
// src/store/__tests__/authSlice.test.js
import authReducer, { loginSuccess, loginFailure } from '../slices/authSlice';

describe('authReducer', () => {
  const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };

  it('should handle loginSuccess', () => {
    const mockUser = { id: '1', name: 'John Doe' };
    const mockToken = 'fake-token';

    const action = loginSuccess({ user: mockUser, token: mockToken });
    const result = authReducer(initialState, action);

    expect(result.user).toEqual(mockUser);
    expect(result.token).toEqual(mockToken);
    expect(result.isAuthenticated).toBe(true);
    expect(result.loading).toBe(false);
  });

  it('should handle loginFailure', () => {
    const error = 'Invalid credentials';
    const action = loginFailure(error);
    const result = authReducer(initialState, action);

    expect(result.error).toEqual(error);
    expect(result.loading).toBe(false);
  });
});
```

## Integration Testing

### Navigation Integration Tests
```javascript
// src/navigation/__tests__/NavigationTest.js
import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from '../RootNavigator';

describe('Navigation Integration', () => {
  it('renders the main tab navigator without crashing', () => {
    const { toJSON } = render(
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    );
    
    expect(toJSON).not.toBeNull();
  });

  it('navigates to Home screen', () => {
    const { getByText } = render(
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    );
    
    // Check if home screen elements are present
    expect(getByText('Welcome to Car Wash App')).toBeTruthy();
  });
});
```

## Mock Services

### API Service Mocks
```javascript
// src/__mocks__/api.js
const mockApi = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

export default mockApi;

// src/services/__tests__/bookingService.test.js
import api from '../../__mocks__/api';
import { fetchUserBookings, createBooking } from '../bookingService';

describe('Booking Service', () => {
  beforeEach(() => {
    api.get.mockClear();
    api.post.mockClear();
  });

  it('fetches user bookings successfully', async () => {
    const mockResponse = { data: [{ id: '1', service: 'Basic Wash' }] };
    api.get.mockResolvedValue(mockResponse);

    const result = await fetchUserBookings();

    expect(api.get).toHaveBeenCalledWith('/bookings/user');
    expect(result).toEqual(mockResponse.data);
  });

  it('handles booking creation error', async () => {
    const mockError = { response: { data: 'Booking failed' } };
    api.post.mockRejectedValue(mockError);

    await expect(createBooking({})).rejects.toThrow('Booking failed');
  });
});
```

## End-to-End Testing

### Detox Setup
```javascript
// e2e/firstTest.spec.js
describe('Car Wash App First Test', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should have welcome screen', async () => {
    await expect(element(by.text('Welcome to Car Wash App'))).toBeVisible();
  });

  it('should navigate to booking screen', async () => {
    await element(by.id('booking-tab')).tap();
    await expect(element(by.text('Select Service'))).toBeVisible();
  });
});
```

## Testing Best Practices

### Test Organization
1. **File Structure**: 
   - Tests in `__tests__` directory alongside source files
   - Component tests in component directories
   - Integration tests in separate integration directory

2. **Test Naming**:
   ```javascript
   describe('ComponentName', () => {
     describe('when props are provided', () => {
       it('renders correctly with given props', () => {});
     });
     
     describe('on user interaction', () => {
       it('handles click event properly', () => {});
     });
   });
   ```

### Mocking Strategy
1. **API Calls**: Mock all external API calls using Jest mocks
2. **Navigation**: Test navigation behavior without actual navigation
3. **Native Modules**: Mock native modules that are not available in test environment

### Code Coverage
```javascript
// package.json scripts
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "detox test -c ios.sim.debug"
  }
}
```

## Testing Tools and Libraries

### Core Testing Libraries
1. **Jest**: Test runner and assertion library
2. **React Testing Library**: DOM testing utilities
3. **Detox**: End-to-end testing framework for React Native
4. **Redux Mock Store**: For testing Redux-related components

### Utility Functions
```javascript
// src/__tests__/test-utils.js
import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { store } from '../store';

const customRender = (component, options = {}) => {
  const Wrapper = ({ children }) => (
    <Provider store={store}>
      {children}
    </Provider>
  );

  return render(component, { wrapper: Wrapper, ...options });
};

// Re-export all testing library functions
export * from '@testing-library/react-native';
export { customRender as render };
```

## Performance Testing

### Snapshot Testing
```javascript
// src/components/__tests__/BookingCard.snapshot.test.js
import React from 'react';
import renderer from 'react-test-renderer';
import BookingCard from '../BookingCard';

it('BookingCard renders correctly', () => {
  const tree = renderer.create(
    <BookingCard booking={mockBooking} />
  ).toJSON();
  
  expect(tree).toMatchSnapshot();
});
```

### Load Testing
```javascript
// src/__tests__/performance.test.js
import { render } from '@testing-library/react-native';

describe('Performance', () => {
  it('renders large list efficiently', () => {
    const largeData = Array.from({ length: 100 }, (_, i) => ({
      id: i.toString(),
      name: `Item ${i}`,
    }));

    expect(() => {
      render(<LargeList data={largeData} />);
    }).not.toThrow();
  });
});
```

## Continuous Integration

### Test Automation
```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Run coverage
      run: npm run test:coverage
```

## Test Coverage Guidelines

### Minimum Coverage Requirements
1. **Components**: 80% minimum coverage
2. **Reducers**: 90% minimum coverage  
3. **Services**: 70% minimum coverage
4. **Navigation**: 100% coverage for key navigation flows

### Testing Strategy
1. **Unit Tests**: Test individual functions and components
2. **Integration Tests**: Test component interactions and data flow
3. **End-to-End Tests**: Test complete user workflows
4. **Snapshot Tests**: Ensure UI consistency