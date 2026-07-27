# API Reference

## Overview

This document provides comprehensive documentation for the Car Wash Application's RESTful API. It describes all available endpoints, request/response formats, authentication methods, and error handling.

## Base URL

```
https://api.carwashapp.com/v1/
```

## Authentication

### JWT Token Authentication

All API requests require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

### Token Endpoints

#### Generate Token
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "role": "user",
    "name": "John Doe"
  }
}
```

#### Refresh Token
```
POST /auth/refresh
```

**Request Headers:**
```
Authorization: Bearer <refresh-token>
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

#### Logout
```
POST /auth/logout
```

**Request Headers:**
```
Authorization: Bearer <jwt-token>
```

## User Management

### Get User Profile
```
GET /users/profile
```

**Response:**
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+1234567890",
  "createdAt": "2023-10-15T10:00:00Z",
  "updatedAt": "2023-10-15T10:00:00Z"
}
```

### Update User Profile
```
PUT /users/profile
```

**Request Body:**
```json
{
  "name": "John Smith",
  "phone": "+1987654321"
}
```

**Response:**
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "name": "John Smith",
  "phone": "+1987654321",
  "updatedAt": "2023-10-15T11:00:00Z"
}
```

### Get User Bookings
```
GET /users/bookings
```

**Query Parameters:**
- `status` (optional): Filter by booking status (pending, confirmed, completed, cancelled)
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page

**Response:**
```json
{
  "bookings": [
    {
      "id": "booking-123",
      "serviceId": "service-456",
      "providerId": "provider-789",
      "userId": "user-123",
      "date": "2023-10-20",
      "time": "10:00",
      "status": "confirmed",
      "totalAmount": 45.00,
      "createdAt": "2023-10-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

### Create Booking
```
POST /users/bookings
```

**Request Body:**
```json
{
  "serviceId": "service-456",
  "providerId": "provider-789",
  "date": "2023-10-20",
  "time": "10:00",
  "paymentMethod": "credit_card",
  "notes": "Please use the front entrance"
}
```

**Response:**
```json
{
  "id": "booking-123",
  "serviceId": "service-456",
  "providerId": "provider-789",
  "userId": "user-123",
  "date": "2023-10-20",
  "time": "10:00",
  "status": "pending",
  "totalAmount": 45.00,
  "createdAt": "2023-10-15T10:00:00Z"
}
```

### Cancel Booking
```
PUT /users/bookings/{bookingId}/cancel
```

**Response:**
```json
{
  "id": "booking-123",
  "status": "cancelled",
  "updatedAt": "2023-10-15T10:00:00Z"
}
```

## Services

### Get All Services
```
GET /services
```

**Query Parameters:**
- `category` (optional): Filter by service category
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page

**Response:**
```json
{
  "services": [
    {
      "id": "service-456",
      "name": "Basic Wash",
      "description": "Standard exterior wash with vacuum",
      "category": "basic",
      "price": 25.00,
      "duration": 30,
      "available": true,
      "createdAt": "2023-10-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

### Get Service Details
```
GET /services/{serviceId}
```

**Response:**
```json
{
  "id": "service-456",
  "name": "Basic Wash",
  "description": "Standard exterior wash with vacuum",
  "category": "basic",
  "price": 25.00,
  "duration": 30,
  "available": true,
  "createdAt": "2023-10-15T10:00:00Z"
}
```

## Providers

### Get All Providers
```
GET /providers
```

**Query Parameters:**
- `location` (optional): Filter by location coordinates
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page

**Response:**
```json
{
  "providers": [
    {
      "id": "provider-789",
      "name": "Premium Car Wash",
      "location": {
        "lat": 40.7128,
        "lng": -74.0060
      },
      "rating": 4.5,
      "reviewsCount": 120,
      "available": true,
      "createdAt": "2023-10-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

### Get Provider Details
```
GET /providers/{providerId}
```

**Response:**
```json
{
  "id": "provider-789",
  "name": "Premium Car Wash",
  "location": {
    "lat": 40.7128,
    "lng": -74.0060
  },
  "rating": 4.5,
  "reviewsCount": 120,
  "available": true,
  "services": [
    {
      "id": "service-456",
      "name": "Basic Wash",
      "price": 25.00
    }
  ],
  "createdAt": "2023-10-15T10:00:00Z"
}
```

## Payments

### Create Payment Intent
```
POST /payments/intent
```

**Request Body:**
```json
{
  "amount": 45.00,
  "currency": "usd",
  "bookingId": "booking-123"
}
```

**Response:**
```json
{
  "clientSecret": "pi_123_secret_abc",
  "paymentIntentId": "pi_123"
}
```

### Confirm Payment
```
POST /payments/confirm
```

**Request Body:**
```json
{
  "paymentIntentId": "pi_123",
  "bookingId": "booking-123"
}
```

**Response:**
```json
{
  "status": "succeeded",
  "bookingId": "booking-123",
  "updatedAt": "2023-10-15T10:00:00Z"
}
```

## Notifications

### Get User Notifications
```
GET /notifications
```

**Query Parameters:**
- `read` (optional): Filter by read status
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page

**Response:**
```json
{
  "notifications": [
    {
      "id": "notification-123",
      "title": "Booking Confirmation",
      "message": "Your booking has been confirmed",
      "read": false,
      "createdAt": "2023-10-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

### Mark Notification as Read
```
PUT /notifications/{notificationId}/read
```

**Response:**
```json
{
  "id": "notification-123",
  "read": true,
  "updatedAt": "2023-10-15T10:00:00Z"
}
```

## Error Handling

### Standard Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Unprocessable Entity |
| 500 | Internal Server Error |

### Common Error Codes

| Code | Description |
|------|-------------|
| VALIDATION_ERROR | Input validation failed |
| UNAUTHORIZED | Authentication required |
| FORBIDDEN | Access denied |
| NOT_FOUND | Resource not found |
| INTERNAL_ERROR | Server error |
| SERVICE_UNAVAILABLE | Service temporarily unavailable |

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **User Limit**: 100 requests per hour
- **Global Limit**: 1000 requests per minute
- **Response Headers**:
  ```
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 99
  X-RateLimit-Reset: 1634567890
  ```

## Versioning

API versioning is implemented through the URL path. All endpoints are prefixed with `/v1/`.

## Webhooks

### Booking Status Update
```
POST /webhooks/booking-status
```

**Request Body:**
```json
{
  "bookingId": "booking-123",
  "status": "confirmed",
  "updatedAt": "2023-10-15T10:00:00Z"
}
```

## Testing Endpoints

### Health Check
```
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2023-10-15T10:00:00Z",
  "version": "1.0.0"
}
```

## Pagination

All list endpoints support pagination with the following parameters:
- `page`: Page number (default: 1)
- `limit`: Number of items per page (default: 10, max: 100)

## Response Format

### Standard Success Response
```json
{
  "data": {},
  "meta": {
    "timestamp": "2023-10-15T10:00:00Z",
    "version": "1.0.0"
  }
}
```

### Paginated Response
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  },
  "meta": {
    "timestamp": "2023-10-15T10:00:00Z",
    "version": "1.0.0"
  }
}
```

## Security Considerations

### CORS Configuration
The API supports cross-origin requests from the following domains:
- `https://carwashapp.com`
- `https://www.carwashapp.com`
- `https://staging.carwashapp.com`

### SSL/TLS
All API endpoints require HTTPS connections.

### Input Sanitization
All input data is sanitized to prevent injection attacks.