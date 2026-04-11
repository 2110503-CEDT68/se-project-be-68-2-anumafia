const Review = require('../models/Review');
const Company = require('../models/Company');
const Interview = require('../models/Interview'); // อย่าลืม import Interview

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

        const hasInterviewed = await Interview.findOne({
            user: req.user.id,
            company: req.body.company
        });

        if (!hasInterviewed && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: `User has never interviewed with this company. Cannot add a review.`
            });
        }

        if (hasInterviewed.sessionDate > Date.now() && req.user.role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: "You can only review after the interview session is completed."
            });
        }

        const alreadyReviewed = await Review.findOne({
            user: req.user.id,
            company: req.body.company
        });

        if (alreadyReviewed) {
            return res.status(400).json({
                success: false,
                message: `User has already reviewed this company.`
            });
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