/**
 * Auth Controller Tests
 * Tests for register, login, getMe, logout, updatePassword, updateMe, deleteMe
 */

const authController = require('../../controllers/auth');
const User = require('../../models/User');
const Interview = require('../../models/Interview');
const Review = require('../../models/Review');

jest.mock('../../models/User');
jest.mock('../../models/Interview');
jest.mock('../../models/Review');

describe('Auth Controller', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            body: {},
            user: { id: 'user123' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            cookie: jest.fn().mockReturnThis()
        };
        next = jest.fn();
    });

    describe('Register', () => {
        test('should register user successfully', async () => {
            const userData = {
                name: 'John Doe',
                tel: '0812345678',
                email: 'john@example.com',
                password: 'password123',
                role: 'user'
            };

            req.body = userData;

            const mockUser = {
                ...userData,
                _id: 'user123',
                getSignedJwtToken: jest.fn().mockReturnValue('token123')
            };

            User.create.mockResolvedValue(mockUser);

            await authController.register(req, res, next);

            expect(User.create).toHaveBeenCalledWith(userData);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('should not send token for company role', async () => {
            const userData = {
                name: 'Tech Corp',
                tel: '0212345678',
                email: 'company@example.com',
                password: 'password123',
                role: 'company'
            };

            req.body = userData;

            const mockUser = {
                ...userData,
                _id: 'user123',
                getSignedJwtToken: jest.fn().mockReturnValue('token123')
            };

            User.create.mockResolvedValue(mockUser);

            const result = await authController.register(req, res, next);

            expect(result).toEqual(mockUser);
            expect(res.json).not.toHaveBeenCalled();
        });

        test('should handle validation error', async () => {
            const userData = {
                name: 'John Doe',
                tel: '0812345678',
                email: 'john@example.com',
                password: 'password123'
            };

            req.body = userData;

            const validationError = new Error('Validation Error');
            validationError.name = 'ValidationError';
            validationError.errors = {
                email: { message: 'Email is invalid' }
            };

            User.create.mockRejectedValue(validationError);

            await authController.register(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Email is invalid'
            });
        });

        test('should handle server error', async () => {
            req.body = {
                name: 'John Doe',
                tel: '0812345678',
                email: 'john@example.com',
                password: 'password123'
            };

            User.create.mockRejectedValue(new Error('Server Error'));

            await authController.register(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false
            });
        });
    });

    describe('Login', () => {
        test('should login user successfully', async () => {
            req.body = {
                email: 'john@example.com',
                password: 'password123'
            };

            const mockUser = {
                _id: 'user123',
                email: 'john@example.com',
                matchPassword: jest.fn().mockResolvedValue(true),
                getSignedJwtToken: jest.fn().mockReturnValue('token123')
            };

            // findOne().select("+password") chain
            User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });

            await authController.login(req, res, next);

            expect(User.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
            expect(mockUser.matchPassword).toHaveBeenCalledWith('password123');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.cookie).toHaveBeenCalled();
        });

        test('should return error if email is missing', async () => {
            req.body = {
                password: 'password123'
            };

            await authController.login(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                msg: 'Please provide an email and password'
            });
        });

        test('should return error if password is missing', async () => {
            req.body = {
                email: 'john@example.com'
            };

            await authController.login(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                msg: 'Please provide an email and password'
            });
        });

        test('should return error if user not found', async () => {
            req.body = {
                email: 'notfound@example.com',
                password: 'password123'
            };

            // findOne().select("+password") chain returning null
            User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

            await authController.login(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                msg: 'Invalid credentials'
            });
        });

        test('should return error if password does not match', async () => {
            req.body = {
                email: 'john@example.com',
                password: 'wrongpassword'
            };

            const mockUser = {
                _id: 'user123',
                email: 'john@example.com',
                matchPassword: jest.fn().mockResolvedValue(false)
            };

            // findOne().select("+password") chain
            User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });

            await authController.login(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                msg: 'Invalid credentials'
            });
        });

        test('should handle login error with non-string email or password', async () => {
            req.body = {
                email: 'john@example.com',
                password: 'password123'
            };

            User.findOne.mockReturnValue({ select: jest.fn().mockRejectedValue(new Error('Conversion error')) });

            await authController.login(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                msg: 'Cannot convert email or password to string'
            });
        });

        test('should set secure cookie when NODE_ENV is production', async () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';

            req.body = { email: 'john@example.com', password: 'password123' };

            const mockUser = {
                _id: 'user123',
                email: 'john@example.com',
                matchPassword: jest.fn().mockResolvedValue(true),
                getSignedJwtToken: jest.fn().mockReturnValue('token123')
            };

            User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });

            await authController.login(req, res, next);

            expect(res.cookie).toHaveBeenCalledWith(
                'token',
                'token123',
                expect.objectContaining({ secure: true })
            );

            process.env.NODE_ENV = originalEnv;
        });
    });

    describe('Get Me', () => {
        test('should get current logged in user', async () => {
            const mockUser = {
                _id: 'user123',
                name: 'John Doe',
                email: 'john@example.com'
            };

            User.findById.mockResolvedValue(mockUser);

            await authController.getMe(req, res, next);

            expect(User.findById).toHaveBeenCalledWith('user123');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockUser
            });
        });
    });

    describe('Logout', () => {
        test('should logout user successfully', async () => {
            await authController.logout(req, res, next);

            expect(res.cookie).toHaveBeenCalledWith('token', 'none', {
                expires: expect.any(Date),
                httpOnly: true
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {}
            });
        });
    });

    describe('Update Password', () => {
        test('should update password successfully', async () => {
            req.body = {
                currentPassword: 'oldpassword',
                newPassword: 'newpassword'
            };

            const mockUser = {
                _id: 'user123',
                matchPassword: jest.fn().mockResolvedValue(true),
                save: jest.fn().mockResolvedValue(true),
                getSignedJwtToken: jest.fn().mockReturnValue('newtoken123')
            };

            // findById().select("+password") chain
            User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });

            await authController.updatePassword(req, res, next);

            expect(mockUser.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('should return error if current password not provided', async () => {
            req.body = {
                newPassword: 'newpassword'
            };

            await authController.updatePassword(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                msg: 'Please provide current and new password'
            });
        });

        test('should return error if new password not provided', async () => {
            req.body = {
                currentPassword: 'oldpassword'
            };

            await authController.updatePassword(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                msg: 'Please provide current and new password'
            });
        });

        test('should return error if current password is incorrect', async () => {
            req.body = {
                currentPassword: 'wrongpassword',
                newPassword: 'newpassword'
            };

            const mockUser = {
                matchPassword: jest.fn().mockResolvedValue(false)
            };

            // findById().select("+password") chain
            User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });

            await authController.updatePassword(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                msg: 'Current password is incorrect'
            });
        });

        test('should handle validation error during password update', async () => {
            req.body = {
                currentPassword: 'oldpassword',
                newPassword: 'new'
            };

            const mockUser = {
                matchPassword: jest.fn().mockResolvedValue(true),
                save: jest.fn().mockRejectedValue({
                    name: 'ValidationError',
                    errors: {
                        password: { message: 'Password must be at least 6 characters' }
                    }
                })
            };

            // findById().select("+password") chain
            User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });

            await authController.updatePassword(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                msg: 'Password must be at least 6 characters'
            });
        });

        test('should handle server error during password update', async () => {
            req.body = {
                currentPassword: 'oldpassword',
                newPassword: 'newpassword'
            };

            const mockUser = {
                matchPassword: jest.fn().mockRejectedValue(new Error('Server error'))
            };

            // findById().select("+password") chain
            User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });

            await authController.updatePassword(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                msg: 'Server error'
            });
        });
    });

    describe('Update Me', () => {
        test('should update user profile successfully', async () => {
            req.body = {
                name: 'Jane Doe',
                tel: '0887654321',
                email: 'jane@example.com'
            };

            const mockUser = {
                _id: 'user123',
                name: 'Jane Doe',
                tel: '0887654321',
                email: 'jane@example.com'
            };

            User.findByIdAndUpdate.mockResolvedValue(mockUser);

            await authController.updateMe(req, res, next);

            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                'user123',
                {
                    name: 'Jane Doe',
                    tel: '0887654321',
                    email: 'jane@example.com'
                },
                { new: true, runValidators: true }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockUser
            });
        });

        test('should return error if no fields provided to update', async () => {
            req.body = {};

            await authController.updateMe(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                msg: 'Please provide at least one field to update (name, tel, email)'
            });
        });

        test('should update only provided fields', async () => {
            req.body = {
                name: 'Jane Doe'
            };

            const mockUser = {
                _id: 'user123',
                name: 'Jane Doe',
                tel: '0812345678',
                email: 'john@example.com'
            };

            User.findByIdAndUpdate.mockResolvedValue(mockUser);

            await authController.updateMe(req, res, next);

            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                'user123',
                { name: 'Jane Doe' },
                { new: true, runValidators: true }
            );
        });

        test('should handle validation error', async () => {
            req.body = {
                email: 'invalid-email'
            };

            const validationError = {
                name: 'ValidationError',
                errors: {
                    email: { message: 'Please provide a valid email' }
                }
            };

            User.findByIdAndUpdate.mockRejectedValue(validationError);

            await authController.updateMe(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                msg: 'Please provide a valid email'
            });
        });

        test('should handle server error', async () => {
            req.body = {
                name: 'Jane Doe'
            };

            User.findByIdAndUpdate.mockRejectedValue(new Error('Server error'));

            await authController.updateMe(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                msg: 'Server error'
            });
        });
    });

    describe('Delete Me', () => {
        test('should delete user account and related data', async () => {
            const mockUser = {
                _id: 'user123',
                name: 'John Doe'
            };

            User.findById.mockResolvedValue(mockUser);
            Review.deleteMany.mockResolvedValue({});
            Interview.deleteMany.mockResolvedValue({});
            User.deleteOne.mockResolvedValue({});

            await authController.deleteMe(req, res, next);

            expect(Review.deleteMany).toHaveBeenCalledWith({ user: 'user123' });
            expect(Interview.deleteMany).toHaveBeenCalledWith({ user: 'user123' });
            expect(User.deleteOne).toHaveBeenCalledWith({ _id: 'user123' });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {}
            });
        });

        test('should return error if user not found', async () => {
            User.findById.mockResolvedValue(null);

            await authController.deleteMe(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                msg: 'User not found'
            });
        });

        test('should handle delete error', async () => {
            User.findById.mockRejectedValue(new Error('Database error'));

            await authController.deleteMe(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                msg: 'Server error'
            });
        });
    });
});