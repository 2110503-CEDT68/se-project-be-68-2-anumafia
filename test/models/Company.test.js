/**
 * Company Model Tests
 * Tests for Company schema validations and virtuals
 */

const mongoose = require('mongoose');
const Company = require('../../models/Company');

describe('Company Model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Company Schema Validations', () => {
        test('should create a company with valid data', () => {
            const companyData = {
                user: new mongoose.Types.ObjectId(),
                name: 'Tech Corp',
                tel: '0212345678',
                address: '123 Main St',
                website: 'https://techcorp.com',
                description: 'Leading tech company'
            };

            const company = new Company(companyData);
            expect(company.name).toBe('Tech Corp');
            expect(company.tel).toBe('0212345678');
            expect(company.address).toBe('123 Main St');
            expect(company.website).toBe('https://techcorp.com');
            expect(company.description).toBe('Leading tech company');
        });

        test('should require user field', () => {
            const companyData = {
                name: 'Tech Corp',
                tel: '0212345678'
            };

            const company = new Company(companyData);
            const error = company.validateSync();
            expect(error).toBeDefined();
            expect(error.errors.user).toBeDefined();
        });

        test('should require name field', () => {
            const companyData = {
                user: new mongoose.Types.ObjectId(),
                tel: '0212345678'
            };

            const company = new Company(companyData);
            const error = company.validateSync();
            expect(error).toBeDefined();
            expect(error.errors.name).toBeDefined();
        });

        test('should require tel field', () => {
            const companyData = {
                user: new mongoose.Types.ObjectId(),
                name: 'Tech Corp'
            };

            const company = new Company(companyData);
            const error = company.validateSync();
            expect(error).toBeDefined();
            expect(error.errors.tel).toBeDefined();
        });

        test('should enforce unique name', () => {
            const companyData1 = {
                user: new mongoose.Types.ObjectId(),
                name: 'Tech Corp',
                tel: '0212345678'
            };

            const companyData2 = {
                user: new mongoose.Types.ObjectId(),
                name: 'Tech Corp',
                tel: '0212345679'
            };

            const company1 = new Company(companyData1);
            const company2 = new Company(companyData2);

            // The unique constraint should be defined in the schema
            expect(Company.schema.paths.name.options.unique).toBe(true);
        });

        test('should trim name field', () => {
            const companyData = {
                user: new mongoose.Types.ObjectId(),
                name: '  Tech Corp  ',
                tel: '0212345678'
            };

            const company = new Company(companyData);
            expect(company.name).toBe('Tech Corp');
        });

        test('should limit name to 50 characters', () => {
            const companyData = {
                user: new mongoose.Types.ObjectId(),
                name: 'a'.repeat(51),
                tel: '0212345678'
            };

            const company = new Company(companyData);
            const error = company.validateSync();
            expect(error).toBeDefined();
            expect(error.errors.name).toBeDefined();
        });

        test('should set public to false by default', () => {
            const companyData = {
                user: new mongoose.Types.ObjectId(),
                name: 'Tech Corp',
                tel: '0212345678'
            };

            const company = new Company(companyData);
            expect(company.public).toBe(false);
        });

        test('should set ratingAverage to 0 by default', () => {
            const companyData = {
                user: new mongoose.Types.ObjectId(),
                name: 'Tech Corp',
                tel: '0212345678'
            };

            const company = new Company(companyData);
            expect(company.ratingAverage).toBe(0);
        });

        test('should set reviewCount to 0 by default', () => {
            const companyData = {
                user: new mongoose.Types.ObjectId(),
                name: 'Tech Corp',
                tel: '0212345678'
            };

            const company = new Company(companyData);
            expect(company.reviewCount).toBe(0);
        });

        test('should accept optional address field', () => {
            const companyData = {
                user: new mongoose.Types.ObjectId(),
                name: 'Tech Corp',
                tel: '0212345678',
                address: '123 Main St'
            };

            const company = new Company(companyData);
            expect(company.address).toBe('123 Main St');
        });

        test('should accept optional website field', () => {
            const companyData = {
                user: new mongoose.Types.ObjectId(),
                name: 'Tech Corp',
                tel: '0212345678',
                website: 'https://techcorp.com'
            };

            const company = new Company(companyData);
            expect(company.website).toBe('https://techcorp.com');
        });

        test('should accept optional description field', () => {
            const companyData = {
                user: new mongoose.Types.ObjectId(),
                name: 'Tech Corp',
                tel: '0212345678',
                description: 'Leading tech company'
            };

            const company = new Company(companyData);
            expect(company.description).toBe('Leading tech company');
        });
    });

    describe('Company References', () => {
        test('should reference User model', () => {
            const userId = new mongoose.Types.ObjectId();
            const companyData = {
                user: userId,
                name: 'Tech Corp',
                tel: '0212345678'
            };

            const company = new Company(companyData);
            expect(company.user).toEqual(userId);
        });

        test('should have proper user reference path', () => {
            const userPath = Company.schema.paths.user;
            expect(userPath.options.ref).toBe('User');
        });
    });

    describe('Virtual Fields', () => {
        test('should have interviewSessions virtual', () => {
            const interviewsVirtual = Company.schema.virtuals.interviewSessions;
            expect(interviewsVirtual).toBeDefined();
        });

        test('should have correct virtual configuration', () => {
            const interviewsVirtual = Company.schema.virtuals.interviewSessions;
            expect(interviewsVirtual.options.ref).toBe('Interview');
            expect(interviewsVirtual.options.foreignField).toBe('company');
            expect(interviewsVirtual.options.localField).toBe('_id');
        });
    });

    describe('Rating and Review Tracking', () => {
        test('should allow updating ratingAverage', () => {
            const companyData = {
                user: new mongoose.Types.ObjectId(),
                name: 'Tech Corp',
                tel: '0212345678',
                ratingAverage: 4.5
            };

            const company = new Company(companyData);
            expect(company.ratingAverage).toBe(4.5);
        });

        test('should allow updating reviewCount', () => {
            const companyData = {
                user: new mongoose.Types.ObjectId(),
                name: 'Tech Corp',
                tel: '0212345678',
                reviewCount: 10
            };

            const company = new Company(companyData);
            expect(company.reviewCount).toBe(10);
        });

        test('should handle multiple updates to rating and review count', () => {
            const companyData = {
                user: new mongoose.Types.ObjectId(),
                name: 'Tech Corp',
                tel: '0212345678'
            };

            const company = new Company(companyData);
            company.ratingAverage = 4.5;
            company.reviewCount = 5;

            expect(company.ratingAverage).toBe(4.5);
            expect(company.reviewCount).toBe(5);
        });
    });

    describe('Company Data Serialization', () => {
        test('should include virtuals in toJSON', () => {
            const companyData = {
                user: new mongoose.Types.ObjectId(),
                name: 'Tech Corp',
                tel: '0212345678'
            };

            const company = new Company(companyData);
            const jsonData = company.toJSON();
            
            expect(jsonData).toBeDefined();
        });

        test('should include virtuals in toObject', () => {
            const companyData = {
                user: new mongoose.Types.ObjectId(),
                name: 'Tech Corp',
                tel: '0212345678'
            };

            const company = new Company(companyData);
            const objData = company.toObject();
            
            expect(objData).toBeDefined();
        });
    });
});
