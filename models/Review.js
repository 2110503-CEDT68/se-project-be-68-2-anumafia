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

ReviewSchema.statics.getAverageRating = async function(companyId) {
    const obj = await this.aggregate([
        { $match: { company: companyId } },
        {
            $group: {
                _id: '$company',
                ratingAverage: { $avg: '$rating' },
                reviewCount: { $sum: 1 }
            }
        }
    ]);

    try {
        if (obj.length > 0) {
            await this.model('Company').findByIdAndUpdate(companyId, {
                ratingAverage: Math.round(obj[0].ratingAverage * 10) / 10,
                reviewCount: obj[0].reviewCount
            });
        } else {
            await this.model('Company').findByIdAndUpdate(companyId, {
                ratingAverage: 0,
                reviewCount: 0
            });
        }
    } catch (err) {
        console.error("Error updating average rating:", err);
    }
};

ReviewSchema.post('save', function() {
    this.constructor.getAverageRating(this.company);
});

ReviewSchema.post('deleteOne', { document: true, query: false }, function() {
    this.constructor.getAverageRating(this.company);
});

ReviewSchema.post(/^findOneAnd/, async function(doc) {
    if (doc) {
        await doc.constructor.getAverageRating(doc.company);
    }
});

module.exports = mongoose.model('Review', ReviewSchema);