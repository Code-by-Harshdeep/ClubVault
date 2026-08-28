const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  campusAdmin,
  getCampusOverview,
} = require("../controller/campusController");

const router = express.Router();

router.use(authMiddleware);
router.get("/:campusId/overview", campusAdmin, getCampusOverview);

module.exports = router;
