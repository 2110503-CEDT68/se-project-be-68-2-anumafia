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


// @desc    Update review for company
// @route   PUT /api/v1/reviews/:id
// @access  Private
exports.updateReview = async (req, res, next) => {
	try {

		let review = await Review.findById(req.params.id);

		if (!review) {
			return res.status(400).json({
				success: false,
				message: `No review found with id of ${req.params.id}`
			});
		}

		if(review.user.toString() !== req.user.id && req.user.role !== 'admin') {
			return res.status(401).json({
				success: false,
				message: `User ${req.user.id} is not authorized to update this review`
			});
		}

		req.body.reviewText = req.body.reviewText.trim(); //Trim whitespace from review text

		review = await Review.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		});

		if (!review) {
			return res.status(400).json({
				success: false
			});
		}

		res.status(200).json({
			success: true,
			data: review
		});
	} catch (err) {
		if (err.name === 'ValidationError') {
            const message = Object.values(err.errors).map(val => val.message).join(', ');
            return res.status(400).json({
                success: false,
                message: message
            });
        }

        res.status(400).json({
            success: false
        });
	}
}