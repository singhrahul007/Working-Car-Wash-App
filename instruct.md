# Car Wash App - Mobile Application

# AI Assistant Instructions

You are a senior React Native engineer.

Always follow these rules.
## Project Overview

This is a React Native mobile application for car wash services. 

The app provides functionality for:
- User authentication and account management
- Car wash service booking
- Location-based service discovery
- Payment processing
- Service tracking and notifications

## Tech Stack
React Native
TypeScript
Redux Toolkit   

Never introduce unnecessary libraries.

Always reuse existing components.

Always search before creating new files.

Never duplicate logic.

Always create reusable hooks.

Always separate UI and business logic.

Use Redux Toolkit for global state.

Use Context only for theme/auth.

Never use inline styles.

Always use StyleSheet.create.

Always use functional components.

Prefer composition over inheritance.

Always think before coding.
## Project Structure

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
└── README.md                # This file
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- React Native CLI or Expo CLI
- Android Studio or Xcode for mobile development

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Running the Application
```bash
# For iOS
npx react-native run-ios

# For Android  
npx react-native run-android

# Or using Expo
expo start
```

## Key Features

- User authentication (login/signup)
- Service booking system
- Location services integration
- Payment processing
- Push notifications
- Real-time service tracking

## Development Guidelines

1. Follow React Native best practices
2. Use functional components with hooks
3. Implement proper error handling
4. Maintain consistent code style
5. Write component documentation
6. Test on both iOS and Android platforms

## Directory Structure Details

### `src/api/`
Contains all API service files for communication with backend services.

### `src/components/`
Reusable UI components like buttons, cards, forms, etc.

### `src/contexts/`
React Context providers for global state management.

### `src/navigation/`
App navigation configuration using React Navigation.

### `src/screens/`
Main application screens and their associated logic.

### `src/store/`
Redux store configuration and reducers.

### `src/utils/`
Helper functions and utility classes.

## Configuration

The app uses:
- Environment variables for API keys
- Navigation configuration
- Theme settings
- Service configurations

## Testing

Unit tests are located in test directories. Run tests with:
```bash
npm test
# or
yarn test
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

This project is licensed under the MIT License.