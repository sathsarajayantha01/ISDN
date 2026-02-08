import { Request, Response, NextFunction } from "express";
import productService from "../services/product.service";
import { CreateProductDto, UpdateProductDto } from "../types";
import { serializeBigInt } from "../utils/serializer";
import { getImagePath, rollbackUploadedFiles } from "../utils/multer";

class ProductController {
  async getAllProducts(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const branchId = req.headers.branchid as string | undefined;

      const products = await productService.getAllProducts(branchId as string);
      res.json({
        success: true,
        data: serializeBigInt(products),
        message: "Products retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id as string);
      res.json({
        success: true,
        data: serializeBigInt(product),
        message: "Product retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductsByCategory(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { categoryId } = req.params;
      const products = await productService.getProductsByCategory(
        categoryId as string,
      );
      res.json({
        success: true,
        data: serializeBigInt(products),
        message: "Products retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async createProduct(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const productData: CreateProductDto = req.body;
      const files = (req.files as Express.Multer.File[]) || [];

      // Validate required fields
      const requiredFields = [
        "productCode",
        "name",
        "categoryId",
        "unitPrice",
        "unitType",
      ];
      const missingFields = requiredFields.filter(
        (field) => !productData[field as keyof CreateProductDto],
      );

      if (missingFields.length > 0) {
        rollbackUploadedFiles(files);
        res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
        });
        return;
      }

      // Add image paths if files were uploaded
      if (files.length > 0) {
        productData.imageUrls = files.map((file) =>
          getImagePath(file.filename),
        );
        // Set first image as main image
        productData.imageUrl = productData.imageUrls[0];
      }

      const newProduct = await productService.createProduct(productData);
      res.status(201).json({
        success: true,
        data: serializeBigInt(newProduct),
        message: "Product created successfully",
      });
    } catch (error) {
      // Rollback uploaded files on error
      const files = (req.files as Express.Multer.File[]) || [];
      rollbackUploadedFiles(files);
      next(error);
    }
  }

  async updateProduct(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const productData: UpdateProductDto = req.body;
      const files = (req.files as Express.Multer.File[]) || [];

      // Add image paths if files were uploaded
      if (files.length > 0) {
        productData.imageUrls = files.map((file) =>
          getImagePath(file.filename),
        );
        // Set first image as main image
        productData.imageUrl = productData.imageUrls[0];
      }

      const updatedProduct = await productService.updateProduct(
        id as string,
        productData,
      );
      res.json({
        success: true,
        data: serializeBigInt(updatedProduct),
        message: "Product updated successfully",
      });
    } catch (error) {
      // Rollback uploaded files on error
      const files = (req.files as Express.Multer.File[]) || [];
      rollbackUploadedFiles(files);
      next(error);
    }
  }

  async deleteProduct(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      await productService.deleteProduct(id as string);
      res.json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async activateProduct(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const updatedProduct = await productService.activateProduct(id as string);
      res.json({
        success: true,
        data: serializeBigInt(updatedProduct),
        message: "Product activated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async deactivateProduct(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const updatedProduct = await productService.deactivateProduct(
        id as string,
      );
      res.json({
        success: true,
        data: serializeBigInt(updatedProduct),
        message: "Product deactivated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProductQuantity(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const branchId = req.headers.branchid;
      const { quantity } = req.body;

      // Validate required fields
      if (!branchId) {
        res.status(400).json({
          success: false,
          message: "Missing required header: branchId",
        });
        return;
      }

      if (quantity === undefined || quantity === null) {
        res.status(400).json({
          success: false,
          message: "Missing required field: quantity",
        });
        return;
      }

      const updatedProduct = await productService.updateProductQuantity(
        id as string,
        branchId as string,
        quantity as number,
      );
      res.json({
        success: true,
        data: serializeBigInt(updatedProduct),
        message: "Product quantity updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async transferProductQuantity(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { fromBranchId, toBranchId, quantity } = req.body;
      const updatedProduct = await productService.transferProductQuantity(
        id as string,
        fromBranchId as string,
        toBranchId as string,
        quantity,
      );
      res.json({
        success: true,
        data: serializeBigInt(updatedProduct),
        message: "Product quantity transferred successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async reviewTransferQuantity(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { branchId, status } = req.body;
      const updatedProduct = await productService.reviewTransferQuantity(
        id as string,
        branchId as string,
        status,
      );
      res.json({
        success: true,
        data: serializeBigInt(updatedProduct),
        message: `Product transfer ${status}ed successfully`,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductController();
