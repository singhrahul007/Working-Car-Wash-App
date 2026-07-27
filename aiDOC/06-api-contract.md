# API Contract

## Overview
This document defines the API contract for the Car Wash Application, including endpoints, request/response formats, and authentication mechanisms.

## Authentication
### Authentication Flow
1. User logs in with email/password or social login
2. Server returns JWT token upon successful authentication
3. Token is stored locally and included in subsequent requests
4. Token expires after set period (typically 24 hours)

### Header Requirements
All API requests must include the following header:
```
Authorization: Bearer <jwt-token>
```

## User Management Endpoints

### Register User
```
POST /api/auth/register
```
**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "phone": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "email": "string",
      "firstName": "string",
      "lastName": "string",
      "phone": "string"
    },
    "token": "string"
  }
}
```

### Login User
```
POST /api/auth/login
```
**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "email": "string",
      "firstName": "string",
      "lastName": "string",
      "phone": "string"
    },
    "token": "string"
  }
}
```

### Get User Profile
```
GET /api/users/profile
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "phone": "string",
    "createdAt": "datetime"
  }
}
```

## Booking Endpoints

### Get Available Services
```
GET /api/services
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "price": "number",
      "duration": "number",
      "category": "string"
    }
  ]
}
```

### Create Booking
```
POST /api/bookings
```
**Request Body:**
```json
{
  "serviceId": "string",
  "bookingDate": "datetime",
  "location": {
    "latitude": "number",
    "longitude": "number"
  },
  "additionalNotes": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "userId": "string",
    "serviceId": "string",
    "bookingDate": "datetime",
    "status": "string",
    "totalAmount": "number"
  }
}
```

### Get User Bookings
```
GET /api/bookings/user
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "serviceId": "string",
      "bookingDate": "datetime",
      "status": "string",
      "totalAmount": "number",
      "serviceName": "string"
    }
  ]
}
```

## Payment Endpoints

### Process Payment
```
POST /api/payments
```
**Request Body:**
```json
{
  "bookingId": "string",
  "paymentMethod": "string",
  "amount": "number"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "string",
    "bookingId": "string",
    "status": "string",
    "amount": "number"
  }
}
```

## Location Endpoints

### Get Nearby Service Providers
```
GET /api/providers/nearby?latitude=0&longitude=0&radius=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "distance": "number",
      "rating": "number",
      "availableServices": ["string"]
    }
  ]
}
```

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string",
    "details": "object"
  }
}
```

### Common HTTP Status Codes
- 200 OK - Successful GET, PUT, PATCH
- 201 Created - Successful POST
- 400 Bad Request - Invalid request data
- 401 Unauthorized - Authentication required
- 403 Forbidden - Insufficient permissions
- 404 Not Found - Resource not found
- 500 Internal Server Error - Server error

## Rate Limiting
API requests are limited to:
- 60 requests per minute per IP address
- 1000 requests per hour per authenticated user