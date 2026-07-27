# Security

## Overview
This document outlines the security practices and measures implemented in the Car Wash Application to protect user data, ensure secure communication, and maintain compliance with industry standards.

## Data Protection

### User Data Handling
```javascript
// src/utils/encryption.js
const crypto = require('crypto');

class DataEncryption {
  static encrypt(data, secret) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', secret);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return `${iv.toString('hex')}:${encrypted}`;
  }

  static decrypt(encryptedData, secret) {
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipher('aes-256-cbc', secret);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

module.exports = DataEncryption;
```

### Secure Storage
```javascript
// src/services/secureStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

class SecureStorage {
  static async setItem(key, value) {
    try {
      const encryptedValue = await this.encrypt(value);
      await AsyncStorage.setItem(key, encryptedValue);
    } catch (error) {
      console.error('Secure storage error:', error);
      throw error;
    }
  }

  static async getItem(key) {
    try {
      const encryptedValue = await AsyncStorage.getItem(key);
      if (encryptedValue) {
        return await this.decrypt(encryptedValue);
      }
      return null;
    } catch (error) {
      console.error('Secure storage error:', error);
      throw error;
    }
  }

  static async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Secure storage error:', error);
      throw error;
    }
  }
}

export default SecureStorage;
```

## Authentication and Authorization

### JWT Implementation
```javascript
// src/services/authService.js
const jwt = require('jsonwebtoken');

class AuthService {
  static generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
    };

    return jwt.sign(payload, process.env.JWT_SECRET);
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static authenticate(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied' });
    }

    try {
      const decoded = this.verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
}

module.exports = AuthService;
```

### Password Security
```javascript
// src/utils/password.js
const bcrypt = require('bcrypt');

class PasswordUtils {
  static async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

module.exports = PasswordUtils;
```

## API Security

### Rate Limiting
```javascript
// src/middleware/rateLimit.js
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login requests per windowMs
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { apiLimiter, loginLimiter };
```

### Input Validation
```javascript
// src/middleware/validation.js
const { body, validationResult } = require('express-validator');

const validateBooking = [
  body('serviceId')
    .notEmpty()
    .withMessage('Service ID is required'),
  body('date')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('time')
    .isTime()
    .withMessage('Invalid time format'),
  body('customerName')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }
    next();
  },
];

module.exports = { validateBooking };
```

## Network Security

### HTTPS Configuration
```javascript
// src/server.js
const https = require('https');
const fs = require('fs');
const express = require('express');

const app = express();

// Enable HTTPS
const options = {
  key: fs.readFileSync('./certs/private-key.pem'),
  cert: fs.readFileSync('./certs/certificate.pem'),
  ca: fs.readFileSync('./certs/ca-cert.pem'),
  // Security headers
  secureProtocol: 'TLSv1.2_method',
  ciphers: [
    'ECDHE-RSA-AES256-GCM-SHA512',
    'DHE-RSA-AES256-GCM-SHA512',
    'ECDHE-RSA-AES256-GCM-SHA384',
    'DHE-RSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES256-SHA384',
    'DHE-RSA-AES256-SHA384',
  ].join(':'),
  honorCipherOrder: true,
};

const server = https.createServer(options, app);
server.listen(443, () => {
  console.log('HTTPS Server running on port 443');
});
```

### CORS Configuration
```javascript
// src/middleware/cors.js
const cors = require('cors');

const corsOptions = {
  origin: [
    'https://carwash.app',
    'com.carwash.app://*',
    'http://localhost:3000',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200,
};

const corsMiddleware = cors(corsOptions);

module.exports = corsMiddleware;
```

## Mobile App Security

### Secure Navigation
```javascript
// src/navigation/SecureNavigator.js
import { createStackNavigator } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';

function SecureStack() {
  const Stack = createStackNavigator();

  // Ensure authentication before navigating to protected screens
  const ProtectedScreen = ({ component: Component, ...props }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    useFocusEffect(
      React.useCallback(() => {
        checkAuthStatus().then(setIsAuthenticated);
      }, [])
    );

    if (!isAuthenticated) {
      return <LoginScreen />;
    }

    return <Component {...props} />;
  };

  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ProtectedHome" 
        component={ProtectedScreen} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
```

### Secure Data Transmission
```javascript
// src/services/apiClient.js
class ApiClient {
  constructor() {
    this.baseURL = process.env.API_BASE_URL;
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'X-Content-Type-Options': 'nosniff',
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}
```

## Security Headers

### HTTP Security Headers
```javascript
// src/middleware/securityHeaders.js
const helmet = require('helmet');

const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  frameguard: {
    action: 'deny',
  },
  xssFilter: true,
  noSniff: true,
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

module.exports = securityHeaders;
```

## Security Testing

### Vulnerability Scanning
```javascript
// test/security.js
const { scan } = require('npm-audit');
const { execSync } = require('child_process');

describe('Security Tests', () => {
  test('should not have vulnerable dependencies', async () => {
    const auditResult = await scan();
    
    expect(auditResult.vulnerabilities).toEqual(0);
  });

  test('should pass security linting', () => {
    const output = execSync('npm run security:lint');
    expect(output.toString()).toBe('');
  });
});
```

### Penetration Testing
```bash
# Security testing script
#!/bin/bash

echo "Running security tests..."

# Check for vulnerable dependencies
npm audit --audit-level=moderate

# Run security linters
npm run security:lint

# Test API endpoints for common vulnerabilities
npx owasp-threat-dragon

echo "Security testing completed"
```

## Compliance and Standards

### GDPR Compliance
```javascript
// src/utils/gdpr.js
class GDPRCompliance {
  static anonymizeUserData(userData) {
    const anonymized = { ...userData };
    
    // Remove personally identifiable information
    delete anonymized.email;
    delete anonymized.phone;
    delete anonymized.address;
    
    return anonymized;
  }

  static generateConsentForm() {
    return {
      version: '1.0',
      timestamp: new Date().toISOString(),
      consentItems: [
        'Personal data collection',
        'Data processing purposes',
        'Data retention period',
        'User rights',
      ],
    };
  }
}

module.exports = GDPRCompliance;
```

### PCI DSS Compliance
```javascript
// src/utils/paymentSecurity.js
class PaymentSecurity {
  static validateCardNumber(cardNumber) {
    // Implement Luhn algorithm validation
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      return false;
    }
    
    let sum = 0;
    let isEven = false;
    
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber.charAt(i));
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  static sanitizePaymentData(data) {
    // Remove sensitive information from logs
    const sanitized = { ...data };
    delete sanitized.cardNumber;
    delete sanitized.cvv;
    delete sanitized.expiryDate;
    
    return sanitized;
  }
}

module.exports = PaymentSecurity;
```

## Incident Response

### Security Incident Reporting
```javascript
// src/utils/incidentLogger.js
class IncidentLogger {
  static logSecurityIncident(incident) {
    const incidentReport = {
      timestamp: new Date().toISOString(),
      type: incident.type,
      severity: incident.severity,
      description: incident.description,
      affectedUsers: incident.affectedUsers || [],
      mitigationSteps: incident.mitigationSteps || [],
      status: 'open',
    };

    // Log to security monitoring system
    console.warn('Security Incident:', incidentReport);
    
    // Send alert to security team
    this.sendAlert(incidentReport);
  }

  static sendAlert(incident) {
    // Implement alerting mechanism (email, Slack, etc.)
    console.log(`ALERT: Security incident detected - ${incident.type}`);
  }
}

module.exports = IncidentLogger;
```

## Regular Security Updates

### Security Update Schedule
```javascript
// src/utils/securityUpdater.js
class SecurityUpdater {
  static async checkForUpdates() {
    const updates = await fetch('https://api.security-updates.com/carwash-app')
      .then(res => res.json());
    
    if (updates.urgent) {
      this.alertUrgentUpdate(updates);
    } else if (updates.recommended) {
      this.scheduleUpdate(updates);
    }
  }

  static alertUrgentUpdate(updates) {
    console.error('URGENT SECURITY UPDATE REQUIRED:', updates.description);
    // Force app update or display critical alert
  }

  static scheduleUpdate(updates) {
    console.log('Security update available:', updates.version);
    // Schedule update notification
  }
}

module.exports = SecurityUpdater;
```

## Documentation and Training

### Security Best Practices
```markdown
# Security Best Practices

## Development Guidelines
- Never commit sensitive data to version control
- Use environment variables for configuration
- Implement proper input validation
- Regularly update dependencies
- Follow secure coding practices

## Deployment Security
- Enable HTTPS on all endpoints
- Configure proper CORS settings
- Implement rate limiting
- Use security headers
- Regular vulnerability scanning

## User Data Protection
- Encrypt sensitive data at rest
- Hash passwords with bcrypt
- Implement proper authentication
- Regular security audits
```

This comprehensive security documentation provides a foundation for maintaining the security of the Car Wash Application, covering everything from data protection and authentication to compliance and incident response. Regular updates and reviews should be conducted to adapt to new threats and requirements.