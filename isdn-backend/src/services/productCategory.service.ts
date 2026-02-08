import productCategoryRepository from "../repositories/productCategory.repository";
import {
  ProductCategory,
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
} from "../types";

class ProductCategoryService {
  async getAllCategories(): Promise<ProductCategory[]> {
    return await productCategoryRepository.findAll();
  }

  async getCategoryById(id: string | number): Promise<ProductCategory> {
    const category = await productCategoryRepository.findById(id);
    if (!category) {
      throw new Error("Product category not found");
    }
    return category;
  }

  async createCategory(
    categoryData: CreateProductCategoryDto,
  ): Promise<ProductCategory> {
    // Check if category with the same name already exists
    const existingCategory = await productCategoryRepository.findByName(
      categoryData.name,
    );
    if (existingCategory) {
      throw new Error("Product category with this name already exists");
    }

    return await productCategoryRepository.create(categoryData);
  }

  async updateCategory(
    id: string | number,
    categoryData: UpdateProductCategoryDto,
  ): Promise<ProductCategory> {
    await this.getCategoryById(id);

    // If name is being updated, check if it's already in use by another category
    if (categoryData.name) {
      const existingCategory = await productCategoryRepository.findByName(
        categoryData.name,
      );
      if (existingCategory && existingCategory.id !== BigInt(id)) {
        throw new Error("Category name is already in use by another category");
      }
    }

    return await productCategoryRepository.update(id, categoryData);
  }

  async deleteCategory(id: string | number): Promise<ProductCategory> {
    await this.getCategoryById(id);

    // Check if category is being used by any products
    const isInUse = await productCategoryRepository.checkCategoryInUse(id);
    if (isInUse) {
      throw new Error(
        "Cannot delete category that has associated products. Please reassign or delete the products first.",
      );
    }

    return await productCategoryRepository.delete(id);
  }
}

export default new ProductCategoryService();
