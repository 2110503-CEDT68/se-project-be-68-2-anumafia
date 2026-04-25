const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
    sessionDate: {
        type: Date,
        required: [true, 'Please add a session date'],
        validate: {
            validator: function(value) {
                // Validate that date is on or after today
                const startDate = new Date();
                return value >= startDate;
            },
            message: 'Interview date must be today or later'
        }
    },
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
    attendanceStatus: {
        type: String,
        enum: ['pending', 'attended', 'absent'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Interview', InterviewSchema);
