const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
    user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
    },
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    address: {
        type: String,
    },
    website: {
        type: String,
    },
    description: {
        type: String,
    },
    tel: {
        type: String,
        required: [true, 'Please add a telephone number']
    },
    public: {
        type: Boolean,
        default: false
    },
    ratingAverage: {
        type: Number,
        default: 0
    },
    reviewCount: {
        type: Number,
        default: 0
    }
},
{
    toJSON: { virtuals:true },
    toObject: { virtuals:true }
});

// Reverse populate with virtuals
CompanySchema.virtual('interviewSessions',{
    ref: 'Interview',
    localField: '_id',
    foreignField: 'company',
    justone: false
});

module.exports = mongoose.model('Company', CompanySchema);
