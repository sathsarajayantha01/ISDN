import productRepository from "../repositories/product.repository";
import productCategoryRepository from "../repositories/productCategory.repository";
import promotionsRepository from "../repositories/promotions.repository";
import { Product, CreateProductDto, UpdateProductDto } from "../types";

class ProductService {
  async getAllProducts(branchId: string | undefined): Promise<Product[]> {
    if (branchId) {
      return await productRepository.findAllByBranchId(branchId);
    } else {
      return await productRepository.findAll();
    }
  }

  async getProductById(id: string | number): Promise<Product> {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  }

  async getProductsByCategory(categoryId: string | number): Promise<Product[]> {
    // Verify category exists
    const category = await productCategoryRepository.findById(categoryId);
    if (!category) {
      throw new Error("Product category not found");
    }

    return await productRepository.findByCategory(categoryId);
  }

  async createProduct(productData: CreateProductDto): Promise<Product> {
    // Check if product with the same code already exists
    const existingProduct = await productRepository.findByProductCode(
      productData.productCode,
    );
    if (existingProduct) {
      throw new Error("Product with this code already exists");
    }

    // Verify category exists
    const category = await productCategoryRepository.findById(
      Number(productData.categoryId),
    );
    if (!category) {
      throw new Error("Product category not found");
    }

    return await productRepository.create(productData);
  }

  async updateProduct(
    id: string | number,
    productData: UpdateProductDto,
  ): Promise<Product> {
    const products = await this.getProductById(id);
    if (!products) {
      throw new Error("Product not found");
    }

    // If product code is being updated, check if it's already in use by another product
    if (productData.productCode) {
      const existingProduct = await productRepository.findByProductCode(
        productData.productCode,
      );
      if (existingProduct && existingProduct.id !== BigInt(id)) {
        throw new Error("Product code is already in use by another product");
      }
    }

    // If category is being updated, verify it exists
    if (productData.categoryId) {
      const category = await productCategoryRepository.findById(
        Number(productData.categoryId),
      );
      if (!category) {
        throw new Error("Product category not found");
      }
    }

    // promotion is available given id if promotionId is being updated
    if (productData.promotionId) {
      const promotion = await promotionsRepository.findById(
        Number(productData.promotionId),
      );
      if (!promotion) {
        throw new Error("Promotion not found");
      }
    }

    // If new images are provided, they will be handled in the repository
    // including deletion of old images

    return await productRepository.update(id, productData);
  }

  async deleteProduct(id: string | number): Promise<Product> {
    await this.getProductById(id);

    // Check if product is being used in inventory or orders
    const isInUse = await productRepository.checkProductInUse(id);
    if (isInUse) {
      throw new Error(
        "Cannot delete product that has inventory or order records. Consider deactivating it instead.",
      );
    }

    return await productRepository.delete(id);
  }

  async activateProduct(id: string | number): Promise<Product> {
    await this.getProductById(id);
    return await productRepository.update(id, { active: true });
  }

  async deactivateProduct(id: string | number): Promise<Product> {
    await this.getProductById(id);
    return await productRepository.update(id, { active: false });
  }

  async updateProductQuantity(
    id: string | number,
    branchId: string | number,
    quantity: number,
  ): Promise<Product> {
    const product = await productRepository.getProductByIdandBranchId(
      id,
      branchId,
    );
    if (!product) {
      throw new Error("Product not found");
    }

    // Update quantity in inventory
    const updatedProduct = await productRepository.updateProductQuantity(
      id,
      branchId,
      quantity,
    );

    if (!updatedProduct) {
      throw new Error("Failed to update product quantity");
    }

    return updatedProduct;
  }

  async transferProductQuantity(
    id: string | number,
    fromBranchId: string | number,
    toBranchId: string | number,
    quantity: number,
  ): Promise<Product> {
    const product = await productRepository.getProductByIdandBranchId(
      id,
      fromBranchId,
    );
    if (!product) {
      throw new Error("Product not found in the source branch inventory");
    }

    // Check if reserve branch and reserve quantity exist
    const reserveBranch =
      await productRepository.getInventoryByProductIdAndBranchId(
        id,
        toBranchId,
      );
    if (
      reserveBranch.reservedQuantity != null &&
      reserveBranch.reservedQuantity > 0
    ) {
      throw new Error(
        "Cannot transfer product quantity because there is a pending reservation in the destination branch",
      );
    }

    // Transfer quantity between branches
    const updatedProduct = await productRepository.transferProductQuantity(
      id,
      fromBranchId,
      toBranchId,
      quantity,
    );

    if (!updatedProduct) {
      throw new Error("Failed to transfer product quantity");
    }

    return updatedProduct;
  }

  async reviewTransferQuantity(
    id: string | number,
    branchId: string | number,
    status: "accept" | "reject",
  ): Promise<Product> {
    if (status !== "accept" && status !== "reject") {
      throw new Error("Invalid status. Must be 'accept' or 'reject'");
    }

    const product = await productRepository.getProductByIdandBranchId(
      id,
      branchId,
    );
    if (!product) {
      throw new Error("Product not found in branch inventory");
    }

    const updatedProduct = await productRepository.reviewTransferQuantity(
      id,
      branchId,
      status,
    );

    if (!updatedProduct) {
      throw new Error("Failed to review transfer quantity");
    }

    return updatedProduct;
  }
}

export default new ProductService();
