# Environment Variables

Configuration guide for the JobFair Backend API.

## Overview

Environment variables are configuration values that are loaded at runtime. They allow you to have different configurations for different environments (development, staging, production) without changing code.

The application loads environment variables from `config/config.env` file using the `dotenv` package.

## Configuration File Setup

Create a `config/config.env` file in the root directory:

```bash
touch config/config.env
```

**Important**: Add `config/config.env` to `.gitignore` to prevent committing sensitive information:

```bash
echo "config/config.env" >> .gitignore
```

## Required Variables

### PORT

- **Type**: Number
- **Default**: 5000
- **Description**: HTTP server port
- **Example**: `PORT=5000`
- **Production Note**: Use port 80 (HTTP) or 443 (HTTPS) with reverse proxy

### NODE_ENV

- **Type**: String
- **Default**: development
- **Allowed Values**: `development`, `production`, `staging`
- **Description**: Application environment mode
- **Example**: `NODE_ENV=development`
- **Behavior**:
  - `development`: Detailed error messages, slower but more helpful
  - `production`: Optimized for performance, minimal error details
  - `staging`: Pre-production testing environment

### MONGO_URI

- **Type**: String
- **Required**: Yes
- **Description**: MongoDB connection string
- **Format**: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
- **Example**: 
  ```
  MONGO_URI=mongodb+srv://user:pass@cluster0.abc123.mongodb.net/jobfair?retryWrites=true&w=majority
  ```
- **Where to Get**:
  - **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
  - Generate connection string from cluster dashboard
  - Replace `<password>` and database name as needed

### JWT_SECRET

- **Type**: String (should be random and long)
- **Required**: Yes
- **Description**: Secret key for JWT token signing
- **Length**: Minimum 32 characters recommended
- **Example**: `JWT_SECRET=your_super_secret_key_at_least_32_chars_long`
- **Security Tips**:
  - Use a strong random string (use openssl or online generator)
  - Different secret for each environment
  - Never share or expose in logs
  - Rotate regularly in production

**Generate a secure JWT secret**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### JWT_EXPIRE

- **Type**: String (time duration)
- **Default**: 30d
- **Description**: JWT token expiration time
- **Format**: [Time Unit](https://github.com/vercel/ms#examples)
- **Examples**:
  - `JWT_EXPIRE=7d` (7 days)
  - `JWT_EXPIRE=24h` (24 hours)
  - `JWT_EXPIRE=30d` (30 days)
  - `JWT_EXPIRE=60m` (60 minutes)
- **Security Consideration**: Shorter expiration = more security, but requires more frequent re-authentication

### JWT_COOKIE_EXPIRE

- **Type**: Number (days)
- **Default**: 30
- **Description**: Cookie expiration time in days
- **Example**: `JWT_COOKIE_EXPIRE=30`
- **Note**: Should match JWT_EXPIRE in days

## Optional Variables

### Example with Recommended Values

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://user:password@cluster0.mongodb.net/jobfair?retryWrites=true&w=majority

# JWT
JWT_SECRET=abcdef123456789abcdef123456789abcdef12345678
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
```

## Environment-Specific Configurations

### Development Environment

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://dev_user:dev_pass@cluster-dev.mongodb.net/jobfair_dev?retryWrites=true&w=majority
JWT_SECRET=dev_secret_key_for_development_only
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7
```

### Production Environment

```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://prod_user:prod_pass@cluster-prod.mongodb.net/jobfair?retryWrites=true&w=majority
JWT_SECRET=super_secure_production_secret_key_change_regularly
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
```

### Staging Environment

```env
PORT=5000
NODE_ENV=staging
MONGO_URI=mongodb+srv://staging_user:staging_pass@cluster-staging.mongodb.net/jobfair_staging?retryWrites=true&w=majority
JWT_SECRET=staging_secret_key_for_testing
JWT_EXPIRE=14d
JWT_COOKIE_EXPIRE=14
```

## Loading Variables in Code

Variables are automatically loaded when the application starts:

```javascript
// server.js
dotenv.config({ path: './config/config.env' });

// Access variables anywhere in the app
const port = process.env.PORT;
const jwtSecret = process.env.JWT_SECRET;
```

## Accessing Variables

In your code, access environment variables via `process.env`:

```javascript
// Example usage
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// With default fallback
const NODE_ENV = process.env.NODE_ENV || 'development';
```

## Validation

Ensure all required variables are set before starting the server:

```javascript
// Validation example
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
```

## Security Best Practices

### 1. Never Commit Secrets
```bash
# Add to .gitignore
echo "config/config.env" >> .gitignore
git rm --cached config/config.env
```

### 2. Use .env.example

Create a `config/config.env.example` template for team members:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_uri_here
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
```

### 3. Secrets Management

For production, use dedicated secrets management:
- **AWS Secrets Manager**
- **Azure Key Vault**
- **HashiCorp Vault**
- **Doppler**
- **GitHub Secrets** (for CI/CD)

### 4. Regular Rotation

- Rotate JWT_SECRET regularly
- Update database credentials periodically
- Use different secrets for each environment

### 5. Access Control

- Limit who has access to production secrets
- Use role-based access control (RBAC)
- Audit secret access logs

## Troubleshooting

### "Cannot find module .env"
- Ensure `dotenv` package is installed: `npm install dotenv`
- Check `config/config.env` file exists

### "MONGO_URI is not defined"
- Add `MONGO_URI` to `config/config.env`
- Verify file path is correct
- Check for typos in variable name

### "MongoDB connection failed"
- Verify `MONGO_URI` is correct
- Check MongoDB cluster is running
- Ensure IP address is whitelisted (for MongoDB Atlas)
- Test connection string with MongoDB client

### "JWT verification failed"
- Ensure `JWT_SECRET` is the same on all instances
- Check token hasn't expired (compare with `JWT_EXPIRE`)
- Verify token format in Authorization header

## Environment Variables Checklist

Before running the application:

- [ ] `config/config.env` file created
- [ ] `PORT` set (default: 5000)
- [ ] `NODE_ENV` set
- [ ] `MONGO_URI` set correctly
- [ ] `JWT_SECRET` set with secure value
- [ ] `JWT_EXPIRE` set
- [ ] `JWT_COOKIE_EXPIRE` set
- [ ] `config/config.env` added to `.gitignore`
- [ ] No variables committed to git

## Docker Integration

When using Docker, pass environment variables at runtime:

```bash
# Using -e flag
docker run -e PORT=5000 -e MONGO_URI=... my-app

# Using .env file
docker run --env-file config/config.env my-app

# Using docker-compose
# In docker-compose.yml:
environment:
  PORT: 5000
  NODE_ENV: production
  MONGO_URI: mongodb+srv://...
```

## References

- [dotenv Documentation](https://www.npmjs.com/package/dotenv)
- [12-Factor App - Config](https://12factor.net/config)
- [Environment Variables Best Practices](https://blog.docker.com/2019/04/12-factor-app-methodology-and-docker/)

---

For more information, see [GETTING_STARTED.md](./GETTING_STARTED.md) and [README.md](../README.md).
