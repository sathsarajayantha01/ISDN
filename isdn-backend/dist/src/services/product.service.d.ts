import { Product, CreateProductDto, UpdateProductDto } from "../types";
declare class ProductService {
    getAllProducts(): Promise<Product[]>;
    getProductById(id: string | number): Promise<Product>;
    getProductsByCategory(categoryId: string | number): Promise<Product[]>;
    createProduct(productData: CreateProductDto): Promise<Product>;
    updateProduct(id: string | number, productData: UpdateProductDto): Promise<Product>;
    deleteProduct(id: string | number): Promise<Product>;
    activateProduct(id: string | number): Promise<Product>;
    deactivateProduct(id: string | number): Promise<Product>;
}
declare const _default: ProductService;
export default _default;
