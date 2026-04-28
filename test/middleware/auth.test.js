/**
 * Auth Middleware Tests
 * Tests for protect, protectOptional, and authorize middleware
 */

const jwt = require('jsonwebtoken');
const { protect, protectOptional, authorize } = require('../../middleware/auth');
const User = require('../../models/User');

jest.mock('../../models/User');

describe('Auth Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            headers: {},
            user: null
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            setHeader: jest.fn()
        };
        next = jest.fn();
    });

    describe('Protect Middleware', () => {
        test('should return 401 if no token provided', async () => {
            req.headers.authorization = '';

            await protect(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Not authorize to access this route'
            });
            expect(next).not.toHaveBeenCalled();
        });

        test('should return 401 if token is null string', async () => {
            req.headers.authorization = 'Bearer null';

            await protect(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
        });

        test('should extract token from Bearer auth header', async () => {
            const userId = '123456';
            const token = jwt.sign({ id: userId }, process.env.JWT_SECRET);
            req.headers.authorization = `Bearer ${token}`;

            User.findById.mockResolvedValue({
                _id: userId,
                ban: { isBanned: false }
            });

            await protect(req, res, next);

            expect(User.findById).toHaveBeenCalledWith(userId);
            expect(req.user).toBeDefined();
            expect(next).toHaveBeenCalled();
        });

        test('should return 401 for invalid token', async () => {
            req.headers.authorization = 'Bearer invalid.token.here';

            await protect(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Not authorize to access this route'
            });
        });

        test('should return 403 if user is banned', async () => {
            const userId = '123456';
            const token = jwt.sign({ id: userId }, process.env.JWT_SECRET);
            req.headers.authorization = `Bearer ${token}`;

            User.findById.mockResolvedValue({
                _id: userId,
                ban: {
                    isBanned: true,
                    reason: 'Inappropriate behavior'
                }
            });

            await protect(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Your account has been banned',
                reason: 'Inappropriate behavior'
            });
        });

        test('should attach user to request object', async () => {
            const userId = '123456';
            const userData = {
                _id: userId,
                name: 'John Doe',
                email: 'john@example.com',
                role: 'user',
                ban: { isBanned: false }
            };
            const token = jwt.sign({ id: userId }, process.env.JWT_SECRET);
            req.headers.authorization = `Bearer ${token}`;

            User.findById.mockResolvedValue(userData);

            await protect(req, res, next);

            expect(req.user).toEqual(userData);
        });

        test('should handle expired token', async () => {
            const token = jwt.sign({ id: '123456' }, process.env.JWT_SECRET, {
                expiresIn: '-1h'
            });
            req.headers.authorization = `Bearer ${token}`;

            await protect(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
        });

        test('should handle missing authorization header', async () => {
            delete req.headers.authorization;

            await protect(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
        });
    });

    describe('ProtectOptional Middleware', () => {
        test('should allow unauthenticated users without token', async () => {
            await protectOptional(req, res, next);

            expect(req.user).toBeNull();
            expect(next).toHaveBeenCalled();
        });

        test('should allow unauthenticated users with null token', async () => {
            req.headers.authorization = 'Bearer null';

            await protectOptional(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        test('should allow unauthenticated users with empty token', async () => {
            req.headers.authorization = 'Bearer ';

            await protectOptional(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        test('should attach user if valid token provided', async () => {
            const userId = '123456';
            const userData = {
                _id: userId,
                name: 'John Doe',
                ban: { isBanned: false }
            };
            const token = jwt.sign({ id: userId }, process.env.JWT_SECRET);
            req.headers.authorization = `Bearer ${token}`;

            User.findById.mockResolvedValue(userData);

            await protectOptional(req, res, next);

            expect(req.user).toEqual(userData);
            expect(next).toHaveBeenCalled();
        });

        test('should return 403 if valid token but user is banned', async () => {
            const userId = '123456';
            const token = jwt.sign({ id: userId }, process.env.JWT_SECRET);
            req.headers.authorization = `Bearer ${token}`;

            User.findById.mockResolvedValue({
                _id: userId,
                ban: {
                    isBanned: true,
                    reason: 'Banned reason'
                }
            });

            await protectOptional(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Your account has been banned',
                reason: 'Banned reason'
            });
        });

        test('should continue if token is invalid', async () => {
            req.headers.authorization = 'Bearer invalid.token.here';

            await protectOptional(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });

    describe('Authorize Middleware', () => {
        test('should allow user with correct role', () => {
            req.user = {
                id: '123456',
                role: 'admin'
            };

            const middleware = authorize('admin');
            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        test('should reject user with incorrect role', () => {
            req.user = {
                id: '123456',
                role: 'user'
            };

            const middleware = authorize('admin');
            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'User role user is not authorized to access this route'
            });
            expect(next).not.toHaveBeenCalled();
        });

        test('should allow user with any of multiple allowed roles', () => {
            const roles = ['admin', 'company'];
            const middleware = authorize(...roles);

            // Test user role
            req.user = { role: 'user' };
            middleware(req, res, next);
            expect(res.status).toHaveBeenCalledWith(403);

            // Reset mocks
            res.status.mockClear();
            next.mockClear();

            // Test admin role
            req.user = { role: 'admin' };
            middleware(req, res, next);
            expect(next).toHaveBeenCalled();

            // Reset mocks
            next.mockClear();

            // Test company role
            req.user = { role: 'company' };
            middleware(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        test('should handle multiple role authorization', () => {
            const middleware = authorize('admin', 'company', 'user');
            req.user = { role: 'user' };

            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        test('should provide clear error message with user role', () => {
            req.user = {
                id: '123456',
                role: 'user'
            };

            const middleware = authorize('admin');
            middleware(req, res, next);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'User role user is not authorized to access this route'
            });
        });

        test('should handle admin role authorization', () => {
            const middleware = authorize('admin');
            req.user = { role: 'admin' };

            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        test('should handle company role authorization', () => {
            const middleware = authorize('company');
            req.user = { role: 'company' };

            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });

    describe('Token Parsing Edge Cases', () => {
        test('should handle authorization header without Bearer prefix', async () => {
            req.headers.authorization = 'Basic xyz';

            await protect(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
        });

        test('should handle malformed Bearer token', async () => {
            req.headers.authorization = 'Bearer';

            await protect(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
        });

        test('should handle multiple spaces in Bearer token', async () => {
            req.headers.authorization = 'Bearer  token';

            // The middleware should try to verify 'token'
            await protect(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
        });
    });
});
