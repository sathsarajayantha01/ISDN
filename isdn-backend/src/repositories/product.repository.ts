import prisma from "../../config/database";
import { Product, CreateProductDto, UpdateProductDto } from "../types";
import { deleteImageFile } from "../utils/multer";

class ProductRepository {
  async findAll(): Promise<Product[]> {
    return await prisma.product.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        promotion: true,
        productImages: true,
        inventories: {
          include: {
            branch: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            reservedBranch: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });
  }

  async findById(id: string | number): Promise<Product | null> {
    return await prisma.product.findUnique({
      where: { id: BigInt(id) },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        promotion: true,
        productImages: true,
        inventories: {
          include: {
            branch: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            reservedBranch: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });
  }

  async findByProductCode(productCode: string): Promise<Product | null> {
    return await prisma.product.findUnique({
      where: { productCode },
      include: {
        productImages: true,
      },
    });
  }

  async findByCategory(categoryId: string | number): Promise<Product[]> {
    return await prisma.product.findMany({
      where: { categoryId: BigInt(categoryId) },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        productImages: true,
      },
    });
  }

  async create(productData: CreateProductDto): Promise<Product> {
    const { imageUrl, imageUrls, image, ...dataWithoutImage } = productData;

    const product = await prisma.product.create({
      data: {
        ...dataWithoutImage,
        imageUrl: imageUrl || null,
        categoryId: BigInt(productData.categoryId),
        promotionId: productData.promotionId
          ? BigInt(productData.promotionId)
          : null,
      },
      include: {
        category: true,
        promotion: true,
        productImages: true,
        inventories: {
          include: {
            branch: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            reservedBranch: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });

    // Create ProductImage records for all provided image URLs
    if (imageUrls && imageUrls.length > 0) {
      await Promise.all(
        imageUrls.map((url) =>
          prisma.productImage.create({
            data: {
              productId: product.id,
              imageUrl: url,
            },
          }),
        ),
      );
    }

    // Create Inventory with initial quantity of 0 for all branches
    const branches = await prisma.branch.findMany();
    await Promise.all(
      branches.map((branch) =>
        prisma.inventory.create({
          data: {
            productId: product.id,
            branchId: branch.id,
            quantity: 0,
          },
        }),
      ),
    );

    // Refresh product to get all images and inventories
    return await this.findById(product.id.toString());
  }

  async update(
    id: string | number,
    productData: UpdateProductDto,
  ): Promise<Product> {
    const updateData: any = { ...productData };

    // Convert BigInt fields
    if (productData.categoryId) {
      updateData.categoryId = BigInt(productData.categoryId);
    }
    if (productData.promotionId !== undefined) {
      updateData.promotionId = productData.promotionId
        ? BigInt(productData.promotionId)
        : null;
    }

    // Separate image URLs from other data
    const { imageUrl, imageUrls, image, ...dataWithoutImages } = updateData;

    const product = await prisma.product.update({
      where: { id: BigInt(id) },
      data: {
        ...dataWithoutImages,
        ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
      },
      include: {
        category: true,
        promotion: true,
        productImages: true,
      },
    });

    // If new image URLs are provided, delete old images and create new ones
    if (imageUrls && imageUrls.length > 0) {
      // Delete old product images and their files
      const oldImages = product.productImages || [];
      for (const oldImage of oldImages) {
        deleteImageFile(oldImage.imageUrl);
        await prisma.productImage.delete({
          where: { id: oldImage.id },
        });
      }

      // Create new ProductImage records
      await Promise.all(
        imageUrls.map((url) =>
          prisma.productImage.create({
            data: {
              productId: product.id,
              imageUrl: url,
            },
          }),
        ),
      );

      // Refresh product to get all new images
      return await this.findById(id);
    }

    return product;
  }

  async delete(id: string | number): Promise<Product> {
    // Get the product to retrieve image paths
    const product = await this.findById(id);

    if (product && product.imageUrl) {
      deleteImageFile(product.imageUrl);
    }

    // Delete related ProductImage records
    if (product?.productImages) {
      for (const productImage of product.productImages) {
        deleteImageFile(productImage.imageUrl);
      }
    }

    return await prisma.product.delete({
      where: { id: BigInt(id) },
    });
  }

  async checkProductInUse(id: string | number): Promise<boolean> {
    const inventoryCount = await prisma.inventory.count({
      where: { productId: BigInt(id) },
    });

    const orderItemCount = await prisma.orderItem.count({
      where: { productId: BigInt(id) },
    });

    return inventoryCount > 0 || orderItemCount > 0;
  }

  async getProductByIdandBranchId(
    productId: string | number,
    branchId: string | number,
  ): Promise<Product | null> {
    return await prisma.product.findFirst({
      where: {
        id: BigInt(productId),
        inventories: {
          some: {
            branchId: BigInt(branchId),
          },
        },
      },
      include: {
        category: true,
        promotion: true,
        productImages: true,
        inventories: {
          where: { branchId: BigInt(branchId) },
          include: {
            branch: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            reservedBranch: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });
  }

  async getInventoryByProductIdAndBranchId(
    productId: string | number,
    branchId: string | number,
  ): Promise<any> {
    return await prisma.inventory.findFirst({
      where: {
        productId: BigInt(productId),
        branchId: BigInt(branchId),
      },
    });
  }

  async updateProductQuantity(
    productId: string | number,
    branchId: string | number,
    quantity: number,
  ): Promise<Product> {
    // Check if product exists in the specified branch inventory
    const product = await this.getProductByIdandBranchId(productId, branchId);
    if (!product) {
      throw new Error("Product not found in the specified branch inventory");
    }

    // Find the inventory record
    const inventory = await prisma.inventory.findFirst({
      where: {
        productId: BigInt(productId),
        branchId: BigInt(branchId),
      },
    });

    if (!inventory) {
      throw new Error("Inventory not found");
    }

    // Update the inventory quantity for the product in the specified branch
    await prisma.inventory.update({
      where: {
        id: inventory.id,
      },
      data: {
        quantity: {
          increment: quantity,
        },
      },
    });

    return await this.getProductByIdandBranchId(productId, branchId);
  }

  async transferProductQuantity(
    productId: string | number,
    fromBranchId: string | number,
    toBranchId: string | number,
    quantity: number,
  ): Promise<Product> {
    // Check if product exists in the source branch inventory
    const product = await this.getProductByIdandBranchId(
      productId,
      fromBranchId,
    );
    if (!product) {
      throw new Error("Product not found in the source branch inventory");
    }

    // Step 1: Decrease quantity from the source branch inventory
    await prisma.inventory.updateMany({
      where: {
        productId: BigInt(productId),
        branchId: BigInt(fromBranchId),
      },
      data: {
        quantity: {
          decrement: quantity,
        },
      },
    });

    // Step 2: Set reserved quantity and reserved branch ID in the destination branch inventory
    const existingInventory = await prisma.inventory.findFirst({
      where: {
        productId: BigInt(productId),
        branchId: BigInt(toBranchId),
      },
    });

    if (existingInventory) {
      await prisma.inventory.update({
        where: { id: existingInventory.id },
        data: {
          reservedQuantity: quantity,
          reservedBranchId: BigInt(fromBranchId),
        },
      });
    } else {
      await prisma.inventory.create({
        data: {
          productId: BigInt(productId),
          branchId: BigInt(toBranchId),
          quantity: 0,
          reservedQuantity: quantity,
          reservedBranchId: BigInt(fromBranchId),
        },
      });
    }

    return await this.getProductByIdandBranchId(productId, toBranchId);
  }

  async reviewTransferQuantity(
    productId: string | number,
    branchId: string | number,
    status: "accept" | "reject",
  ): Promise<Product> {
    // Get the inventory record
    const inventory = await prisma.inventory.findFirst({
      where: {
        productId: BigInt(productId),
        branchId: BigInt(branchId),
      },
    });

    if (!inventory) {
      throw new Error("Inventory record not found");
    }

    if (inventory.reservedQuantity === 0) {
      throw new Error("No reserved quantity to review");
    }

    const reservedBranchId = inventory.reservedBranchId;

    if (status === "accept") {
      // Step 1: Update quantity in destination branch (add reserved quantity)
      const inventoryRecord = await prisma.inventory.findFirst({
        where: {
          productId: BigInt(productId),
          branchId: BigInt(branchId),
        },
      });

      if (inventoryRecord) {
        await prisma.inventory.update({
          where: { id: inventoryRecord.id },
          data: {
            quantity: {
              increment: inventoryRecord.reservedQuantity,
            },
            reservedQuantity: 0,
            reservedBranchId: null,
          },
        });
      }
    } else if (status === "reject") {
      // Step 1: Return reserved quantity back to source branch
      if (reservedBranchId) {
        const sourceInventory = await prisma.inventory.findFirst({
          where: {
            productId: BigInt(productId),
            branchId: reservedBranchId,
          },
        });

        if (sourceInventory) {
          await prisma.inventory.update({
            where: { id: sourceInventory.id },
            data: {
              quantity: {
                increment: inventory.reservedQuantity,
              },
            },
          });
        }
      }

      // Step 2: Clear reserved quantity and reserved branch ID
      const destInventory = await prisma.inventory.findFirst({
        where: {
          productId: BigInt(productId),
          branchId: BigInt(branchId),
        },
      });

      if (destInventory) {
        await prisma.inventory.update({
          where: { id: destInventory.id },
          data: {
            reservedQuantity: 0,
            reservedBranchId: null,
          },
        });
      }
    }

    return await this.getProductByIdandBranchId(productId, branchId);
  }

  async findAllByBranchId(branchId: string | number): Promise<Product[]> {
    return await prisma.product.findMany({
      where: {
        inventories: {
          some: {
            branchId: BigInt(branchId),
          },
        },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        promotion: true,
        productImages: true,
        inventories: {
          where: { branchId: BigInt(branchId) },
          include: {
            branch: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            reservedBranch: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });
  }
}

export default new ProductRepository();
