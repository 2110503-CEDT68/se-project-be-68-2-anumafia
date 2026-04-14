const express = require("express");
const router = express.Router({ mergeParams: true });
const { banUser, unbanUser, giveYellowCard, getUsers } = require("../controllers/users");
const { protect, authorize } = require("../middleware/auth");

router.route("/")
    .get(protect, authorize("admin"), getUsers);
router.route('/ban/:id')
    .put(protect, authorize('admin'), banUser);
router.route('/unban/:id')
    .put(protect, authorize('admin'), unbanUser);
router.route('/yellowcard/:id')
    .put(protect, authorize('admin'), giveYellowCard);

module.exports = router;
