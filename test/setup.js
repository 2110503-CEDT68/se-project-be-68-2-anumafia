/**
 * Test Setup Configuration
 * Configures Jest for backend testing
 */

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRE = '7d';
process.env.JWT_COOKIE_EXPIRE = 7;
process.env.MONGO_URI = 'mongodb://localhost:27017/se-project-test';

// Mock console methods to reduce test output noise
global.console.log = jest.fn();
global.console.warn = jest.fn();
global.console.error = jest.fn();
