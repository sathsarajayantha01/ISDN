import express from "express";
import dashboardController from "../controllers/dashboard.controller";
import { authenticate } from "../middleware/auth";

const router = express.Router();

// Get order statistics with optional filters (fromDate, toDate in query; branchId in header)
router.get(
  "/order-statistics",
  authenticate,
  dashboardController.getOrderStatistics,
);

// Get recent orders (last 10) filtered by date range and branch
router.get("/recent-orders", authenticate, dashboardController.getRecentOrders);

// Get low stock products (quantity < 5) filtered by date range and branch
router.get(
  "/low-stock-products",
  authenticate,
  dashboardController.getLowStockProducts,
);

export default router;
