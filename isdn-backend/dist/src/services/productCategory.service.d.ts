import { ProductCategory, CreateProductCategoryDto, UpdateProductCategoryDto } from "../types";
declare class ProductCategoryService {
    getAllCategories(): Promise<ProductCategory[]>;
    getCategoryById(id: string | number): Promise<ProductCategory>;
    createCategory(categoryData: CreateProductCategoryDto): Promise<ProductCategory>;
    updateCategory(id: string | number, categoryData: UpdateProductCategoryDto): Promise<ProductCategory>;
    deleteCategory(id: string | number): Promise<ProductCategory>;
}
declare const _default: ProductCategoryService;
export default _default;
