const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  clubMember,
  clubAdmin,
  requireFeature,
} = require("../middleware/clubMiddleware");

const clubController = require("../controller/clubController");
const transactionController = require("../controller/transactionController");
const budgetController = require("../controller/budgetController");
const eventController = require("../controller/eventController");
const dashboardController = require("../controller/dashboardController");

router.use(authMiddleware);

// --- Membership ---
router.post("/", clubController.createClub);
router.post("/join", clubController.joinClub);
router.get("/me", clubController.myClub);
router.get("/mine", clubController.listMyClubs);

router.get(
  "/:clubId/requests",
  clubMember,
  clubAdmin,
  clubController.listRequests,
);
router.post(
  "/:clubId/requests/:userId/approve",
  clubMember,
  clubAdmin,
  clubController.approveRequest,
);
router.post(
  "/:clubId/requests/:userId/reject",
  clubMember,
  clubAdmin,
  clubController.rejectRequest,
);

router.patch("/:clubId", clubMember, clubAdmin, clubController.updateClub);

router.get("/:clubId/members", clubMember, clubController.listMembers);
router.delete(
  "/:clubId/members/:userId",
  clubMember,
  clubAdmin,
  clubController.removeMember,
);
router.patch(
  "/:clubId/members/:userId/role",
  clubMember,
  clubAdmin,
  clubController.updateMemberRole,
);

// --- Dashboard & Activity ---
router.get("/:clubId/dashboard", clubMember, dashboardController.getDashboard);
router.get("/:clubId/activities", clubMember, clubController.listActivities);

// --- Transactions ---
router.get(
  "/:clubId/transactions",
  clubMember,
  transactionController.listTransactions,
);
router.post(
  "/:clubId/transactions",
  clubMember,
  transactionController.createTransaction,
);
router.patch(
  "/:clubId/transactions/:id/status",
  clubMember,
  clubAdmin,
  transactionController.updateTransactionStatus,
);
router.delete(
  "/:clubId/transactions/:id",
  clubMember,
  transactionController.deleteTransaction,
);

// --- Budgets ---
router.get("/:clubId/budgets", clubMember, budgetController.listBudgets);
router.post(
  "/:clubId/budgets",
  clubMember,
  clubAdmin,
  budgetController.createBudget,
);
router.patch(
  "/:clubId/budgets/:id",
  clubMember,
  clubAdmin,
  budgetController.updateBudget,
);
router.delete(
  "/:clubId/budgets/:id",
  clubMember,
  clubAdmin,
  budgetController.deleteBudget,
);

// --- Events (exclusive) ---
router.get(
  "/:clubId/events",
  clubMember,
  requireFeature("events"),
  eventController.listEvents,
);
router.post(
  "/:clubId/events",
  clubMember,
  requireFeature("events"),
  eventController.createEvent,
);
router.patch(
  "/:clubId/events/:id",
  clubMember,
  requireFeature("events"),
  eventController.updateEvent,
);
router.delete(
  "/:clubId/events/:id",
  clubMember,
  requireFeature("events"),
  eventController.deleteEvent,
);

module.exports = router;
