const express = require("express");
const router = express.Router({ mergeParams: true });
const { createReview } = require("../controllers/review");
const { protect, authorize } = require("../middleware/auth");

router.route("/")
    .post(protect, authorize("admin", "user"), createReview);

router.route('/:id')
    .delete(protect, authorize('admin', 'user'), deleteReview);

module.exports = router;
