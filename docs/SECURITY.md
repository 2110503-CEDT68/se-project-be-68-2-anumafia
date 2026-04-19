# Security

Security features and best practices for the JobFair Backend API.

## Overview

The application implements multiple layers of security to protect user data and prevent common web vulnerabilities. Security is built-in and enabled by default.

## Security Features

### 1. Authentication & Authorization

#### JWT (JSON Web Tokens)
- Token-based authentication for stateless API
- Tokens signed with `JWT_SECRET`
- Configurable expiration (default: 30 days)
- Automatic token validation on protected routes

**Best Practices**:
- Store tokens in secure, httpOnly cookies
- Implement token refresh mechanism
- Rotate JWT_SECRET regularly
- Use HTTPS to transmit tokens

#### Password Security
- Passwords hashed with bcrypt (salt rounds: 10)
- Passwords never stored in plain text
- Never returned in API responses (select: false in schema)
- Minimum 6 characters required

**Password Policy**:
```
Minimum Requirements:
- 6+ characters
- Should include numbers and special characters
- Different from previous passwords
```

#### Role-Based Access Control (RBAC)
```
User Roles:
- "user": Standard user role
- "admin": Administrative privileges
```

**Protected Operations**:
- Create/update/delete companies: admin only
- Ban users: admin only
- Access admin routes: role verification required

### 2. Data Validation & Sanitization

#### MongoDB Injection Prevention
- Express MongoDB Sanitization middleware
- Automatically sanitizes:
  - Request body parameters
  - Request URL parameters
  - Request headers
- Removes `$` and `.` characters used in MongoDB operators

**Example Attack Prevention**:
```javascript
// Malicious input
{ "email": { "$ne": null } }

// After sanitization
{ "email": "" }
```

#### XSS (Cross-Site Scripting) Protection
- Express XSS Sanitizer middleware
- Sanitizes all incoming data
- Prevents script injection
- Removes dangerous HTML characters

**Protection Scope**:
- User input fields (name, email, comments)
- Query parameters
- Request headers

#### Input Validation
- Email validation using regex
- Schema-level validation with Mongoose
- Type checking on all fields
- Required field enforcement

### 3. HTTP Security Headers

#### Helmet Middleware
Automatically sets security headers:

```
Strict-Transport-Security     # HTTPS enforcement
X-Frame-Options               # Clickjacking prevention
X-Content-Type-Options        # MIME sniffing prevention
X-XSS-Protection              # Browser XSS filters
Content-Security-Policy       # Script injection prevention
Referrer-Policy               # Referrer information control
```

**Example Headers**:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
```

### 4. Rate Limiting

#### Request Rate Limiting
- **Limit**: 100 requests per 10 minutes per IP
- **Applied to**: All endpoints
- **Headers**: X-RateLimit-* included in responses

**Configuration**:
```javascript
windowMs: 10 * 60 * 1000,  // 10 minutes
max: 100                    // 100 requests
```

**Response Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1626840000
```

**Protection Against**:
- Brute force attacks
- DDoS attacks
- API abuse

### 5. CORS (Cross-Origin Resource Sharing)

#### CORS Configuration
- Enabled for all origins by default
- Can be restricted to specific domains
- Supports credentials (cookies, auth headers)

**Configurable Options**:
```javascript
{
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

### 6. HTTP Parameter Pollution (HPP) Protection

- Prevents parameter pollution attacks
- Removes duplicate parameters
- Protects against filter bypass

**Example Attack Prevention**:
```
Original: ?role=user&role=admin
After HPP: ?role=admin (last value used)
```

### 7. User Account Security

#### Ban System
- Admin can ban users for violations
- Banned users cannot access account
- Reason stored with ban record

```javascript
// User ban structure
ban: {
  isBanned: Boolean,
  reason: String
}
```

#### Yellow Card System
- Warnings for policy violations
- Track warning records with timestamps
- Multiple warnings can lead to bans

```javascript
// Yellow card structure
yellowCards: {
  count: Number,
  records: [
    {
      reason: String,
      issuedAt: Date
    }
  ]
}
```

### 8. HTTPS/TLS

**Recommendations**:
- Always use HTTPS in production
- Obtain SSL certificate (Let's Encrypt, AWS ACM)
- Redirect HTTP to HTTPS
- Use HSTS (HTTP Strict Transport Security)

**Testing HTTPS Locally**:
```bash
# Generate self-signed certificate (development only)
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365

# Start with HTTPS
const https = require('https');
const fs = require('fs');
const app = require('./app');

https.createServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
}, app).listen(3000);
```

## Database Security

### MongoDB Security

#### Authentication
- Use strong credentials
- Enable MongoDB authentication
- Regular credential rotation

#### Encryption
- **In Transit**: Use HTTPS/TLS
- **At Rest**: MongoDB Enterprise Encryption
- **Backups**: Encrypted backup storage

#### Access Control
- Principle of least privilege
- Database user role assignment
- IP whitelisting (MongoDB Atlas)

#### Backup & Recovery
- Regular automated backups
- Test restore procedures
- Off-site backup storage

### Connection String Security
```
SAFE:   mongodb+srv://user:pass@cluster.mongodb.net/db
UNSAFE: mongodb://mongodb.example.com/db (no auth)
```

## Password Reset Security

### Reset Token Flow
1. User requests password reset with email
2. System generates secure reset token
3. Token includes expiration (usually 10-15 minutes)
4. Token sent via email (not reversible)
5. User clicks link, provides new password
6. Token validated before allowing reset

### Implementation Best Practices
- Use cryptographically secure tokens
- Set short expiration times
- Invalidate token after use
- Rate limit password reset requests
- Log password reset attempts

## API Security Checklist

### Development
- [ ] Use HTTPS in development
- [ ] Enable debugging only locally
- [ ] Use environment variables for secrets
- [ ] Validate all user input
- [ ] Implement error handling

### Staging
- [ ] TLS/SSL certificate configured
- [ ] Security headers enabled
- [ ] Rate limiting active
- [ ] Logging and monitoring active
- [ ] Database backups scheduled

### Production
- [ ] HTTPS/TLS enforced (HSTS)
- [ ] All security middleware active
- [ ] Rate limiting tuned
- [ ] Monitoring and alerting active
- [ ] Regular security audits
- [ ] Incident response plan ready
- [ ] Database encryption enabled
- [ ] Secrets management system in place
- [ ] WAF (Web Application Firewall) configured
- [ ] DDoS protection enabled

## Common Vulnerabilities & Mitigations

### SQL Injection
**Mitigation**: Using MongoDB (not SQL) + sanitization
- MongoDB doesn't use SQL syntax
- Sanitization removes injection patterns

### XSS (Cross-Site Scripting)
**Mitigation**: XSS Sanitizer + Content-Security-Policy
- Input sanitization on all fields
- Output encoding on responses
- CSP headers restrict script sources

### CSRF (Cross-Site Request Forgery)
**Mitigation**: JWT tokens + SameSite cookies
- JWT tokens required for state-changing operations
- SameSite cookie policy

### Brute Force Attacks
**Mitigation**: Rate limiting + Account lockout
- 100 requests per 10 minutes limit
- User ban system after violations

### DDoS Attacks
**Mitigation**: Rate limiting + CDN + WAF
- Rate limiting built-in
- Use CDN for static assets
- WAF for advanced protection

## Third-Party Dependencies Security

### Vulnerability Scanning
```bash
# Check for known vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update packages
npm update
```

### Regular Audits
- Monthly security audits
- Keep dependencies updated
- Monitor npm security advisories
- Use Dependabot or Snyk

### Trusted Sources
- Only install from npm registry
- Verify package authenticity
- Review package code before installing
- Check package maintenance status

## Monitoring & Logging

### Security Logging
Log these events:
- Failed login attempts
- Admin operations
- Data access patterns
- API errors (non-sensitive)
- Security events (ban, reset, etc.)

### Monitoring
- Monitor error rates
- Track suspicious patterns
- Alert on security events
- Regular log review

### Access Logs
```
User: user@example.com
Action: login
Status: success
Timestamp: 2024-01-15T10:30:00Z
IP: 192.168.1.1
```

## Security Incident Response

### Incident Categories
1. **Data Breach**: Unauthorized data access
2. **Service Disruption**: API unavailable
3. **Account Compromise**: Unauthorized account access
4. **Malware**: Malicious code detected

### Response Steps
1. **Detect**: Monitor systems for anomalies
2. **Assess**: Determine severity and scope
3. **Contain**: Stop ongoing attack
4. **Eradicate**: Remove threat
5. **Recover**: Restore normal operations
6. **Review**: Post-incident analysis

## Security Testing

### Manual Testing
- Test authentication bypass
- Test authorization bypass
- Test input validation
- Test error handling

### Automated Testing
```bash
# Security linting
npm install --save-dev eslint-plugin-security

# Dependency scanning
npm audit

# OWASP testing
# Use OWASP ZAP or Burp Suite
```

## Resources & References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Security](https://docs.mongodb.com/manual/security/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

## Contact & Reporting

### Security Issues
If you discover a security vulnerability:
1. **Do NOT** create a public GitHub issue
2. Email security details to maintainers
3. Allow time for patch development
4. Responsible disclosure appreciated

### Support
For security questions or concerns, contact the development team.

---

For more information, see [README.md](../README.md) and [API.md](./API.md).
