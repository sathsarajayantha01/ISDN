import express from "express";
import orderController from "../controllers/order.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = express.Router();

// Get all orders (supports filtering by userId, branchId, status via query params)
router.get("/", authenticate, orderController.getAllOrders);

// Get order by order number
router.get(
  "/orderNumber/:orderNumber",
  authenticate,
  orderController.getOrderByOrderNumber,
);

// Get order by ID
router.get("/:id", authenticate, orderController.getOrderById);

// Get orders for a specific user
router.get("/user/:userId", authenticate, orderController.getOrdersByUserId);

// Create new order
router.post(
  "/",
  authenticate,
  authorize(["Retail Customer", "Business Customer"]),
  orderController.createOrder,
);

// Update order status
router.patch(
  "/:id/status",
  authenticate,
  authorize([
    "System Administrator",
    "Head Office Manager",
    "RDC Staff",
    "Branch Manager",
    "Sales Representative",
  ]),
  orderController.updateOrderStatus,
);

export default router;
