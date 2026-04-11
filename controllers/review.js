const Review = require('../models/Review');
const Company = require('../models/Company');

// @desc    Add review for company
// @route   POST /api/v1/reviews
// @access  Private
exports.createReview = async (req, res, next) => {
    try {
        const company = await Company.findById(req.body.company);
        
        if (!company) {
            return res.status(404).json({
                success: false,
                message:`No company with the id of ${req.body.company}`
            })
        }

        // add user Id to req.body
        req.body.user = req.user.id;

        const review = await Review.create(req.body);
        res.status(201).json({
            success: true,
            data: review
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Cannot add review for interview session"
        });
    }
};