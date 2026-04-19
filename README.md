[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/5TpXTvuY)

# Online JobFair - Backend

A secure Node.js Express backend API for managing job fair operations, including companies, interviews, and user reviews.

## 📋 Quick Links

- **[Getting Started](./docs/GETTING_STARTED.md)** - Setup and installation instructions
- **[API Documentation](./docs/API.md)** - Complete API endpoints reference
- **[Project Structure](./docs/STRUCTURE.md)** - File organization and architecture
- **[Environment Variables](./docs/ENVIRONMENT.md)** - Configuration guide
- **[Security](./docs/SECURITY.md)** - Security features and best practices

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Configure environment variables
# Create config/config.env with required variables

# Start development server
npm run dev

# Start production server
npm start
```

## ✨ Key Features

- **User Authentication** - JWT-based authentication with refresh tokens
- **Role-Based Access** - User and admin roles with permission control
- **Company Management** - Create, read, update, and manage company profiles
- **Interview System** - Schedule and track interviews
- **Review System** - User reviews for companies and interview experiences
- **Security First** - Built with industry-standard security measures

## 🛡️ Security Features

The API includes multiple security layers:
- XSS Protection
- MongoDB Injection Prevention
- Rate Limiting (100 requests per 10 minutes)
- CORS Configuration
- Security Headers (Helmet)
- HTTP Parameter Pollution Protection
- Password Hashing with bcrypt
- User Flagging System (Yellow Cards & Ban System)

See [Security Documentation](./docs/SECURITY.md) for details.

## 🏗️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, express-mongo-sanitize, express-xss-sanitizer
- **Utilities**: bcryptjs, cookie-parser, cors

## 📦 Project Structure

```
├── config/
│   ├── db.js              # MongoDB connection
│   └── config.env         # Environment variables
├── controllers/           # Business logic
│   ├── auth.js
│   ├── companies.js
│   ├── interviews.js
│   ├── reviews.js
│   └── users.js
├── models/                # Mongoose schemas
│   ├── User.js
│   ├── Company.js
│   ├── Interview.js
│   └── Review.js
├── routes/                # API route definitions
│   ├── auth.js
│   ├── companies.js
│   ├── interviews.js
│   ├── reviews.js
│   └── users.js
├── middleware/            # Custom middleware
│   └── auth.js
├── docs/                  # Documentation
└── server.js              # Application entry point
```

See [Project Structure](./docs/STRUCTURE.md) for detailed information.

## 📚 API Overview

The API provides the following endpoint categories:

- **Authentication** - Register, login, logout, password reset
- **Users** - User profile management and account settings
- **Companies** - Company information and management
- **Interviews** - Interview scheduling and management
- **Reviews** - Submit and view reviews

Full API documentation available at [API Documentation](./docs/API.md).

## 🔧 Installation & Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables in `config/config.env`
4. Start the server: `npm run dev` (development) or `npm start` (production)

See [Getting Started Guide](./docs/GETTING_STARTED.md) for detailed setup instructions.

## 📖 Environment Configuration

The application requires several environment variables to run. Create a `config/config.env` file with:

```
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
```

Full details in [Environment Variables](./docs/ENVIRONMENT.md).

## 🚦 Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with auto-reload
npm test           # Run tests (currently not configured)
```

## 📝 License

ISC

## 🤝 Contributing

For contributions, please refer to the GitHub repository.

## ❓ Support

For issues and questions, visit the [GitHub Issues](https://github.com/2110503-CEDT68/be-project-68-ihaveksk/issues).
