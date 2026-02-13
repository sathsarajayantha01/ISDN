import stockTransferRepository from "../repositories/stockTransfer.repository";
import prisma from "../../config/database";

class StockTransferService {
  async createTransfer(data: {
    productId: string | number;
    fromBranchId: string | number;
    toBranchId: string | number;
    quantity: number;
    notes?: string;
  }) {
    // Validate that source and destination branches are different
    if (String(data.fromBranchId) === String(data.toBranchId)) {
      throw new Error("Source and destination branches must be different");
    }

    // Validate quantity
    if (data.quantity <= 0) {
      throw new Error("Quantity must be greater than zero");
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: BigInt(data.productId) },
    });
    if (!product) {
      throw new Error("Product not found");
    }

    // Verify source branch exists
    const fromBranch = await prisma.branch.findUnique({
      where: { id: BigInt(data.fromBranchId) },
    });
    if (!fromBranch) {
      throw new Error("Source branch not found");
    }

    // Verify destination branch exists
    const toBranch = await prisma.branch.findUnique({
      where: { id: BigInt(data.toBranchId) },
    });
    if (!toBranch) {
      throw new Error("Destination branch not found");
    }

    // Check if source branch has enough inventory
    const inventory = await prisma.inventory.findUnique({
      where: {
        productId_branchId: {
          productId: BigInt(data.productId),
          branchId: BigInt(data.fromBranchId),
        },
      },
    });

    if (!inventory || inventory.quantity < data.quantity) {
      throw new Error(
        "Insufficient inventory at source branch. Available: " +
          (inventory ? inventory.quantity : 0),
      );
    }

    return await stockTransferRepository.create({
      productId: BigInt(data.productId),
      fromBranchId: BigInt(data.fromBranchId),
      toBranchId: BigInt(data.toBranchId),
      quantity: data.quantity,
      notes: data.notes,
    });
  }

  async getAllTransfers() {
    return await stockTransferRepository.findAll();
  }

  async getTransferById(id: string | number) {
    const transfer = await stockTransferRepository.findById(id);
    if (!transfer) {
      throw new Error("Stock transfer not found");
    }
    return transfer;
  }

  async approveTransfer(id: string | number) {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch the transfer and verify it is Pending
      const transfer = await tx.stockTransfer.findUnique({
        where: { id: BigInt(id) },
      });

      if (!transfer) {
        throw new Error("Stock transfer not found");
      }

      if (transfer.status !== "Pending") {
        throw new Error(
          `Cannot approve transfer. Current status is '${transfer.status}', expected 'Pending'.`,
        );
      }

      // 2. Check and decrement inventory at the source branch
      const sourceInventory = await tx.inventory.findUnique({
        where: {
          productId_branchId: {
            productId: transfer.productId,
            branchId: transfer.fromBranchId,
          },
        },
      });

      if (!sourceInventory || sourceInventory.quantity < transfer.quantity) {
        throw new Error(
          "Insufficient inventory at source branch. Available: " +
            (sourceInventory ? sourceInventory.quantity : 0),
        );
      }

      await tx.inventory.update({
        where: {
          productId_branchId: {
            productId: transfer.productId,
            branchId: transfer.fromBranchId,
          },
        },
        data: {
          quantity: {
            decrement: transfer.quantity,
          },
        },
      });

      // 3. Increment inventory at the destination branch (upsert in case it doesn't exist)
      await tx.inventory.upsert({
        where: {
          productId_branchId: {
            productId: transfer.productId,
            branchId: transfer.toBranchId,
          },
        },
        update: {
          quantity: {
            increment: transfer.quantity,
          },
        },
        create: {
          productId: transfer.productId,
          branchId: transfer.toBranchId,
          quantity: transfer.quantity,
          active: true,
        },
      });

      // 4. Update the transfer status to 'Completed'
      const updatedTransfer = await tx.stockTransfer.update({
        where: { id: BigInt(id) },
        data: { status: "Completed" },
        include: {
          product: {
            select: {
              id: true,
              productCode: true,
              name: true,
              unitType: true,
            },
          },
          fromBranch: {
            select: {
              id: true,
              name: true,
              code: true,
              region: true,
            },
          },
          toBranch: {
            select: {
              id: true,
              name: true,
              code: true,
              region: true,
            },
          },
        },
      });

      return updatedTransfer;
    });
  }

  async rejectTransfer(id: string | number) {
    const transfer = await stockTransferRepository.findById(id);
    if (!transfer) {
      throw new Error("Stock transfer not found");
    }

    if (transfer.status !== "Pending") {
      throw new Error(
        `Cannot reject transfer. Current status is '${transfer.status}', expected 'Pending'.`,
      );
    }

    return await stockTransferRepository.updateStatus(id, "Rejected");
  }
}

export default new StockTransferService();
