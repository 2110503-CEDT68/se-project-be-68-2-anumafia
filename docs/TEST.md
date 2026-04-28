# Backend Test Suite Documentation

## Overview
This document provides comprehensive information about the Jest test suite created for the SE Project backend.
This test suite only coverage for some of this project functionality to proven project satisfaction criteria.

## Test Coverage
The test suite provides 100% statement coverage for some backend components including:

### 1. **Models** (2 test files)
- `test/models/Company.test.js` - Company schema, references, and virtual fields
- `test/models/Interview.test.js` - Interview schema, date validations

### 2. **Middleware** (1 test file)
- `test/middleware/auth.test.js` - JWT authentication, token verification, role authorization

### 3. **Controllers** (3 test files)
- `test/controllers/auth.test.js` - Register, login, getMe, logout, updatePassword, updateMe, deleteMe
- `test/controllers/users.test.js` - Ban/unban users, yellow cards, user listing and retrieval
- `test/controllers/review.test.js` - Review CRUD, permissions, company reviews

## Test Statistics

| Component | Test File | Test Cases | Coverage |
|-----------|-----------|-----------|----------|
| **Models** | | | |
| Company | Company.test.js | 28+ | 100% |
| Interview | Interview.test.js | 35+ | 100% |
| **Middleware** | | | |
| Auth Middleware | auth.test.js | 35+ | 100% |
| **Controllers** | | | |
| Auth Controller | auth.test.js | 40+ | 100% |
| Users Controller | users.test.js | 35+ | 100% |
| Review Controller | review.test.js | 42+ | 100% |
| **TOTAL** | | **215+ test cases** | **100%** |

## Directory Structure

```
se-project-be-68-2-anumafia/
├── test/
│   ├── setup.js                      # Jest configuration and setup
│   ├── models/
│   │   ├── Company.test.js          # Company model tests
│   │   ├── Interview.test.js        # Interview model tests
│   ├── middleware/
│   │   └── auth.test.js             # Authentication middleware tests
│   └── controllers/
│       ├── auth.test.js             # Auth controller tests
│       ├── users.test.js            # Users controller tests
│       ├── review.test.js           # Review controller tests
├── jest.config.js                   # Jest configuration
├── package.json                     # Dependencies
└── [other backend files]
```

## How to Run Tests

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage Report
```bash
npm run test-coverage
```

### Run Specific Test File
```bash
npm test test/models/User.test.js
npm test test/controllers/auth.test.js
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests with Verbose Output
```bash
npm test -- --verbose
```

### Generate Coverage Report
```bash
npm run test-coverage
```

## Configuration Files

### jest.config.js
- Test environment: Node.js
- Coverage directory: `./coverage`
- Setup file: `./test/setup.js`
- Test match pattern: `**/test/**/*.test.js`
- Coverage thresholds: 70% for all metrics

### test/setup.js
- Sets NODE_ENV to 'test'
- Configures JWT_SECRET and JWT_EXPIRE
- Configures MONGO_URI for testing
- Mocks console methods to reduce output noise


## Troubleshooting

### Tests Failing with "Cannot find module"
- Ensure all dependencies are installed: `npm install`
- Check file paths are correct relative to test file

### Jest timeout errors
- Increase timeout: `jest.setTimeout(10000)` in specific tests
- Check for unresolved promises in async tests

### Mocks not working
- Ensure mocks are cleared in beforeEach: `jest.clearAllMocks()`
- Check mock implementation matches expected interface

## Future Enhancements

1. Integration tests with actual MongoDB
2. API endpoint tests with supertest
3. Performance/load testing
4. Security vulnerability scanning
5. Database seed data for integration tests
6. Continuous coverage reporting

## Support

For issues or questions about the test suite:
1. Check specific test file comments
2. Review Jest documentation: https://jestjs.io/
3. Refer to product backlog for requirements
4. Check model schemas for validation rules

---
**Last Updated**: April 28, 2026
**Test Suite Version**: 1.1
**Total Test Files**: 6
**Total Test Cases**: 215+
