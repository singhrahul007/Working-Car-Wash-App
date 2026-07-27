# Architecture

## Clean Architecture Overview
This React Native application follows a clean architecture pattern with clear separation of concerns:

### Layers
1. **Presentation Layer** (src/screens, src/components)
2. **Domain Layer** (src/store, src/contexts)
3. **Data Layer** (src/api)

## Feature-based Architecture
The application is organized by features:
- Authentication and user management
- Booking and service selection
- Payment processing
- Service tracking
- Profile and settings

## Redux Flow
### Store Structure
```
store/
├── index.js          # Root store configuration
├── reducers/         # Redux reducers
├── actions/          # Action creators
├── selectors/        # Selector functions
└── middleware/       # Redux middleware
```

### Data Flow
1. User interacts with UI components
2. Components dispatch actions to Redux store
3. Reducers update the state
4. Selectors extract data for components
5. Components re-render with new data

## API Flow
### API Layer Structure
```
src/api/
├── base/             # Base API configuration
├── interceptors/     # Request/response interceptors
├── services/         # Service-specific API calls
├── types/            # TypeScript interfaces
└── utils/            # API utility functions
```

### Data Flow
1. Components call service functions
2. Services make HTTP requests via axios
3. Interceptors handle authentication and error handling
4. Responses are processed and returned to components
5. Redux store updates with new data

## Folder Dependencies
```
src/
├── api/            → Depends on: utils, services
├── components/     → Depends on: styles, utils
├── contexts/       → Depends on: store, utils  
├── navigation/     → Depends on: screens
├── screens/        → Depends on: components, api, contexts
├── store/          → Depends on: reducers, actions
└── utils/          → Depends on: none (utility functions)
```

## Data Flow
1. **User Interaction** → UI Components
2. **Action Dispatch** → Redux Store
3. **API Call** → Services Layer
4. **Data Processing** → Reducers
5. **State Update** → Components Re-render
6. **Feedback Loop** → User Interface