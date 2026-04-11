const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    company: {
        type: mongoose.Schema.ObjectId,
        ref: 'Company',
        required: true
    },
    rating: {
        type: Number,
        required: [true, 'Please add a rating between 0 and 5'],
        min: 0,
        max: 5,
        validate: {
            validator: Number.isInteger,
            message: 'Rating must be an integer'
        }
    },
    reviewText: {
        type: String,
        required: [true, 'Please add review text'],
        maxlength: 500,
        validate: {
            validator: function(value) {
                // Validate that review text is not empty or just whitespace
                return value.trim().length > 0;
            },
            message: 'Review text cannot be empty'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now,
        validate: {
            validator: function(value) {
                // Validate that createdAt is not in the future
                return value <= new Date();
            },
            message: 'Created date cannot be in the future'
        }
    }
})

module.exports = mongoose.model('Review', ReviewSchema);