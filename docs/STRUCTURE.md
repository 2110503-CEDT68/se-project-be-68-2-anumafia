# Project Structure

Overview of the JobFair Backend API directory structure and organization.

## Directory Layout

```
be-project-68-ihaveksk/
├── config/
│   ├── db.js                    # MongoDB connection setup
│   └── config.env               # Environment variables (not tracked)
│
├── controllers/
│   ├── auth.js                  # Authentication logic
│   ├── companies.js             # Company management logic
│   ├── interviews.js            # Interview management logic
│   ├── reviews.js               # Review management logic
│   └── users.js                 # User profile management logic
│
├── middleware/
│   └── auth.js                  # JWT authentication middleware
│
├── models/
│   ├── User.js                  # User schema and methods
│   ├── Company.js               # Company schema
│   ├── Interview.js             # Interview schema
│   └── Review.js                # Review schema
│
├── routes/
│   ├── auth.js                  # Authentication routes
│   ├── companies.js             # Company routes
│   ├── interviews.js            # Interview routes
│   ├── reviews.js               # Review routes
│   └── users.js                 # User routes
│
├── docs/
│   ├── API.md                   # API endpoint documentation
│   ├── GETTING_STARTED.md       # Setup and installation guide
│   ├── STRUCTURE.md             # This file - project structure
│   ├── ENVIRONMENT.md           # Environment variables guide
│   └── SECURITY.md              # Security features and practices
│
├── node_modules/                # Installed dependencies
├── package.json                 # Project metadata and dependencies
├── package-lock.json            # Locked dependency versions
├── server.js                    # Application entry point
└── README.md                    # Project overview
```

## File Descriptions

### Configuration (`config/`)

**db.js** - MongoDB Connection
- Initializes MongoDB connection using Mongoose
- Called during server startup
- Uses `MONGO_URI` from environment variables

**config.env** - Environment Configuration
- Contains sensitive configuration (API keys, database URI, secrets)
- Not tracked in version control
- Required for application to run

### Controllers (`controllers/`)

Controllers contain the business logic for handling requests.

**auth.js**
- User registration
- User login/logout
- Password reset functionality
- JWT token generation

**companies.js**
- Fetch companies
- Create new companies
- Update company information
- Delete companies

**interviews.js**
- Fetch interviews
- Create interview schedules
- Update interview details
- Cancel/delete interviews

**reviews.js**
- Fetch user reviews
- Submit new reviews
- Update reviews
- Delete reviews

**users.js**
- Fetch user profiles
- Update user details
- Update passwords
- Delete user accounts

### Middleware (`middleware/`)

**auth.js** - Authentication Middleware
- Verifies JWT tokens
- Extracts user information from tokens
- Protects private routes
- Handles authorization based on user roles

### Models (`models/`)

Mongoose schemas defining database structure.

**User.js**
- User account information
- Role-based access (user/admin)
- Password hashing with bcrypt
- Ban and warning system (yellow cards)
- JWT token generation method

**Company.js**
- Company profile information
- Location and industry details
- Contact information

**Interview.js**
- Interview schedule details
- Company and interviewer references
- Interview status tracking

**Review.js**
- User reviews and ratings
- Interview experience feedback
- Salary range information
- Difficulty assessment

### Routes (`routes/`)

Define API endpoints and map them to controller functions.

**auth.js** - `/api/v1/auth`
- POST /register
- POST /login
- GET /logout
- POST /forgotpassword
- PUT /resetpassword

**companies.js** - `/api/v1/companies`
- GET / (list all)
- GET /:id (single company)
- POST / (create)
- PUT /:id (update)
- DELETE /:id

**interviews.js** - `/api/v1/interviews`
- GET / (list all)
- GET /:id (single interview)
- POST / (create)
- PUT /:id (update)
- DELETE /:id

**reviews.js** - `/api/v1/reviews`
- GET / (list all)
- GET /:id (single review)
- POST / (create)
- PUT /:id (update)
- DELETE /:id

**users.js** - `/api/v1/users`
- GET /me (current user)
- PUT /updatedetails
- PUT /updatepassword
- DELETE /deleteMe

### Documentation (`docs/`)

**API.md** - Complete API endpoint reference and usage examples

**GETTING_STARTED.md** - Installation and setup instructions

**STRUCTURE.md** - This file, describing project organization

**ENVIRONMENT.md** - Environment variables and configuration

**SECURITY.md** - Security features and best practices

### Server Entry Point

**server.js**
- Creates Express application
- Loads environment variables
- Connects to MongoDB
- Sets up middleware (security, CORS, rate limiting, sanitization)
- Mounts route handlers
- Starts HTTP server

## Request Flow

```
Request
  ↓
Middleware (Security, Sanitization, Rate Limiting)
  ↓
Router (matches route path)
  ↓
Route Handler (routes/*.js)
  ↓
Authentication Middleware (if required)
  ↓
Controller (controllers/*.js)
  ↓
Model (models/*.js)
  ↓
Database (MongoDB)
  ↓
Response
```

## Data Models Relationships

```
User
├── Many Interviews
├── Many Reviews
└── Ban & Yellow Card System

Company
├── Many Interviews
└── Many Reviews

Interview
├── Company (foreign key)
├── User (foreign key)
└── Review (optional)

Review
├── Company (foreign key)
├── User (foreign key)
└── Interview (optional)
```

## Security Architecture

```
┌─────────────────┐
│   Client/API    │
└────────┬────────┘
         │
┌────────▼─────────────────┐
│  Express Middleware       │
├───────────────────────────┤
│ • CORS                    │
│ • Rate Limiting           │
│ • Helmet (Security)       │
│ • Body Parser             │
│ • XSS Protection          │
│ • MongoDB Sanitization    │
│ • HPP Protection          │
└────────┬──────────────────┘
         │
┌────────▼──────────────────┐
│  Route/Auth Middleware    │
├───────────────────────────┤
│ • JWT Verification        │
│ • Role Authorization      │
└────────┬──────────────────┘
         │
┌────────▼──────────────────┐
│  Controller Logic         │
├───────────────────────────┤
│ • Business Logic          │
│ • Data Validation         │
└────────┬──────────────────┘
         │
┌────────▼──────────────────┐
│  Database (MongoDB)       │
├───────────────────────────┤
│ • Mongoose Schemas        │
│ • Data Persistence        │
└───────────────────────────┘
```

## Naming Conventions

- **Files**: camelCase (e.g., `auth.js`, `userData.js`)
- **Folders**: lowercase (e.g., `controllers`, `models`)
- **Exports**: PascalCase for classes/models, camelCase for functions
- **Variables**: camelCase (e.g., `userData`, `isAuthenticated`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `JWT_SECRET`)

## File Size Guidelines

- Controllers should be 200-400 lines (split if larger)
- Routes should be 100-200 lines (split if larger)
- Models should be 50-150 lines (split if larger)
- Middleware should be 50-100 lines

## Scalability Considerations

For future growth, consider:

1. **Separate services**: Extract authentication into a microservice
2. **Caching layer**: Add Redis for session and data caching
3. **Message queue**: Use Bull or RabbitMQ for async tasks
4. **API versioning**: Implement v2, v3 endpoints for backward compatibility
5. **Logging**: Add winston or bunyan for centralized logging
6. **Monitoring**: Integrate APM tools (New Relic, DataDog)
7. **Database indexing**: Add indexes for frequently queried fields
8. **Database sharding**: Shard collections for large-scale data

## Common Patterns

### Controller Pattern
```javascript
// controllers/example.js
exports.getAll = async (req, res, next) => {
  try {
    // Business logic
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
```

### Route Pattern
```javascript
// routes/example.js
router.get('/', exampleController.getAll);
```

### Model Pattern
```javascript
// models/Example.js
const schema = new mongoose.Schema({ /* fields */ });
schema.pre('save', async function(next) { /* hooks */ });
module.exports = mongoose.model('Example', schema);
```

## Extending the Project

To add a new feature:

1. Create model in `models/Feature.js`
2. Create controller in `controllers/feature.js`
3. Create routes in `routes/feature.js`
4. Mount routes in `server.js`
5. Add authentication middleware if needed
6. Document in `docs/API.md`

See [API.md](./API.md) for endpoint documentation format.

---

For more information, see [README.md](../README.md) and [GETTING_STARTED.md](./GETTING_STARTED.md).
