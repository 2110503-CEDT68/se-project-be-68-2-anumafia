# API Documentation

Complete reference for JobFair Backend API endpoints.

## Base URL

```
http://localhost:5000/api/v1
```

## Authentication

Most endpoints require JWT authentication. Include the token in the request header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are obtained via the login endpoint and expire after the configured duration (default: 30 days).

## Response Format

All responses are in JSON format:

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

**Error Response** (4xx/5xx):
```json
{
  "success": false,
  "error": "Error message"
}
```

## Rate Limiting

- **Rate Limit**: 100 requests per 10 minutes
- **Headers**: Include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Endpoints

### Authentication (`/auth`)

#### Register
- **POST** `/auth/register`
- **Public** (no authentication required)
- **Body**:
  ```json
  {
    "name": "string",
    "email": "string",
    "tel": "string",
    "password": "string"
  }
  ```
- **Response**: User object with JWT token

#### Login
- **POST** `/auth/login`
- **Public**
- **Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**: User object with JWT token

#### Logout
- **GET** `/auth/logout`
- **Private** (authentication required)
- **Response**: Success message

#### Forgot Password
- **POST** `/auth/forgotpassword`
- **Public**
- **Body**: `{ "email": "string" }`
- **Response**: Success message with reset instructions

#### Reset Password
- **PUT** `/auth/resetpassword/:resettoken`
- **Public**
- **Body**: `{ "password": "string", "passwordConfirm": "string" }`
- **Response**: User object with new JWT token

---

### Users (`/users`)

#### Get Current User Profile
- **GET** `/users/me`
- **Private**
- **Response**: Current user object

#### Update User Profile
- **PUT** `/users/updatedetails`
- **Private**
- **Body**:
  ```json
  {
    "name": "string",
    "email": "string",
    "tel": "string"
  }
  ```
- **Response**: Updated user object

#### Update Password
- **PUT** `/users/updatepassword`
- **Private**
- **Body**:
  ```json
  {
    "currentPassword": "string",
    "newPassword": "string",
    "passwordConfirm": "string"
  }
  ```
- **Response**: User object with new JWT token

#### Delete Account
- **DELETE** `/users/deleteMe`
- **Private**
- **Response**: Success message

---

### Companies (`/companies`)

#### Get All Companies
- **GET** `/companies`
- **Public**
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Results per page (default: 10)
  - `search`: Search company name or description
- **Response**: Array of company objects with pagination

#### Get Single Company
- **GET** `/companies/:id`
- **Public**
- **Response**: Company object with related data

#### Create Company
- **POST** `/companies`
- **Private** (admin only)
- **Body**:
  ```json
  {
    "name": "string",
    "description": "string",
    "website": "string",
    "location": "string",
    "industry": "string"
  }
  ```
- **Response**: Created company object

#### Update Company
- **PUT** `/companies/:id`
- **Private** (admin or company owner)
- **Body**: Same as create request
- **Response**: Updated company object

#### Delete Company
- **DELETE** `/companies/:id`
- **Private** (admin only)
- **Response**: Success message

---

### Interviews (`/interviews`)

#### Get All Interviews
- **GET** `/interviews`
- **Private**
- **Query Parameters**:
  - `page`: Page number
  - `limit`: Results per page
  - `status`: Filter by status (scheduled, completed, cancelled)
- **Response**: Array of interview objects

#### Get Single Interview
- **GET** `/interviews/:id`
- **Private**
- **Response**: Interview object

#### Create Interview
- **POST** `/interviews`
- **Private**
- **Body**:
  ```json
  {
    "companyId": "string",
    "position": "string",
    "date": "ISO 8601 datetime",
    "location": "string",
    "interviewType": "string"
  }
  ```
- **Response**: Created interview object

#### Update Interview
- **PUT** `/interviews/:id`
- **Private** (interview creator or admin)
- **Body**: Same as create request
- **Response**: Updated interview object

#### Delete Interview
- **DELETE** `/interviews/:id`
- **Private** (interview creator or admin)
- **Response**: Success message

---

### Reviews (`/reviews`)

#### Get All Reviews
- **GET** `/reviews`
- **Public**
- **Query Parameters**:
  - `companyId`: Filter by company
  - `rating`: Filter by rating (1-5)
  - `page`: Page number
  - `limit`: Results per page
- **Response**: Array of review objects

#### Get Single Review
- **GET** `/reviews/:id`
- **Public**
- **Response**: Review object

#### Create Review
- **POST** `/reviews`
- **Private**
- **Body**:
  ```json
  {
    "companyId": "string",
    "interviewId": "string",
    "rating": "number (1-5)",
    "title": "string",
    "comment": "string",
    "salaryRange": "string",
    "difficulty": "string"
  }
  ```
- **Response**: Created review object

#### Update Review
- **PUT** `/reviews/:id`
- **Private** (review author or admin)
- **Body**: Same as create request
- **Response**: Updated review object

#### Delete Review
- **DELETE** `/reviews/:id`
- **Private** (review author or admin)
- **Response**: Success message

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Unprocessable Entity |
| 429 | Too Many Requests (Rate Limited) |
| 500 | Internal Server Error |

## Best Practices

1. **Always include authentication token** for private endpoints
2. **Use pagination** for list endpoints to improve performance
3. **Validate input data** before sending to API
4. **Handle rate limiting** gracefully in client applications
5. **Store JWT tokens securely** (never in localStorage for sensitive apps)
6. **Implement refresh token rotation** for enhanced security

## Example Requests

### Using cURL

**Register User**:
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "tel": "1234567890",
    "password": "password123"
  }'
```

**Login**:
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Get Companies** (with token):
```bash
curl -X GET http://localhost:5000/api/v1/companies \
  -H "Authorization: Bearer your_jwt_token"
```

### Using JavaScript/Fetch

```javascript
// Register
const response = await fetch('http://localhost:5000/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    tel: '1234567890',
    password: 'password123'
  })
});
const data = await response.json();
console.log(data);
```

## Common Issues

### 401 Unauthorized
- Token is missing or expired
- Re-authenticate and obtain a new token

### 429 Too Many Requests
- Rate limit exceeded
- Wait for the time specified in `X-RateLimit-Reset` header

### 422 Unprocessable Entity
- Invalid input data
- Check request body format and required fields

---

For more information, see [README.md](../README.md) and [Project Structure](./STRUCTURE.md).
