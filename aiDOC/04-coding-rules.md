# Coding Rules

## Naming Conventions
- **Components**: PascalCase (e.g., HomeScreen, BookingForm)
- **Files**: PascalCase for components, camelCase for utilities
- **Variables**: camelCase (e.g., userName, bookingDate)
- **Constants**: UPPER_CASE with underscores (e.g., MAX_BOOKING_TIME, API_BASE_URL)
- **Functions**: camelCase (e.g., handleBooking, validateEmail)
- **Classes**: PascalCase (e.g., BookingService, AuthService)

## TypeScript Rules
- All components should have proper TypeScript interfaces
- API response types should be defined with interfaces
- Function parameters and return types should be explicitly typed
- Use generics where appropriate for type safety
- Avoid using `any` type when possible

## Redux Rules
- All state updates must go through Redux reducers
- Action creators should be pure functions
- Reducers must be pure functions without side effects
- Use Redux Toolkit for store configuration
- State structure should be flat and predictable
- Use selectors to extract data from the store

## Hook Rules
- Custom hooks should start with "use" prefix (e.g., useAuth, useBooking)
- Hooks should only be called at the top level of functional components
- Avoid complex logic inside hooks
- Hooks should be reusable across multiple components

## Async Rules
- All API calls should be handled asynchronously
- Use async/await pattern for better readability
- Implement proper error handling for network requests
- Show loading indicators during async operations
- Handle timeout scenarios gracefully

## Error Handling
- Implement global error boundaries
- Catch and handle API errors appropriately
- Display user-friendly error messages
- Log errors for debugging purposes
- Implement retry mechanisms where appropriate

## Logging
- Use console.log for development debugging
- Implement structured logging for production
- Log important user actions and system events
- Ensure sensitive data is not logged
- Use different log levels (debug, info, warn, error)

## File Naming
- Component files: PascalCase.js (e.g., HomeScreen.js)
- Utility files: camelCase.js (e.g., dateUtils.js)
- Service files: camelCase.js (e.g., bookingService.js)
- Configuration files: kebab-case.js (e.g., api-config.js)

## Import Ordering
1. React and React Native imports
2. Third-party library imports
3. Local module imports (in alphabetical order)
4. Relative imports (components, utils, etc.)

## Comment Policy
- Add JSDoc comments for all functions and components
- Document complex logic with inline comments
- Explain the "why" not just the "what"
- Keep comments up-to-date with code changes
- Use consistent comment style throughout the project