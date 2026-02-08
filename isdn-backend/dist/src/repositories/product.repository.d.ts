import { Product, CreateProductDto, UpdateProductDto } from "../types";
declare class ProductRepository {
    findAll(): Promise<Product[]>;
    findById(id: string | number): Promise<Product | null>;
    findByProductCode(productCode: string): Promise<Product | null>;
    findByCategory(categoryId: string | number): Promise<Product[]>;
    create(productData: CreateProductDto): Promise<Product>;
    update(id: string | number, productData: UpdateProductDto): Promise<Product>;
    delete(id: string | number): Promise<Product>;
    checkProductInUse(id: string | number): Promise<boolean>;
}
declare const _default: ProductRepository;
export default _default;
