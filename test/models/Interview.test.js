/**
 * Interview Model Tests
 * Tests for Interview schema validations and date validation
 */

const mongoose = require('mongoose');
const Interview = require('../../models/Interview');

describe('Interview Model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Interview Schema Validations', () => {
        test('should create an interview with valid data', () => {
            const futureDate = new Date(Date.now() + 86400000); // Tomorrow
            const interviewData = {
                sessionDate: futureDate,
                user: new mongoose.Types.ObjectId(),
                company: new mongoose.Types.ObjectId(),
                attendanceStatus: 'pending'
            };

            const interview = new Interview(interviewData);
            expect(interview.sessionDate).toEqual(futureDate);
            expect(interview.user).toBeDefined();
            expect(interview.company).toBeDefined();
            expect(interview.attendanceStatus).toBe('pending');
        });

        test('should require sessionDate field', () => {
            const interviewData = {
                user: new mongoose.Types.ObjectId(),
                company: new mongoose.Types.ObjectId()
            };

            const interview = new Interview(interviewData);
            const error = interview.validateSync();
            expect(error).toBeDefined();
            expect(error.errors.sessionDate).toBeDefined();
        });

        test('should require user field', () => {
            const futureDate = new Date(Date.now() + 86400000);
            const interviewData = {
                sessionDate: futureDate,
                company: new mongoose.Types.ObjectId()
            };

            const interview = new Interview(interviewData);
            const error = interview.validateSync();
            expect(error).toBeDefined();
            expect(error.errors.user).toBeDefined();
        });

        test('should require company field', () => {
            const futureDate = new Date(Date.now() + 86400000);
            const interviewData = {
                sessionDate: futureDate,
                user: new mongoose.Types.ObjectId()
            };

            const interview = new Interview(interviewData);
            const error = interview.validateSync();
            expect(error).toBeDefined();
            expect(error.errors.company).toBeDefined();
        });

        test('should validate that sessionDate is today or later', () => {
            const pastDate = new Date(Date.now() - 86400000); // Yesterday
            const interviewData = {
                sessionDate: pastDate,
                user: new mongoose.Types.ObjectId(),
                company: new mongoose.Types.ObjectId()
            };

            const interview = new Interview(interviewData);
            const error = interview.validateSync();
            expect(error).toBeDefined();
            expect(error.errors.sessionDate).toBeDefined();
        });

        test('should accept sessionDate today', () => {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Start of today
            
            const interviewData = {
                sessionDate: today,
                user: new mongoose.Types.ObjectId(),
                company: new mongoose.Types.ObjectId()
            };

            const interview = new Interview(interviewData);
            expect(interview.sessionDate).toEqual(today);
        });

        test('should accept sessionDate in the future', () => {
            const futureDate = new Date(Date.now() + 86400000 * 7); // Next week
            const interviewData = {
                sessionDate: futureDate,
                user: new mongoose.Types.ObjectId(),
                company: new mongoose.Types.ObjectId()
            };

            const interview = new Interview(interviewData);
            expect(interview.sessionDate).toEqual(futureDate);
        });

        test('should set attendanceStatus to pending by default', () => {
            const futureDate = new Date(Date.now() + 86400000);
            const interviewData = {
                sessionDate: futureDate,
                user: new mongoose.Types.ObjectId(),
                company: new mongoose.Types.ObjectId()
            };

            const interview = new Interview(interviewData);
            expect(interview.attendanceStatus).toBe('pending');
        });

        test('should accept valid attendanceStatus values', () => {
            const futureDate = new Date(Date.now() + 86400000);
            const validStatuses = ['pending', 'attended', 'absent'];

            validStatuses.forEach(status => {
                const interviewData = {
                    sessionDate: futureDate,
                    user: new mongoose.Types.ObjectId(),
                    company: new mongoose.Types.ObjectId(),
                    attendanceStatus: status
                };

                const interview = new Interview(interviewData);
                expect(interview.attendanceStatus).toBe(status);
            });
        });

        test('should reject invalid attendanceStatus', () => {
            const futureDate = new Date(Date.now() + 86400000);
            const interviewData = {
                sessionDate: futureDate,
                user: new mongoose.Types.ObjectId(),
                company: new mongoose.Types.ObjectId(),
                attendanceStatus: 'invalid_status'
            };

            const interview = new Interview(interviewData);
            const error = interview.validateSync();
            expect(error).toBeDefined();
            expect(error.errors.attendanceStatus).toBeDefined();
        });
    });

    describe('Interview References', () => {
        test('should reference User model', () => {
            const userId = new mongoose.Types.ObjectId();
            const futureDate = new Date(Date.now() + 86400000);
            const interviewData = {
                sessionDate: futureDate,
                user: userId,
                company: new mongoose.Types.ObjectId()
            };

            const interview = new Interview(interviewData);
            expect(interview.user).toEqual(userId);
        });

        test('should reference Company model', () => {
            const companyId = new mongoose.Types.ObjectId();
            const futureDate = new Date(Date.now() + 86400000);
            const interviewData = {
                sessionDate: futureDate,
                user: new mongoose.Types.ObjectId(),
                company: companyId
            };

            const interview = new Interview(interviewData);
            expect(interview.company).toEqual(companyId);
        });

        test('should have proper user reference path', () => {
            const userPath = Interview.schema.paths.user;
            expect(userPath.options.ref).toBe('User');
        });

        test('should have proper company reference path', () => {
            const companyPath = Interview.schema.paths.company;
            expect(companyPath.options.ref).toBe('Company');
        });
    });

    describe('Interview Timestamps', () => {
        test('should set createdAt timestamp by default', () => {
            const futureDate = new Date(Date.now() + 86400000);
            const interviewData = {
                sessionDate: futureDate,
                user: new mongoose.Types.ObjectId(),
                company: new mongoose.Types.ObjectId()
            };

            const interview = new Interview(interviewData);
            expect(interview.createdAt).toBeDefined();
            expect(interview.createdAt instanceof Date).toBe(true);
        });

        test('should allow setting custom createdAt', () => {
            const futureDate = new Date(Date.now() + 86400000);
            const pastDate = new Date(Date.now() - 86400000);
            
            const interviewData = {
                sessionDate: futureDate,
                user: new mongoose.Types.ObjectId(),
                company: new mongoose.Types.ObjectId(),
                createdAt: pastDate
            };

            const interview = new Interview(interviewData);
            expect(interview.createdAt).toEqual(pastDate);
        });
    });

    describe('Attendance Status Management', () => {
        test('should allow updating attendanceStatus', () => {
            const futureDate = new Date(Date.now() + 86400000);
            const interviewData = {
                sessionDate: futureDate,
                user: new mongoose.Types.ObjectId(),
                company: new mongoose.Types.ObjectId(),
                attendanceStatus: 'pending'
            };

            const interview = new Interview(interviewData);
            interview.attendanceStatus = 'attended';
            expect(interview.attendanceStatus).toBe('attended');
        });

        test('should validate attendanceStatus updates', () => {
            const futureDate = new Date(Date.now() + 86400000);
            const interviewData = {
                sessionDate: futureDate,
                user: new mongoose.Types.ObjectId(),
                company: new mongoose.Types.ObjectId(),
                attendanceStatus: 'pending'
            };

            const interview = new Interview(interviewData);
            interview.attendanceStatus = 'invalid';
            const error = interview.validateSync();
            expect(error).toBeDefined();
            expect(error.errors.attendanceStatus).toBeDefined();
        });
    });

    describe('Interview Date Scenarios', () => {
        test('should accept interviews scheduled months in advance', () => {
            const futureDate = new Date(Date.now() + 86400000 * 90); // 3 months
            const interviewData = {
                sessionDate: futureDate,
                user: new mongoose.Types.ObjectId(),
                company: new mongoose.Types.ObjectId()
            };

            const interview = new Interview(interviewData);
            expect(interview.sessionDate).toEqual(futureDate);
        });

        test('should reject interviews in the past', () => {
            const pastDate = new Date(Date.now() - 1); // 1ms in the past
            const interviewData = {
                sessionDate: pastDate,
                user: new mongoose.Types.ObjectId(),
                company: new mongoose.Types.ObjectId()
            };

            const interview = new Interview(interviewData);
            const error = interview.validateSync();
            expect(error).toBeDefined();
        });

        test('should handle exact current date time', () => {
            const now = new Date();
            const interviewData = {
                sessionDate: now,
                user: new mongoose.Types.ObjectId(),
                company: new mongoose.Types.ObjectId()
            };

            const interview = new Interview(interviewData);
            expect(interview.sessionDate).toEqual(now);
        });
    });
});
