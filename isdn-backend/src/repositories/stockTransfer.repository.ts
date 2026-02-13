import prisma from "../../config/database";

class StockTransferRepository {
  async create(data: {
    productId: bigint;
    fromBranchId: bigint;
    toBranchId: bigint;
    quantity: number;
    notes?: string;
    transferDate?: Date;
  }) {
    return await prisma.stockTransfer.create({
      data: {
        productId: data.productId,
        fromBranchId: data.fromBranchId,
        toBranchId: data.toBranchId,
        quantity: data.quantity,
        notes: data.notes || null,
        transferDate: data.transferDate || new Date(),
        status: "Pending",
      },
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
  }

  async findAll() {
    return await prisma.stockTransfer.findMany({
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
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id: string | number) {
    return await prisma.stockTransfer.findUnique({
      where: { id: BigInt(id) },
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
  }

  async updateStatus(id: string | number, status: string) {
    return await prisma.stockTransfer.update({
      where: { id: BigInt(id) },
      data: { status },
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
  }
}

export default new StockTransferRepository();
