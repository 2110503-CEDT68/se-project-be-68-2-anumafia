/**
 * Users Controller Tests
 * Tests for banUser, unbanUser, giveYellowCard, getUsers, getUser
 */

const usersController = require('../../controllers/users');
const User = require('../../models/User');

jest.mock('../../models/User');

describe('Users Controller', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            body: {},
            params: {},
            query: {},
            user: { id: 'admin123', role: 'admin' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        next = jest.fn();
    });

    describe('Ban User', () => {
        test('should ban user successfully', async () => {
            req.params.id = 'user123';
            req.body = {
                reason: 'Inappropriate behavior'
            };

            const mockUser = {
                _id: 'user123',
                name: 'John Doe',
                role: 'user',
                ban: { isBanned: false }
            };

            User.findById.mockResolvedValue(mockUser);
            User.findByIdAndUpdate.mockResolvedValue({
                ban: {
                    isBanned: true,
                    reason: 'Inappropriate behavior'
                }
            });

            await usersController.banUser(req, res, next);

            expect(User.findById).toHaveBeenCalledWith('user123');
            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                'user123',
                {
                    ban: {
                        isBanned: true,
                        reason: 'Inappropriate behavior'
                    }
                }
            );
            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('should return error if user not found', async () => {
            req.params.id = 'nonexistent';
            req.body = { reason: 'Test reason' };

            User.findById.mockResolvedValue(null);

            await usersController.banUser(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                msg: 'User not found'
            });
        });

        test('should not allow banning admin users', async () => {
            req.params.id = 'admin456';
            req.body = { reason: 'Test' };

            const mockAdmin = {
                _id: 'admin456',
                name: 'Admin User',
                role: 'admin'
            };

            User.findById.mockResolvedValue(mockAdmin);

            await usersController.banUser(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                msg: 'Cannot ban an admin user'
            });
        });

        test('should return error if user already banned', async () => {
            req.params.id = 'user123';
            req.body = { reason: 'Test' };

            const mockUser = {
                _id: 'user123',
                name: 'John Doe',
                role: 'user',
                ban: { isBanned: true }
            };

            User.findById.mockResolvedValue(mockUser);

            await usersController.banUser(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                msg: 'User is already banned'
            });
        });

        test('should ban user successfully without reason', async () => {
            req.params.id = 'user123';
            req.body = {};

            const mockUser = {
                _id: 'user123',
                name: 'John Doe',
                role: 'user',
                ban: { isBanned: false }
            };

            User.findById.mockResolvedValue(mockUser);
            User.findByIdAndUpdate.mockResolvedValue({
                ban: { isBanned: true, reason: null }
            });

            await usersController.banUser(req, res, next);

            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                'user123',
                { ban: { isBanned: true, reason: null } }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                msg: `User John Doe has been permanently banned`,
                data: { reason: null }
            });
        });

        test('should handle server error', async () => {
            req.params.id = 'user123';
            req.body = { reason: 'Test' };

            User.findById.mockRejectedValue(new Error('Database error'));

            await usersController.banUser(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                msg: 'Server error'
            });
        });
    });

    describe('Unban User', () => {
        test('should unban user successfully', async () => {
            req.params.id = 'user123';

            const mockUser = {
                _id: 'user123',
                name: 'John Doe',
                ban: { isBanned: true }
            };

            User.findById.mockResolvedValue(mockUser);
            User.findByIdAndUpdate.mockResolvedValue({});

            await usersController.unbanUser(req, res, next);

            expect(User.findById).toHaveBeenCalledWith('user123');
            expect(User.findByIdAndUpdate).toHaveBeenCalledWith('user123', {
                ban: { isBanned: false, reason: null },
                yellowCards: {
                    count: 0,
                    records: []
                }
            });
            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('should return error if user not found', async () => {
            req.params.id = 'nonexistent';

            User.findById.mockResolvedValue(null);

            await usersController.unbanUser(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                msg: 'User not found'
            });
        });

        test('should return error if user is not banned', async () => {
            req.params.id = 'user123';

            const mockUser = {
                _id: 'user123',
                name: 'John Doe',
                ban: { isBanned: false }
            };

            User.findById.mockResolvedValue(mockUser);

            await usersController.unbanUser(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                msg: 'User is not banned'
            });
        });

        test('should handle server error', async () => {
            req.params.id = 'user123';

            User.findById.mockRejectedValue(new Error('Database error'));

            await usersController.unbanUser(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                msg: 'Server error'
            });
        });
    });

    describe('Give Yellow Card', () => {
        test('should give yellow card successfully', async () => {
            req.params.id = 'user123';
            req.body = {
                reason: 'First warning'
            };

            const mockUser = {
                _id: 'user123',
                name: 'John Doe',
                role: 'user',
                ban: { isBanned: false },
                yellowCards: {
                    count: 0,
                    records: []
                }
            };

            User.findById.mockResolvedValue(mockUser);
            User.findByIdAndUpdate.mockResolvedValue({});

            await usersController.giveYellowCard(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                msg: 'User John Doe has been given a yellow card (1/3)',
                data: expect.objectContaining({
                    yellowCardCount: 1
                })
            });
        });

        test('should return error if reason not provided', async () => {
            req.params.id = 'user123';
            req.body = {};

            await usersController.giveYellowCard(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                msg: 'Please provide a reason for the yellow card'
            });
        });

        test('should return error if user not found', async () => {
            req.params.id = 'nonexistent';
            req.body = { reason: 'Test' };

            User.findById.mockResolvedValue(null);

            await usersController.giveYellowCard(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                msg: 'User not found'
            });
        });

        test('should not allow giving yellow card to admin', async () => {
            req.params.id = 'admin456';
            req.body = { reason: 'Test' };

            const mockAdmin = {
                _id: 'admin456',
                role: 'admin'
            };

            User.findById.mockResolvedValue(mockAdmin);

            await usersController.giveYellowCard(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                msg: 'Cannot give yellow card to an admin'
            });
        });

        test('should not allow giving yellow card to banned user', async () => {
            req.params.id = 'user123';
            req.body = { reason: 'Test' };

            const mockUser = {
                _id: 'user123',
                name: 'John',
                role: 'user',
                ban: { isBanned: true }
            };

            User.findById.mockResolvedValue(mockUser);

            await usersController.giveYellowCard(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                msg: 'User is already banned'
            });
        });

        test('should auto-ban user after 3 yellow cards', async () => {
            req.params.id = 'user123';
            req.body = { reason: 'Third warning' };

            const mockUser = {
                _id: 'user123',
                name: 'John Doe',
                role: 'user',
                ban: { isBanned: false },
                yellowCards: {
                    count: 2,
                    records: [
                        { reason: 'First' },
                        { reason: 'Second' }
                    ]
                }
            };

            User.findById.mockResolvedValue(mockUser);
            User.findByIdAndUpdate.mockResolvedValue({});

            await usersController.giveYellowCard(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                msg: 'User John Doe has received 3 yellow cards and has been permanently banned',
                data: expect.objectContaining({
                    yellowCardCount: 3
                })
            });
        });

        test('should handle server error', async () => {
            req.params.id = 'user123';
            req.body = { reason: 'Test' };

            User.findById.mockRejectedValue(new Error('Database error'));

            await usersController.giveYellowCard(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                msg: 'Server error'
            });
        });
    });

    describe('Get Users', () => {
        test('should get all users with pagination', async () => {
            req.query = { page: 1, limit: 25 };

            const mockUsers = [
                { _id: 'user1', name: 'User 1' },
                { _id: 'user2', name: 'User 2' }
            ];

            User.countDocuments.mockResolvedValue(2);
            User.find.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue(mockUsers)
            });

            await usersController.getUsers(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                totalItems: 2,
                totalPages: 1,
                itemCount: 2,
                currentPage: 1,
                data: mockUsers
            });
        });

        test('should filter users by name', async () => {
            req.query = { name: 'John' };

            const mockUsers = [{ _id: 'user1', name: 'John Doe' }];

            User.countDocuments.mockResolvedValue(1);
            User.find.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue(mockUsers)
            });

            await usersController.getUsers(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('should select specific fields', async () => {
            req.query = { select: 'name,email' };

            const mockQuery = {
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue([])
            };

            User.countDocuments.mockResolvedValue(0);
            User.find.mockReturnValue(mockQuery);

            await usersController.getUsers(req, res, next);

            expect(mockQuery.select).toHaveBeenCalledWith('name email');
        });

        test('should sort users', async () => {
            req.query = { sort: 'name,-createAt' };

            const mockQuery = {
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue([])
            };

            User.countDocuments.mockResolvedValue(0);
            User.find.mockReturnValue(mockQuery);

            await usersController.getUsers(req, res, next);

            expect(mockQuery.sort).toHaveBeenCalledWith('name -createAt');
        });

        test('should apply query operators (gt, gte, lt, lte, in)', async () => {
            req.query = { yellowCards: { gte: '1' } };

            const mockQuery = {
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue([])
            };

            User.countDocuments.mockResolvedValue(0);
            User.find.mockReturnValue(mockQuery);

            await usersController.getUsers(req, res, next);

            expect(User.find).toHaveBeenCalledWith(
                expect.objectContaining({ yellowCards: { $gte: '1' } })
            );
            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('should handle server error in getUsers', async () => {
            req.query = {};

            User.countDocuments.mockRejectedValue(new Error('Database error'));

            await usersController.getUsers(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Server Error'
            });
        });
    });

    describe('Get User', () => {
        test('should get single user by id', async () => {
            req.params.id = 'user123';

            const mockUser = {
                _id: 'user123',
                name: 'John Doe',
                email: 'john@example.com'
            };

            User.findById.mockResolvedValue(mockUser);

            await usersController.getUser(req, res, next);

            expect(User.findById).toHaveBeenCalledWith('user123');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockUser
            });
        });

        test('should return error if user not found', async () => {
            req.params.id = 'nonexistent';

            User.findById.mockResolvedValue(null);

            await usersController.getUser(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'User not found'
            });
        });

        test('should handle server error in getUser', async () => {
            req.params.id = 'user123';

            User.findById.mockRejectedValue(new Error('Database error'));

            await usersController.getUser(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Server Error'
            });
        });
    });
});