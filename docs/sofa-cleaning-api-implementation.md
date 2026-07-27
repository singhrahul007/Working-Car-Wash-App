# Sofa Cleaning Module API Implementation Plan

## Project Context
- **AC Service Booking Module**: Complete and working
- **Sofa Cleaning UI**: Complete with dummy data
- **Goal**: Implement API for sofa cleaning module to match AC service module functionality

## Technical Architecture Overview

### Existing AC Service Module Reference
The AC service module provides:
- RESTful API endpoints
- Database integration
- User authentication handling
- Error responses and validation
- Consistent JSON response format

### Sofa Cleaning Module API Requirements

#### Core Endpoints
1. **POST /api/sofa-cleaning/book** - Create new booking
2. **GET /api/sofa-cleaning/services** - Get available services
3. **GET /api/sofa-cleaning/pricing** - Get pricing information
4. **PUT /api/sofa-cleaning/update-status/:id** - Update booking status

## Detailed Implementation Steps

### Phase 1: API Endpoint Design (Day 1)

#### 1.1 Define Request/Response Models
```json
// POST /api/sofa-cleaning/book
{
  "userId": "string",
  "serviceType": "string", // "dry_cleaning", "steam_cleaning", "spot_cleaning"
  "areaSize": "number", // in square meters
  "sofaType": "string", // "couch", "chair", "sectional"
  "bookingDate": "datetime",
  "specialInstructions": "string",
  "contactInfo": {
    "phone": "string",
    "email": "string"
  }
}
```

```json
// Response format (consistent with AC module)
{
  "success": true,
  "data": {
    "bookingId": "string",
    "userId": "string",
    "status": "pending",
    "totalAmount": "number",
    "bookingDate": "datetime"
  },
  "message": "Booking created successfully"
}
```

#### 1.2 Create API Controller Structure
```javascript
// Example controller structure (following AC module pattern)
const SofaCleaningController = {
  createBooking: async (req, res) => {
    // Implementation here
  },
  
  getServices: async (req, res) => {
    // Implementation here
  },
  
  getPricing: async (req, res) => {
    // Implementation here
  },
  
  updateStatus: async (req, res) => {
    // Implementation here
  }
}
```

### Phase 2: Database Integration (Day 2)

#### 2.1 Database Schema Design
```sql
-- Sofa Cleaning Bookings Table
CREATE TABLE sofa_cleaning_bookings (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  service_type VARCHAR(50) NOT NULL,
  area_size DECIMAL(10,2),
  sofa_type VARCHAR(50),
  booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending',
  total_amount DECIMAL(10,2),
  special_instructions TEXT,
  contact_phone VARCHAR(20),
  contact_email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 2.2 Data Access Layer Implementation
```javascript
// Example DAO pattern (following existing project structure)
const SofaCleaningDAO = {
  createBooking: async (bookingData) => {
    // Database insertion logic
  },
  
  getServices: async () => {
    // Get available services from database
  },
  
  calculatePricing: async (areaSize, serviceType) => {
    // Pricing calculation logic
  }
}
```

### Phase 3: Core Logic Implementation (Day 3)

#### 3.1 Pricing Calculation Algorithm
```javascript
// Pricing based on area size and service type
const calculateSofaCleaningPrice = (areaSize, serviceType) => {
  const baseRates = {
    "dry_cleaning": 500,
    "steam_cleaning": 700,
    "spot_cleaning": 300
  };
  
  const ratePerSquareMeter = {
    "dry_cleaning": 100,
    "steam_cleaning": 150,
    "spot_cleaning": 80
  };
  
  // Base service cost + area-based calculation
  const baseCost = baseRates[serviceType];
  const areaCost = areaSize * ratePerSquareMeter[serviceType];
  
  return baseCost + areaCost;
}
```

#### 3.2 Service Type Logic
```javascript
const availableServices = [
  { id: "dry_cleaning", name: "Dry Cleaning", description: "Chemical dry cleaning" },
  { id: "steam_cleaning", name: "Steam Cleaning", description: "Hot water extraction" },
  { id: "spot_cleaning", name: "Spot Cleaning", description: "Targeted stain removal" }
];
```

### Phase 4: Integration with Existing Systems (Day 4)

#### 4.1 Authentication Integration
```javascript
// Ensure consistent authentication handling
const authenticateUser = async (req, res, next) => {
  // Use existing authentication middleware from AC module
}
```

#### 4.2 Error Handling
```javascript
// Consistent error handling pattern
const handleApiError = (res, error, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message: error.message || "Internal server error",
    error: process.env.NODE_ENV === 'development' ? error : {}
  });
}
```

### Phase 5: Testing & Validation (Day 5)

#### 5.1 Unit Tests
```javascript
// Test cases for sofa cleaning module
describe('Sofa Cleaning API', () => {
  test('should create booking successfully', async () => {
    // Test implementation
  });
  
  test('should calculate pricing correctly', async () => {
    // Test implementation
  });
  
  test('should validate required fields', async () => {
    // Test implementation
  });
});
```

#### 5.2 Integration Tests
- Test API endpoints with real database connections
- Verify UI integration with new API
- Check error handling scenarios

## Implementation Timeline

### Day 1: API Design and Structure (4 hours)
- Define API endpoint structure
- Create controller skeleton
- Set up routing configuration
- Implement basic request/response handling

### Day 2: Database Integration (4 hours)
- Create database schema
- Implement data access layer
- Connect to existing database connection pool
- Test database connectivity

### Day 3: Core Logic Implementation (4 hours)
- Implement pricing calculation
- Add service type selection logic
- Create booking status management
- Add validation and error handling

### Day 4: Integration and Refinement (4 hours)
- Integrate with existing authentication system
- Ensure consistency with AC module patterns
- Fix any compatibility issues
- Optimize performance

### Day 5: Testing and Documentation (4 hours)
- Run unit tests
- Execute integration testing
- Document API endpoints
- Prepare for user acceptance testing

## Quality Assurance Checklist

- [ ] API endpoints return consistent JSON format
- [ ] Error handling follows existing project conventions
- [ ] Database schema matches project standards
- [ ] Authentication works consistently with AC module
- [ ] Pricing calculation is accurate and documented
- [ ] All API endpoints are properly tested
- [ ] Code follows existing project coding style
- [ ] Documentation updated for new endpoints

## Success Metrics

1. **Functionality**: Sofa cleaning module works end-to-end with real data
2. **Performance**: API response times < 2 seconds
3. **Consistency**: Matches AC service module user experience patterns
4. **Reliability**: No critical bugs in core functionality
5. **Integration**: Seamless connection between UI and API

## Dependencies

- Existing database connection
- Authentication system (already working)
- Notification system (already implemented)
- Payment processing system (already integrated)

This implementation plan provides a structured approach to completing the sofa cleaning module API, building directly on your existing AC service module as a reference point for consistency and functionality.