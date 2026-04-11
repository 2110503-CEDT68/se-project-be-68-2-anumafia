const express = require("express");
const router = express.Router({ mergeParams: true });
const { createReview, getReview, deleteReview, updateReview } = require("../controllers/review");
const { protect, authorize } = require("../middleware/auth");

router.route("/")
    .post(protect, authorize("admin", "user"), createReview);

router.route("/:id")
    .get(getReview);

router.route('/:id')
    .delete(protect, authorize('admin', 'user'), deleteReview);

router.route("/:id")
	.put(protect, authorize("admin", "user"), updateReview);

module.exports = router;
