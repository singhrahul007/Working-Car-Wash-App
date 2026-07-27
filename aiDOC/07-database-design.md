# Database Design

## Overview
This document outlines the database schema for the Car Wash Application, including tables, relationships, and data models.

## Core Tables

### Users Table
```sql
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Services Table
```sql
CREATE TABLE services (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration INT NOT NULL, -- in minutes
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Bookings Table
```sql
CREATE TABLE bookings (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    service_id VARCHAR(255) NOT NULL,
    booking_date DATETIME NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    additional_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (service_id) REFERENCES services(id)
);
```

### Payments Table
```sql
CREATE TABLE payments (
    id VARCHAR(255) PRIMARY KEY,
    booking_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Service Providers Table
```sql
CREATE TABLE service_providers (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    rating DECIMAL(3,2) DEFAULT 0.00,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Provider Services Table
```sql
CREATE TABLE provider_services (
    id VARCHAR(255) PRIMARY KEY,
    provider_id VARCHAR(255) NOT NULL,
    service_id VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES service_providers(id),
    FOREIGN KEY (service_id) REFERENCES services(id)
);
```

## Relationships

### User to Booking
- One-to-Many relationship
- A user can have multiple bookings
- Each booking belongs to one user

### Service to Booking
- One-to-Many relationship
- A service can be booked multiple times
- Each booking is for one service

### Booking to Payment
- One-to-One relationship
- Each booking has one payment record
- Each payment record corresponds to one booking

### Provider to Services
- Many-to-Many relationship through provider_services table
- A provider can offer multiple services
- A service can be offered by multiple providers

## Indexes

### Users Table Indexes
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

### Bookings Table Indexes
```sql
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
```

### Services Table Indexes
```sql
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_active ON services(is_active);
```

## Data Validation Rules

### Users Table
- Email must be unique and valid format
- Password must meet complexity requirements
- First name and last name are required
- Phone number should be validated for proper format

### Bookings Table
- Booking date cannot be in the past
- Status must be one of: pending, confirmed, completed, cancelled
- Total amount must be positive

### Payments Table
- Amount must be positive
- Payment method must be valid
- Transaction ID is required for successful payments

## Data Retention Policies

### Booking Data
- Active bookings retained indefinitely
- Completed/Cancelled bookings retained for 2 years
- Archive old bookings to separate table

### Payment Data
- Payment records retained for 7 years (accounting requirements)
- Refund records retained for 5 years
- Transaction logs archived monthly

## Performance Considerations

### Query Optimization
- Use indexes on frequently queried columns
- Implement pagination for large result sets
- Cache frequently accessed data
- Optimize JOIN operations between related tables

### Storage Management
- Regular database backups
- Monitor table sizes and optimize storage
- Implement partitioning for large tables
- Archive old data to separate storage