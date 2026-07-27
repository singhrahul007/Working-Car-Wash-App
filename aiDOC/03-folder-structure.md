# Folder Structure

## Overall Project Structure
```
.
├── src/
│   ├── api/                 # API integration and network calls
│   ├── components/          # Reusable UI components
│   ├── contexts/            # React context providers
│   ├── navigation/          # App navigation setup
│   ├── screens/             # Main application screens
│   ├── store/               # Redux store configuration
│   └── utils/               # Utility functions and helpers
├── assets/                  # Images, fonts, and other static assets
├── App.js                   # Main application component
├── index.js                 # Entry point
├── package.json             # Dependencies and project metadata
└── instruct.md              # Project instructions
```

## Detailed Folder Breakdown

### `src/api/`
Contains all API-related functionality:
- `base/` - Base configuration for API calls
- `interceptors/` - Request/response interceptors
- `services/` - Service-specific API call implementations
- `types/` - TypeScript interfaces and types
- `utils/` - Utility functions for API operations

### `src/components/`
Reusable UI components:
- `common/` - Generic components used across multiple screens
- Feature-specific components

### `src/contexts/`
React Context providers for global state management:
- Authentication context
- Cart context
- Location context
- Theme context

### `src/navigation/`
App navigation configuration:
- Stack navigators
- Tab navigators
- Drawer navigators
- Navigation configuration files

### `src/screens/`
Main application screens and their associated logic:
- HomeScreen.js
- BookingScreen.js
- ProfileScreen.js
- CartScreen.js
- OrdersScreen.js
- OtpScreen.js
- SplashScreen.js
- And many more...

### `src/store/`
Redux store configuration and management:
- Root store setup
- Reducers for different parts of the application
- Action creators
- Middleware configuration

### `src/utils/`
Helper functions and utility classes:
- Data formatting utilities
- Validation functions
- Helper methods
- Constants and configurations

## File Naming Conventions
- Screens: PascalCase (e.g., HomeScreen.js, BookingScreen.js)
- Components: PascalCase (e.g., Button.js, Card.js)
- Services: camelCase (e.g., authService.js, bookingService.js)
- Utilities: camelCase (e.g., dateUtils.js, validation.js)