const express = require("express");
const router = express.Router({ mergeParams: true });
const { createReview, getReview } = require("../controllers/review");
const { protect, authorize } = require("../middleware/auth");

router.route("/")
    .post(protect, authorize("admin", "user"), createReview);
router.route("/:id")
    .get(getReview);

module.exports = router;
