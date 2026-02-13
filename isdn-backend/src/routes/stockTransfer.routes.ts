import express from "express";
import stockTransferController from "../controllers/stockTransfer.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = express.Router();

// Create a new stock transfer request
router.post(
  "/request",
  authenticate,
  authorize([
    "System Administrator",
    "Head Office Manager",
    "RDC Staff",
    "Logistics Officer",
  ]),
  stockTransferController.createTransfer,
);

// Get all stock transfers
router.get("/", authenticate, stockTransferController.getAllTransfers);

// Get stock transfer by ID
router.get("/:id", authenticate, stockTransferController.getTransferById);

// Approve a stock transfer (decrement source, increment destination, mark Completed)
router.put(
  "/approve/:id",
  authenticate,
  authorize([
    "System Administrator",
    "Head Office Manager",
  ]),
  stockTransferController.approveTransfer,
);

// Reject a stock transfer
router.put(
  "/reject/:id",
  authenticate,
  authorize([
    "System Administrator",
    "Head Office Manager",
  ]),
  stockTransferController.rejectTransfer,
);

export default router;
