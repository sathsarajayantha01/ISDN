import express from "express";
import orderController from "../controllers/order.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = express.Router();

// Get all orders (supports filtering by userId, branchId, status via query params)
router.get("/", authenticate, orderController.getAllOrders);

// Get order by order number (must come before /:id)
router.get(
  "/orderNumber/:orderNumber",
  authenticate,
  orderController.getOrderByOrderNumber,
);

// Get orders for a specific user (must come before /:id)
router.get("/user/:userId", authenticate, orderController.getOrdersByUserId);

// Get orders for specific driver using query param (must come before /:id)
router.get("/driver", authenticate, orderController.getOrdersByDriverId);

// Get orders by status List using query param (must come before /:id)
router.get("/status", authenticate, orderController.getOrdersByStatusList);

// Get authenticated customer's own orders
router.get(
  "/my-orders",
  authenticate,
  authorize(["Retail Customer", "Business Customer"]),
  orderController.getMyOrders,
);

// Get order by ID (generic route, must come after specific routes)
router.get("/:id", authenticate, orderController.getOrderById);

// Create new order
router.post(
  "/",
  authenticate,
  authorize(["Retail Customer", "Business Customer"]),
  orderController.createOrder,
);

// Cancel order (customer-side)
router.put(
  "/:id/cancel",
  authenticate,
  authorize(["Retail Customer", "Business Customer"]),
  orderController.cancelOrder,
);

// Update order status
router.put(
  "/status/:id",
  authenticate,
  authorize([
    "System Administrator",
    "Head Office Manager",
    "RDC Staff",
    "Branch Manager",
    "Sales Representative",
    "Driver",
  ]),
  orderController.updateOrderStatus,
);

// Assign driver to order
router.put(
  "/assign-driver/:id",
  authenticate,
  authorize([
    "System Administrator",
    "Head Office Manager",
    "RDC Staff",
    "Branch Manager",
    "Sales Representative",
  ]),
  orderController.assignDriver,
);

// Update order location
router.put(
  "/location/:id",
  authenticate,
  authorize(["Driver", "System Administrator"]),
  orderController.updateLocation,
);

export default router;
