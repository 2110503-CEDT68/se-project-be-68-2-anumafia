# Getting Started

This guide will help you set up and run the JobFair Backend API.

## Prerequisites

- **Node.js** - v14.0.0 or higher
- **npm** - v6.0.0 or higher (comes with Node.js)
- **MongoDB** - Cloud (MongoDB Atlas) or local instance
- **Git** - For cloning the repository

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/2110503-CEDT68/be-project-68-ihaveksk.git
cd be-project-68-ihaveksk
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages listed in `package.json`.

### 3. Configure Environment Variables

Create a `config/config.env` file in the root directory with the following variables:

```env
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
```

**Important**: Never commit the `config.env` file to version control. It contains sensitive information.

See [Environment Variables](./ENVIRONMENT.md) for detailed information about each variable.

### 4. Start the Server

**Development Mode** (with auto-reload):
```bash
npm run dev
```

**Production Mode**:
```bash
npm start
```

You should see output similar to:
```
Server running in development mode on port 5000
MongoDB Connected: cluster.mongodb.net
```

## First Steps

### 1. Create an Admin User

Use the authentication endpoints to register your first user:

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "tel": "1234567890",
    "password": "securepassword123"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "securepassword123"
  }'
```

The response will include a JWT token. Use this token for authenticated requests in the `Authorization` header.

### 3. Test API Endpoints

See [API Documentation](./API.md) for complete endpoint reference.

## Development Workflow

### Hot Reload

The `npm run dev` command uses `nodemon` for automatic server restart on file changes:

```bash
npm run dev
```

### Project Structure

```
├── config/          # Configuration files
├── controllers/     # Business logic
├── middleware/      # Custom middleware
├── models/          # Database schemas
├── routes/          # API routes
├── docs/            # Documentation
└── server.js        # Entry point
```

See [Project Structure](./STRUCTURE.md) for details.

## Troubleshooting

### MongoDB Connection Failed

- Verify `MONGO_URI` is correct in `config/config.env`
- Check MongoDB cluster is running and accessible
- Ensure IP whitelist includes your machine (for MongoDB Atlas)
- Verify network connectivity

### Port Already in Use

If port 5000 is already in use:
- Change the `PORT` in `config/config.env`
- Or kill the process using the port

### Dependencies Installation Issues

Try clearing npm cache and reinstalling:

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. Read [API Documentation](./API.md) to understand available endpoints
2. Review [Project Structure](./STRUCTURE.md) to understand the codebase
3. Check [Security](./SECURITY.md) for security best practices
4. Review [Environment Variables](./ENVIRONMENT.md) for configuration options

## Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB/Mongoose Documentation](https://mongoosejs.com/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
