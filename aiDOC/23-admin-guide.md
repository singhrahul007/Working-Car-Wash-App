# Admin Guide

## Overview

This guide provides comprehensive instructions for administrators managing the Car Wash Application. It covers system administration, user management, service configuration, and operational procedures.

## System Requirements

### Hardware Requirements

#### Server Specifications
- **CPU**: Minimum 4 cores (8+ recommended)
- **Memory**: 8GB RAM minimum (16GB+ recommended)
- **Storage**: 50GB SSD minimum (100GB+ recommended)
- **Network**: 100Mbps bandwidth minimum

#### Database Requirements
- **Database Engine**: PostgreSQL 13 or higher
- **Storage**: 100GB minimum for production environments
- **Backup Strategy**: Daily automated backups with 7-day retention

### Software Requirements

#### Operating System
- Ubuntu 20.04 LTS or later
- CentOS 8 or later
- Windows Server 2019 or later (for Windows deployment)

#### Dependencies
- Node.js 16.x or higher
- Docker 20.10 or higher
- Nginx 1.18 or higher
- Redis 6.0 or higher

## Installation and Setup

### Prerequisites

1. **Update System Packages**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install Docker**
   ```bash
   sudo apt-get update
   sudo apt-get install docker.io
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

4. **Install Git**
   ```bash
   sudo apt-get install git
   ```

### Application Deployment

#### Clone Repository
```bash
git clone https://github.com/carwashapp/car-wash-app.git
cd car-wash-app
```

#### Environment Configuration
1. Create `.env` file from template:
   ```bash
   cp .env.example .env
   ```

2. Configure environment variables:
   ```env
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=postgresql://user:password@localhost:5432/carwashdb
   JWT_SECRET=your-super-secret-jwt-key
   REDIS_URL=redis://localhost:6379
   ```

#### Database Setup
1. **Create PostgreSQL Database**
   ```sql
   CREATE DATABASE carwashdb;
   CREATE USER carwashuser WITH PASSWORD 'securepassword';
   GRANT ALL PRIVILEGES ON DATABASE carwashdb TO carwashuser;
   ```

2. **Run Migrations**
   ```bash
   npm run migrate:up
   ```

#### Build Application
```bash
npm install
npm run build
```

#### Start Services
```bash
npm run start:prod
```

### Docker Deployment

#### Docker Compose Setup
Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@db:5432/carwashdb
    depends_on:
      - db
      - redis

  db:
    image: postgres:13
    environment:
      POSTGRES_DB: carwashdb
      POSTGRES_USER: carwashuser
      POSTGRES_PASSWORD: securepassword
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6-alpine

volumes:
  postgres_data:
```

#### Deploy with Docker Compose
```bash
docker-compose up -d
```

## User Management

### Administrator Access

#### Creating Admin Accounts
1. **Via CLI**
   ```bash
   npm run create-admin -- --email admin@carwashapp.com --password securepassword --name "Admin User"
   ```

2. **Via API**
   ```bash
   curl -X POST https://api.carwashapp.com/v1/admin/users \
     -H "Authorization: Bearer <admin-token>" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@carwashapp.com",
       "password": "securepassword",
       "name": "Admin User",
       "role": "admin"
     }'
   ```

#### Role-Based Access Control
- **User**: Basic app functionality
- **Provider**: Manage own services and bookings
- **Admin**: Full system access and management

### Managing Users

#### View All Users
```bash
curl -X GET https://api.carwashapp.com/v1/admin/users \
  -H "Authorization: Bearer <admin-token>"
```

#### Update User Information
```bash
curl -X PUT https://api.carwashapp.com/v1/admin/users/{userId} \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "status": "active"
  }'
```

#### Deactivate User Accounts
```bash
curl -X PUT https://api.carwashapp.com/v1/admin/users/{userId}/deactivate \
  -H "Authorization: Bearer <admin-token>"
```

## Service Management

### Adding New Services

#### Via Admin Dashboard
1. Navigate to "Services" section
2. Click "Add New Service"
3. Fill in service details:
   - Name and description
   - Category and pricing
   - Duration and availability
   - Service requirements

#### Via API
```bash
curl -X POST https://api.carwashapp.com/v1/admin/services \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Detailing",
    "description": "Complete interior and exterior detailing",
    "category": "detailing",
    "price": 85.00,
    "duration": 120,
    "available": true
  }'
```

### Managing Service Categories

#### Create Category
```bash
curl -X POST https://api.carwashapp.com/v1/admin/categories \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Services",
    "description": "High-end car washing services"
  }'
```

#### Update Category
```bash
curl -X PUT https://api.carwashapp.com/v1/admin/categories/{categoryId} \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Luxury Services",
    "description": "Premium car washing and detailing"
  }'
```

## Provider Management

### Adding New Providers

#### Via Admin Dashboard
1. Navigate to "Providers" section
2. Click "Add New Provider"
3. Enter provider information:
   - Name and contact details
   - Location coordinates
   - Service offerings
   - Availability schedules

#### Via API
```bash
curl -X POST https://api.carwashapp.com/v1/admin/providers \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Car Wash",
    "location": {
      "lat": 40.7128,
      "lng": -74.0060
    },
    "contact": {
      "phone": "+1234567890",
      "email": "info@premiumcarwash.com"
    },
    "services": ["service-123", "service-456"]
  }'
```

### Managing Provider Status

#### Activate/Deactivate Providers
```bash
curl -X PUT https://api.carwashapp.com/v1/admin/providers/{providerId}/status \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active"
  }'
```

#### Update Provider Services
```bash
curl -X PUT https://api.carwashapp.com/v1/admin/providers/{providerId}/services \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "services": ["service-123", "service-456", "service-789"]
  }'
```

## Booking Management

### Viewing All Bookings

#### API Endpoint
```bash
curl -X GET https://api.carwashapp.com/v1/admin/bookings \
  -H "Authorization: Bearer <admin-token>"
```

#### Filtering Options
```bash
curl -X GET "https://api.carwashapp.com/v1/admin/bookings?status=confirmed&date=2023-12-01" \
  -H "Authorization: Bearer <admin-token>"
```

### Managing Booking Status

#### Update Booking Status
```bash
curl -X PUT https://api.carwashapp.com/v1/admin/bookings/{bookingId}/status \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'
```

#### Cancel Booking
```bash
curl -X PUT https://api.carwashapp.com/v1/admin/bookings/{bookingId}/cancel \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Admin cancellation"
  }'
```

## Reporting and Analytics

### System Reports

#### Daily Activity Report
```bash
curl -X GET https://api.carwashapp.com/v1/admin/reports/daily \
  -H "Authorization: Bearer <admin-token>"
```

#### Revenue Report
```bash
curl -X GET "https://api.carwashapp.com/v1/admin/reports/revenue?start=2023-12-01&end=2023-12-31" \
  -H "Authorization: Bearer <admin-token>"
```

#### User Activity Report
```bash
curl -X GET https://api.carwashapp.com/v1/admin/reports/users \
  -H "Authorization: Bearer <admin-token>"
```

### Custom Analytics

#### Creating Custom Reports
1. Navigate to "Analytics" section in admin dashboard
2. Select report type and date range
3. Configure filters and parameters
4. Generate and export report

#### Export Options
- CSV format for spreadsheet analysis
- PDF format for presentations
- JSON format for programmatic access

## Security Management

### Authentication and Authorization

#### JWT Configuration
```env
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
```

#### Session Management
- Session timeout: 24 hours
- Auto-logout after inactivity
- Secure cookie settings

### Data Protection

#### Encryption Settings
```env
ENCRYPTION_KEY=your-encryption-key-here
DATABASE_ENCRYPTION=true
```

#### Backup Strategy
- Daily automated backups
- Weekly full system snapshots
- Offsite backup storage
- Regular backup verification tests

### Audit Logs

#### Log Management
```bash
# View recent audit logs
tail -f /var/log/carwash/audit.log

# Export logs for analysis
curl -X GET https://api.carwashapp.com/v1/admin/logs \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "start": "2023-12-01",
    "end": "2023-12-31"
  }'
```

## Performance Monitoring

### System Health Checks

#### CPU and Memory Usage
```bash
# Check system resources
top
htop

# Monitor specific processes
ps aux | grep carwash
```

#### Database Performance
```sql
-- Check database performance
SELECT * FROM pg_stat_database WHERE datname = 'carwashdb';
```

### Alert Configuration

#### Email Alerts
- System performance thresholds
- Error rate notifications
- Backup failure alerts

#### Slack Integration
- Real-time system status updates
- Critical error notifications
- Automated maintenance reminders

## Maintenance Procedures

### Regular Updates

#### Code Updates
```bash
git pull origin main
npm install
npm run build
```

#### Database Migrations
```bash
npm run migrate:up
```

### Backup and Recovery

#### Manual Backup
```bash
# Database backup
pg_dump carwashdb > backup_$(date +%F).sql

# Application data backup
tar -czf app_backup_$(date +%F).tar.gz /var/lib/carwashapp
```

#### Disaster Recovery Plan
1. **Data Recovery**
   - Restore from latest backup
   - Verify data integrity
   - Test restored system functionality

2. **Service Restoration**
   - Restart failed services
   - Validate network connectivity
   - Confirm user access

### Performance Optimization

#### Database Optimization
```sql
-- Analyze database performance
ANALYZE;

-- Vacuum database
VACUUM ANALYZE;
```

#### Cache Management
```bash
# Clear Redis cache
redis-cli flushall

# Restart application cache
npm run cache:clear
```

## Troubleshooting

### Common Issues and Solutions

#### Application Not Starting
1. Check service status:
   ```bash
   systemctl status carwash-app
   ```

2. Review logs:
   ```bash
   journalctl -u carwash-app
   ```

3. Verify dependencies are installed:
   ```bash
   npm list
   ```

#### Database Connection Issues
1. Test database connectivity:
   ```bash
   psql -h localhost -U carwashuser -d carwashdb
   ```

2. Check configuration settings:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/carwashdb
   ```

#### Performance Degradation
1. Monitor system resources:
   ```bash
   iostat
   vmstat
   ```

2. Analyze query performance:
   ```sql
   EXPLAIN ANALYZE SELECT * FROM bookings WHERE status = 'pending';
   ```

### Support Resources

#### Documentation
- Complete API documentation
- Admin panel user guides
- System architecture diagrams

#### Community Support
- Official support forums
- GitHub issue tracker
- Slack community channels

## Conclusion

This admin guide provides comprehensive instructions for managing the Car Wash Application. Regular maintenance, proper security practices, and consistent monitoring are essential for optimal system performance and user satisfaction.

Always ensure you have current backups before performing major updates or changes to the system.