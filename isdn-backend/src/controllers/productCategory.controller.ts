import { Request, Response, NextFunction } from "express";
import productCategoryService from "../services/productCategory.service";
import { CreateProductCategoryDto, UpdateProductCategoryDto } from "../types";
import { serializeBigInt } from "../utils/serializer";

class ProductCategoryController {
  async getAllCategories(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const categories = await productCategoryService.getAllCategories();
      res.json({
        success: true,
        data: serializeBigInt(categories),
        message: "Product categories retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const category = await productCategoryService.getCategoryById(
        id as string,
      );
      res.json({
        success: true,
        data: serializeBigInt(category),
        message: "Product category retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async createCategory(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const categoryData: CreateProductCategoryDto = req.body;

      // Validate required fields
      const requiredFields = ["name"];
      const missingFields = requiredFields.filter(
        (field) => !categoryData[field as keyof CreateProductCategoryDto],
      );

      if (missingFields.length > 0) {
        res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
        });
        return;
      }

      const newCategory =
        await productCategoryService.createCategory(categoryData);
      res.status(201).json({
        success: true,
        data: serializeBigInt(newCategory),
        message: "Product category created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const categoryData: UpdateProductCategoryDto = req.body;
      const updatedCategory = await productCategoryService.updateCategory(
        id as string,
        categoryData,
      );
      res.json({
        success: true,
        data: serializeBigInt(updatedCategory),
        message: "Product category updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      await productCategoryService.deleteCategory(id as string);
      res.json({
        success: true,
        message: "Product category deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductCategoryController();
