# Deployment

## Overview
This document outlines the deployment strategy and processes for the Car Wash Application, covering both mobile app deployment and backend service deployment.

## Mobile App Deployment

### iOS Deployment

#### Prerequisites
- Xcode 12 or higher
- Apple Developer Account
- Provisioning Profiles
- Code Signing Certificates

#### Build Process
```bash
# Install dependencies
npm install

# Build for iOS
npx react-native build-ios --mode=Release

# Or using Xcode
# Open project in Xcode and select Release configuration
```

#### Code Signing Configuration
```javascript
// ios/CarWashApp/Info.plist
<key>CFBundleIdentifier</key>
<string>com.carwash.app</string>
<key>CFBundleVersion</key>
<string>1.0.0</string>
<key>CFBundleShortVersionString</key>
<string>1.0.0</string>
```

#### App Store Submission
```bash
# Archive the app
xcodebuild archive \
  -workspace CarWashApp.xcworkspace \
  -scheme CarWashApp \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath CarWashApp.xcarchive

# Export for App Store
xcodebuild -exportArchive \
  -archivePath CarWashApp.xcarchive \
  -exportPath ./build \
  -exportOptionsPlist exportOptions.plist
```

### Android Deployment

#### Prerequisites
- Android Studio
- Android SDK
- Keystore for signing
- Google Play Developer Account

#### Build Process
```bash
# Install dependencies
npm install

# Build for Android
npx react-native build-android --mode=Release

# Generate signed APK
cd android
./gradlew assembleRelease
```

#### Keystore Configuration
```properties
# android/key.properties
storePassword=your_store_password
keyPassword=your_key_password
keyAlias=your_key_alias
storeFile=../path/to/your/keystore.jks
```

#### App Bundle Generation
```bash
# Generate Android App Bundle (AAB)
cd android
./gradlew bundleRelease
```

## Backend Deployment

### API Deployment Strategy

#### Docker Configuration
```dockerfile
# Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - database
    restart: unless-stopped

  database:
    image: postgres:13
    environment:
      POSTGRES_DB: carwash
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

#### Environment Configuration
```javascript
// config/environment.js
const config = {
  development: {
    port: 3000,
    database: {
      host: 'localhost',
      port: 5432,
      name: 'carwash_dev',
    },
  },
  production: {
    port: process.env.PORT || 3000,
    database: {
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT || 5432,
      name: process.env.DATABASE_NAME,
    },
    jwtSecret: process.env.JWT_SECRET,
  },
};

module.exports = config[process.env.NODE_ENV || 'development'];
```

### Cloud Deployment

#### AWS Deployment
```yaml
# serverless.yml
service: carwash-api

provider:
  name: aws
  runtime: nodejs16.x
  region: us-east-1
  environment:
    STAGE: ${opt:stage, 'dev'}
    DATABASE_URL: ${env:DATABASE_URL}
    JWT_SECRET: ${env:JWT_SECRET}

functions:
  api:
    handler: src/handlers/api.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true

resources:
  Resources:
    Database:
      Type: AWS::RDS::DBInstance
      Properties:
        DBInstanceIdentifier: carwash-db
        DBInstanceClass: db.t3.micro
        Engine: postgres
        MasterUsername: admin
        MasterUserPassword: ${env:DB_PASSWORD}
```

#### Heroku Deployment
```bash
# Deploy to Heroku
heroku create carwash-api
heroku config:set NODE_ENV=production
heroku config:set DATABASE_URL=your_database_url
git push heroku main
```

## CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Run linting
      run: npm run lint
      
    - name: Build mobile app
      run: |
        npx react-native build-ios --mode=Release
        npx react-native build-android --mode=Release

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        
    - name: Deploy backend
      run: |
        npm run deploy:backend
        npm run deploy:database
      
    - name: Deploy mobile app
      run: |
        npm run deploy:ios
        npm run deploy:android
```

### Deployment Scripts
```bash
#!/bin/bash
# deploy.sh

echo "Starting deployment..."

# Build mobile app
echo "Building mobile app..."
npx react-native build-ios --mode=Release
npx react-native build-android --mode=Release

# Deploy backend
echo "Deploying backend..."
npm run deploy:backend

# Deploy database
echo "Deploying database..."
npm run deploy:database

echo "Deployment completed successfully!"
```

## Monitoring and Logging

### Application Monitoring
```javascript
// src/utils/monitoring.js
const Sentry = require('@sentry/node');

class Monitor {
  static init() {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 1.0,
    });
  }

  static captureError(error, context) {
    Sentry.captureException(error, {
      contexts: { context },
    });
  }

  static log(message, level = 'info') {
    console.log(`[${new Date().toISOString()}] ${level}: ${message}`);
  }
}

module.exports = Monitor;
```

### Health Checks
```javascript
// src/routes/health.js
const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    database: checkDatabaseConnection(),
  };
  
  res.status(200).json(healthCheck);
});

module.exports = router;
```

## Rollback Strategy

### Mobile App Rollback
```bash
# iOS rollback
# Download previous version from App Store Connect
# Re-upload to TestFlight if needed

# Android rollback
# Use Google Play Console to roll back to previous version
# Update app store listing with rollback notes
```

### Backend Rollback
```bash
# Docker rollback
docker pull carwash/api:previous-version
docker-compose up -d

# Database rollback
# Restore from backup if needed
pg_restore -d carwash_db backup.sql
```

## Security Considerations

### Environment Variables Management
```bash
# .env.example
DATABASE_URL=postgresql://user:password@localhost:5432/carwash
JWT_SECRET=your-super-secret-jwt-key
SENTRY_DSN=https://your-dsn@sentry.io/project
```

### SSL/TLS Configuration
```javascript
// src/server.js
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('/path/to/private-key.pem'),
  cert: fs.readFileSync('/path/to/certificate.pem'),
};

const server = https.createServer(options, app);
server.listen(443);
```

## Performance Optimization

### Caching Strategy
```javascript
// src/utils/cache.js
const redis = require('redis');
const client = redis.createClient();

class Cache {
  static async get(key) {
    return new Promise((resolve, reject) => {
      client.get(key, (err, data) => {
        if (err) reject(err);
        else resolve(data ? JSON.parse(data) : null);
      });
    });
  }

  static async set(key, value, expire = 3600) {
    return new Promise((resolve, reject) => {
      client.setex(key, expire, JSON.stringify(value), (err, reply) => {
        if (err) reject(err);
        else resolve(reply);
      });
    });
  }
}

module.exports = Cache;
```

## Post-Deployment Verification

### Automated Testing
```javascript
# test-deployment.sh
#!/bin/bash

echo "Running post-deployment tests..."

# Test API endpoints
curl -f http://your-api-url/health || exit 1
curl -f http://your-api-url/api/services || exit 1

# Test mobile app functionality
echo "Mobile app tests completed successfully"
```

### User Acceptance Testing
```javascript
# uat-script.js
const { exec } = require('child_process');

exec('detox test -c ios.sim.debug', (error, stdout, stderr) => {
  if (error) {
    console.error(`UAT failed: ${error}`);
    process.exit(1);
  }
  
  console.log('UAT completed successfully');
});
```

## Documentation and Handover

### Deployment Checklist
- [ ] Code reviewed and merged
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Mobile app built and signed
- [ ] Backend deployed and running
- [ ] Monitoring enabled
- [ ] Rollback procedures documented
- [ ] Team notified of deployment

### Release Notes Template
```markdown
# Release Notes - v1.2.0

## Features
- Added new booking workflow
- Implemented user profile management

## Fixes
- Fixed payment processing issue
- Resolved iOS crash on service selection

## Deployment
- Mobile app version 1.2.0 deployed to App Store/Google Play
- Backend API updated with new endpoints
- Database schema updated
```