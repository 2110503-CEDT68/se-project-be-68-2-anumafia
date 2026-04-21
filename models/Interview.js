const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
    sessionDate: {
        type: Date,
        required: [true, 'Please add a session date'],
        validate: {
            validator: function(value) {
                // Validate that date is between May 10-13, 2022
                const startDate = new Date('2022-05-10');
                const endDate = new Date('2022-05-13');
                endDate.setHours(23, 59, 59, 999);
                return value >= startDate && value <= endDate;
            },
            message: 'Interview date must be between May 10-13, 2022'
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
