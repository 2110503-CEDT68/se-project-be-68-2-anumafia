const express = require("express");
const router = express.Router({ mergeParams: true });
const { getInterviewSessions, addInterviewSession, getInterviewSession, updateInterviewSession, deleteInterviewSession,updateAttendanceStatus } = require("../controllers/interview");
const { protect, authorize } = require("../middleware/auth");

router.route("/")
    .get(protect, getInterviewSessions)
    .post(protect, authorize("admin", "user"), addInterviewSession);
router.route("/:id")
    .get(protect, getInterviewSession)
    .put(protect, authorize("admin", "user"), updateInterviewSession)
    .delete(protect, authorize("admin", "user"), deleteInterviewSession);

router.route("/:id/attendance")
    .put(protect, authorize("company"), updateAttendanceStatus);


module.exports = router;
