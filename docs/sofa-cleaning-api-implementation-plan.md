# Sofa Cleaning Module API Implementation - Action Plan

## Current Status Assessment
- AC Service Booking Module: Complete and working
- Sofa Cleaning UI: Complete with dummy data
- Remaining Work: Implement real API integration for sofa cleaning

## Immediate Next Steps

### Step 1: Analyze Existing AC Service Code Structure
Since you've already completed the AC service module, I recommend examining:
- API endpoint patterns used in AC service
- Database models and relationships
- Authentication handling
- Error response formats

### Step 2: Create Sofa Cleaning Module API Endpoints
Based on typical mobile app architecture, implement these endpoints:

#### Core API Endpoints to Implement:
1. **POST /api/sofa-cleaning/book** - Create new sofa cleaning booking
2. **GET /api/sofa-cleaning/services** - Get available sofa cleaning services  
3. **GET /api/sofa-cleaning/pricing** - Get pricing information
4. **GET /api/sofa-cleaning/user-bookings** - Get user's bookings (optional)
5. **PUT /api/sofa-cleaning/cancel/:id** - Cancel booking

### Step 3: Database Implementation Plan
Create the necessary database table for sofa cleaning bookings:

```sql
-- Create sofa_cleaning_bookings table
CREATE TABLE sofa_cleaning_bookings (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    area_size DECIMAL(10,2),
    sofa_type VARCHAR(50),
    booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
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

### Step 4: Implementation Approach

#### API Controller Structure:
```javascript
// Example structure following your AC module pattern
const SofaCleaningController = {
  
  // Create new booking
  createBooking: async (req, res) => {
    try {
      const bookingData = req.body;
      const userId = req.user.id; // Assuming authentication middleware
      
      // Validate input
      if (!bookingData.serviceType || !bookingData.areaSize) {
        return res.status(400).json({
          success: false,
          message: "Required fields missing"
        });
      }
      
      // Calculate pricing
      const totalAmount = calculateSofaCleaningPrice(
        bookingData.areaSize, 
        bookingData.serviceType
      );
      
      // Create booking in database
      const booking = await SofaCleaningDAO.createBooking({
        ...bookingData,
        userId,
        totalAmount,
        status: 'pending'
      });
      
      res.status(201).json({
        success: true,
        data: booking,
        message: "Booking created successfully"
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },
  
  // Get available services
  getServices: async (req, res) => {
    try {
      const services = await SofaCleaningDAO.getServices();
      res.json({
        success: true,
        data: services
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },
  
  // Get pricing information
  getPricing: async (req, res) => {
    try {
      const pricing = await SofaCleaningDAO.getPricing();
      res.json({
        success: true,
        data: pricing
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};
```

### Step 5: Pricing Calculation Logic
```javascript
// Pricing logic for sofa cleaning services
const calculateSofaCleaningPrice = (areaSize, serviceType) => {
  // Base rates per square meter
  const rates = {
    "dry_cleaning": 100,
    "steam_cleaning": 150,
    "spot_cleaning": 80
  };
  
  // Additional base costs for different services
  const baseCosts = {
    "dry_cleaning": 500,
    "steam_cleaning": 700,
    "spot_cleaning": 300
  };
  
  const baseRate = rates[serviceType];
  const baseCost = baseCosts[serviceType];
  
  // Total calculation: base cost + area-based rate
  return baseCost + (areaSize * baseRate);
};

// Available services
const availableServices = [
  { 
    id: "dry_cleaning", 
    name: "Dry Cleaning", 
    description: "Chemical dry cleaning for deep cleaning",
    duration: "2-3 hours"
  },
  { 
    id: "steam_cleaning", 
    name: "Steam Cleaning", 
    description: "Hot water extraction for thorough cleaning",
    duration: "3-4 hours"
  },
  { 
    id: "spot_cleaning", 
    name: "Spot Cleaning", 
    description: "Targeted stain removal and spot treatment",
    duration: "1-2 hours"
  }
];
```

### Step 6: Integration with Existing UI
Update your existing sofa cleaning UI to call these API endpoints instead of using dummy data:

```javascript
// Example API calls from UI
const fetchSofaServices = async () => {
  try {
    const response = await fetch('/api/sofa-cleaning/services');
    const data = await response.json();
    // Update UI with actual services
    updateServiceList(data.data);
  } catch (error) {
    console.error('Error fetching services:', error);
  }
};

const createSofaBooking = async (bookingData) => {
  try {
    const response = await fetch('/api/sofa-cleaning/book', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(bookingData)
    });
    
    const result = await response.json();
    if (result.success) {
      // Handle successful booking
      showBookingConfirmation(result.data);
    }
  } catch (error) {
    console.error('Error creating booking:', error);
  }
};
```

### Step 7: Testing Plan
1. **Unit Tests**: Test each API endpoint individually
2. **Integration Tests**: Test complete workflow from UI to database
3. **Edge Case Testing**: Test with invalid data, missing fields
4. **Performance Testing**: Ensure fast response times

## Next Immediate Actions

1. **Review AC Service Module Code** - Look at how you implemented authentication and error handling
2. **Create Database Migration** - Implement the schema above
3. **Implement Controller Logic** - Start with createBooking endpoint
4. **Connect UI to APIs** - Replace dummy data calls with real API calls
5. **Test End-to-End Flow** - Ensure complete functionality works

## Key Success Indicators

✅ API endpoints return consistent JSON format  
✅ Pricing calculation is accurate and documented  
✅ Integration with existing authentication system  
✅ Error handling follows project conventions  
✅ UI connects properly to new API endpoints  

Would you like me to elaborate on any of these specific implementation steps or provide more detailed code examples for particular components?ssss