/**
 * Review Controller Tests
 * Tests for createReview, getReview, getAllReviews, deleteReview, updateReview
 */

const reviewController = require('../../controllers/review');
const Review = require('../../models/Review');
const Company = require('../../models/Company');
const Interview = require('../../models/Interview');

jest.mock('../../models/Review');
jest.mock('../../models/Company');
jest.mock('../../models/Interview');

const createPopulateChain = (result, reject = false) => {
    const chain = {
        populate: jest.fn().mockReturnThis(),
        then(onFulfilled, onRejected) {
            return reject
                ? Promise.reject(result).then(onFulfilled, onRejected)
                : Promise.resolve(result).then(onFulfilled, onRejected);
        }
    };
    return chain;
};

describe('Review Controller', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            body: {},
            params: {},
            user: { id: 'user123', role: 'user' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        next = jest.fn();
    });

    describe('Create Review', () => {
        test('should create review successfully', async () => {
            req.body = {
                company: 'comp123',
                rating: 5,
                reviewText: 'Great company!'
            };

            const mockCompany = {
                _id: 'comp123',
                name: 'Tech Corp'
            };

            const mockInterview = {
                _id: 'interview123',
                user: 'user123',
                company: 'comp123',
                sessionDate: new Date(Date.now() - 86400000)
            };

            const mockReview = {
                _id: 'review123',
                company: 'comp123',
                rating: 5,
                reviewText: 'Great company!',
                user: 'user123'
            };

            Company.findById.mockResolvedValue(mockCompany);
            Interview.findOne.mockResolvedValue(mockInterview);
            Review.findOne.mockResolvedValue(null);
            Review.create.mockResolvedValue(mockReview);

            await reviewController.createReview(req, res, next);

            expect(Company.findById).toHaveBeenCalledWith('comp123');
            expect(Interview.findOne).toHaveBeenCalled();
            expect(Review.findOne).toHaveBeenCalled();
            expect(Review.create).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockReview
            });
        });

        test('should return error if company not found', async () => {
            req.body = {
                company: 'nonexistent',
                rating: 5,
                reviewText: 'Test'
            };

            Company.findById.mockResolvedValue(null);

            await reviewController.createReview(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'No company with the id of nonexistent'
            });
        });

        test('should not allow review without interview', async () => {
            req.body = {
                company: 'comp123',
                rating: 5,
                reviewText: 'Test'
            };

            const mockCompany = {
                _id: 'comp123'
            };

            Company.findById.mockResolvedValue(mockCompany);
            Interview.findOne.mockResolvedValue(null);

            await reviewController.createReview(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'User has never interviewed with this company. Cannot add a review.'
            });
        });

        test('should allow admin to review with interview record', async () => {
            req.body = {
                company: 'comp123',
                rating: 5,
                reviewText: 'Admin review'
            };
            req.user = { id: 'admin123', role: 'admin' };

            const mockCompany = {
                _id: 'comp123'
            };

            const mockInterview = {
                _id: 'interview123',
                user: 'admin123',
                company: 'comp123',
                sessionDate: new Date(Date.now() - 86400000)
            };

            const mockReview = {
                _id: 'review123',
                company: 'comp123',
                user: 'admin123'
            };

            Company.findById.mockResolvedValue(mockCompany);
            Interview.findOne.mockResolvedValue(mockInterview);
            Review.findOne.mockResolvedValue(null);
            Review.create.mockResolvedValue(mockReview);

            await reviewController.createReview(req, res, next);

            expect(res.status).toHaveBeenCalledWith(201);
        });

        test('should not allow review before interview date', async () => {
            req.body = {
                company: 'comp123',
                rating: 5,
                reviewText: 'Test'
            };

            const mockCompany = {
                _id: 'comp123'
            };

            const mockInterview = {
                sessionDate: new Date(Date.now() + 86400000)
            };

            Company.findById.mockResolvedValue(mockCompany);
            Interview.findOne.mockResolvedValue(mockInterview);

            await reviewController.createReview(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'You can only review after the interview session is completed.'
            });
        });

        test('should not allow duplicate review', async () => {
            req.body = {
                company: 'comp123',
                rating: 5,
                reviewText: 'Test'
            };

            const mockCompany = {
                _id: 'comp123'
            };

            const mockInterview = {
                sessionDate: new Date(Date.now() - 86400000)
            };

            const existingReview = {
                _id: 'review123'
            };

            Company.findById.mockResolvedValue(mockCompany);
            Interview.findOne.mockResolvedValue(mockInterview);
            Review.findOne.mockResolvedValue(existingReview);

            await reviewController.createReview(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'User has already reviewed this company.'
            });
        });

        test('should handle server error', async () => {
            req.body = {
                company: 'comp123',
                rating: 5,
                reviewText: 'Test'
            };

            Company.findById.mockRejectedValue(new Error('Database error'));

            await reviewController.createReview(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Cannot add review for interview session'
            });
        });
    });

    describe('Get Review', () => {
        test('should get reviews for company', async () => {
            req.params.id = 'comp123';

            const mockReviews = [
                {
                    _id: 'review1',
                    company: 'comp123',
                    rating: 5,
                    user: { name: 'John' }
                }
            ];

            Review.find.mockReturnValue(createPopulateChain(mockReviews));

            await reviewController.getReview(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockReviews
            });
        });

        test('should return empty array if no reviews', async () => {
            req.params.id = 'comp123';

            Review.find.mockReturnValue(createPopulateChain([]));

            await reviewController.getReview(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: []
            });
        });

        test('should return 404 when reviews is null', async () => {
            req.params.id = 'comp123';

            Review.find.mockReturnValue(createPopulateChain(null));

            await reviewController.getReview(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'No review this company'
            });
        });

        test('should handle error in getReview', async () => {
            req.params.id = 'comp123';

            Review.find.mockReturnValue(createPopulateChain(new Error('Database error'), true));

            await reviewController.getReview(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Cannot get review'
            });
        });
    });

    describe('Get All Reviews', () => {
        test('should get all reviews for admin', async () => {
            const mockReviews = [
                {
                    _id: 'review1',
                    company: { name: 'Company 1' },
                    user: { name: 'User 1' }
                }
            ];

            Review.find.mockReturnValue(createPopulateChain(mockReviews));

            await reviewController.getAllReviews(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                count: 1,
                data: mockReviews
            });
        });

        test('should handle error in getAllReviews', async () => {
            Review.find.mockReturnValue(createPopulateChain(new Error('Database error'), true));

            await reviewController.getAllReviews(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Cannot get reviews'
            });
        });
    });

    describe('Delete Review', () => {
        test('should delete review by owner', async () => {
            req.params.id = 'review123';

            const mockReview = {
                _id: 'review123',
                user: { toString: jest.fn().mockReturnValue('user123') },
                deleteOne: jest.fn().mockResolvedValue({})
            };

            Review.findById.mockResolvedValue(mockReview);

            await reviewController.deleteReview(req, res, next);

            expect(mockReview.deleteOne).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {}
            });
        });

        test('should allow admin to delete any review', async () => {
            req.params.id = 'review123';
            req.user = { id: 'admin123', role: 'admin' };

            const mockReview = {
                _id: 'review123',
                user: { toString: jest.fn().mockReturnValue('user456') },
                deleteOne: jest.fn().mockResolvedValue({})
            };

            Review.findById.mockResolvedValue(mockReview);

            await reviewController.deleteReview(req, res, next);

            expect(mockReview.deleteOne).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('should not allow non-owner to delete', async () => {
            req.params.id = 'review123';

            const mockReview = {
                _id: 'review123',
                user: { toString: jest.fn().mockReturnValue('user456') }
            };

            Review.findById.mockResolvedValue(mockReview);

            await reviewController.deleteReview(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'User user123 is not authorized to delete this review'
            });
        });

        test('should return error if review not found', async () => {
            req.params.id = 'nonexistent';

            Review.findById.mockResolvedValue(null);

            await reviewController.deleteReview(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'No review with the id of nonexistent'
            });
        });

        test('should handle delete error', async () => {
            req.params.id = 'review123';

            Review.findById.mockRejectedValue(new Error('Database error'));

            await reviewController.deleteReview(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Cannot delete review'
            });
        });
    });

    describe('Update Review', () => {
        test('should update review by owner', async () => {
            req.params.id = 'review123';
            req.body = {
                rating: 4,
                reviewText: 'Updated review'
            };

            const mockReview = {
                _id: 'review123',
                user: { toString: jest.fn().mockReturnValue('user123') }
            };

            const updatedReview = {
                _id: 'review123',
                rating: 4,
                reviewText: 'Updated review'
            };

            Review.findById.mockResolvedValue(mockReview);
            Review.findByIdAndUpdate.mockResolvedValue(updatedReview);

            await reviewController.updateReview(req, res, next);

            expect(Review.findByIdAndUpdate).toHaveBeenCalledWith(
                'review123',
                {
                    reviewText: 'Updated review',
                    rating: 4
                },
                { new: true, runValidators: true }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: updatedReview
            });
        });

        test('should allow admin to update any review', async () => {
            req.params.id = 'review123';
            req.user = { id: 'admin123', role: 'admin' };
            req.body = {
                rating: 3,
                reviewText: 'Admin update'
            };

            const mockReview = {
                _id: 'review123',
                user: { toString: jest.fn().mockReturnValue('user456') }
            };

            const updatedReview = {
                _id: 'review123',
                rating: 3,
                reviewText: 'Admin update'
            };

            Review.findById.mockResolvedValue(mockReview);
            Review.findByIdAndUpdate.mockResolvedValue(updatedReview);

            await reviewController.updateReview(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('should not allow non-owner to update', async () => {
            req.params.id = 'review123';
            req.body = { rating: 5 };

            const mockReview = {
                _id: 'review123',
                user: { toString: jest.fn().mockReturnValue('user456') }
            };

            Review.findById.mockResolvedValue(mockReview);

            await reviewController.updateReview(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'User user123 is not authorized to update this review'
            });
        });

        test('should return error if review not found', async () => {
            req.params.id = 'nonexistent';
            req.body = { rating: 5 };

            Review.findById.mockResolvedValue(null);

            await reviewController.updateReview(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'No review found with id of nonexistent'
            });
        });

        test('should handle validation error', async () => {
            req.params.id = 'review123';
            req.body = {
                rating: 5,
                reviewText: 'Test'
            };

            const mockReview = {
                _id: 'review123',
                user: { toString: jest.fn().mockReturnValue('user123') }
            };

            const validationError = {
                name: 'ValidationError',
                errors: {
                    rating: { message: 'Rating must be valid' }
                }
            };

            Review.findById.mockResolvedValue(mockReview);
            Review.findByIdAndUpdate.mockRejectedValue(validationError);

            await reviewController.updateReview(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('should return 400 when findByIdAndUpdate returns null', async () => {
            req.params.id = 'review123';
            req.body = { rating: 4, reviewText: 'Test' };

            const mockReview = {
                _id: 'review123',
                user: { toString: jest.fn().mockReturnValue('user123') }
            };

            Review.findById.mockResolvedValue(mockReview);
            Review.findByIdAndUpdate.mockResolvedValue(null);

            await reviewController.updateReview(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false });
        });

        test('should handle non-validation error in updateReview', async () => {
            req.params.id = 'review123';
            req.body = { rating: 4, reviewText: 'Test' };

            const mockReview = {
                _id: 'review123',
                user: { toString: jest.fn().mockReturnValue('user123') }
            };

            const genericError = new Error('Unexpected error'); // name is 'Error', not 'ValidationError'

            Review.findById.mockResolvedValue(mockReview);
            Review.findByIdAndUpdate.mockRejectedValue(genericError);

            await reviewController.updateReview(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false });
        });
    });
});