const express = require("express");
const router = express.Router({ mergeParams: true });
const { createReview, updateReview } = require("../controllers/review");
const { protect, authorize } = require("../middleware/auth");

router.route("/")
    .post(protect, authorize("admin", "user"), createReview);

router.route("/:id")
	.put(protect, authorize("admin", "user"), updateReview);

module.exports = router;
