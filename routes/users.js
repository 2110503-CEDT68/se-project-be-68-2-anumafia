const express = require("express");
const router = express.Router({ mergeParams: true });
const { getUsers, getUser } = require("../controllers/users");
const { protect, authorize } = require("../middleware/auth");

router.route("/")
    .get(protect, authorize("admin"), getUsers);
router.route("/:id")
    .get(protect, authorize("admin"), getUser);

module.exports = router;
