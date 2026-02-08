import { ProductCategory, CreateProductCategoryDto, UpdateProductCategoryDto } from "../types";
declare class ProductCategoryRepository {
    findAll(): Promise<ProductCategory[]>;
    findById(id: string | number): Promise<ProductCategory | null>;
    findByName(name: string): Promise<ProductCategory | null>;
    create(categoryData: CreateProductCategoryDto): Promise<ProductCategory>;
    update(id: string | number, categoryData: UpdateProductCategoryDto): Promise<ProductCategory>;
    delete(id: string | number): Promise<ProductCategory>;
    checkCategoryInUse(id: string | number): Promise<boolean>;
}
declare const _default: ProductCategoryRepository;
export default _default;
