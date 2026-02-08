import prisma from "../../config/database";
import {
  ProductCategory,
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
} from "../types";

class ProductCategoryRepository {
  async findAll(): Promise<ProductCategory[]> {
    return await prisma.productCategory.findMany({
      include: {
        _count: {
          select: {
            product: true,
          },
        },
      },
    });
  }

  async findById(id: string | number): Promise<ProductCategory | null> {
    return await prisma.productCategory.findUnique({
      where: { id: BigInt(id) },
      include: {
        product: {
          select: {
            id: true,
            productCode: true,
            name: true,
            unitPrice: true,
            unitType: true,
            active: true,
          },
        },
      },
    });
  }

  async findByName(name: string): Promise<ProductCategory | null> {
    return await prisma.productCategory.findUnique({
      where: { name },
    });
  }

  async create(
    categoryData: CreateProductCategoryDto,
  ): Promise<ProductCategory> {
    return await prisma.productCategory.create({
      data: categoryData,
    });
  }

  async update(
    id: string | number,
    categoryData: UpdateProductCategoryDto,
  ): Promise<ProductCategory> {
    return await prisma.productCategory.update({
      where: { id: BigInt(id) },
      data: categoryData,
    });
  }

  async delete(id: string | number): Promise<ProductCategory> {
    return await prisma.productCategory.delete({
      where: { id: BigInt(id) },
    });
  }

  async checkCategoryInUse(id: string | number): Promise<boolean> {
    const productCount = await prisma.product.count({
      where: { categoryId: BigInt(id) },
    });

    return productCount > 0;
  }
}

export default new ProductCategoryRepository();
