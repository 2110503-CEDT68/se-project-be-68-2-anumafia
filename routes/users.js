const express = require("express");
const router = express.Router({ mergeParams: true });
const { getUsers } = require("../controllers/user");
const { protect, authorize } = require("../middleware/auth");

router.route("/")
    .get(protect, authorize("admin"), getUsers);

module.exports = router;
