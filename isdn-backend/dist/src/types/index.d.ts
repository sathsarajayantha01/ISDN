import { Decimal } from "@prisma/client/runtime/client";
export interface User {
    id: bigint;
    username: string;
    email: string;
    password: string;
    roleId: bigint;
    name: string;
    contactNumber: string;
    businessName?: string | null;
    customerCode?: string | null;
    address?: string | null;
    district?: string | null;
    customerType?: string | null;
    assignedBranchId?: bigint | null;
    branchId?: bigint | null;
    vehicleId?: bigint | null;
    licenseNumber?: string | null;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface Role {
    id: bigint;
    roleName: string;
    permissions: string;
    active: boolean;
}
export interface Branch {
    id: bigint;
    name: string;
    code: string;
    region: string;
    address: string;
    contactNumber: string;
    active: boolean;
}
export interface CreateUserDto {
    username: string;
    email: string;
    password: string;
    roleId: bigint;
    name: string;
    contactNumber: string;
    businessName?: string;
    customerCode?: string;
    address?: string;
    district?: string;
    customerType?: string;
    assignedBranchId?: bigint;
    branchId?: bigint;
    vehicleNumber?: string;
    vehicleType?: string;
    vehicleBrand?: string;
    vehicleCapacity?: Decimal;
    licenseNumber?: string;
}
export interface UpdateUserDto {
    username?: string;
    email?: string;
    password?: string;
    roleId?: bigint;
    name?: string;
    contactNumber?: string;
    businessName?: string;
    customerCode?: string;
    address?: string;
    district?: string;
    customerType?: string;
    assignedBranchId?: bigint;
    branchId?: bigint;
    vehicleId?: bigint;
    licenseNumber?: string;
    active?: boolean;
}
export interface CreateRoleDto {
    roleName: string;
    permissions?: string;
}
export interface UpdateRoleDto {
    roleName?: string;
    permissions?: string;
    active?: boolean;
}
export interface CreateBranchDto {
    name: string;
    code: string;
    region: string;
    address: string;
    contactNumber: string;
}
export interface UpdateBranchDto {
    name?: string;
    code?: string;
    region?: string;
    address?: string;
    contactNumber?: string;
    active?: boolean;
}
export interface LoginDto {
    email: string;
    password: string;
}
export interface JwtPayload {
    id: string;
    email: string;
    username: string;
    roleId: string;
    iat?: number;
    exp?: number;
}
export interface Vehicle {
    id: bigint;
    vehicleNumber: string;
    vehicleType: string;
    brand: string;
    capacityKg: Decimal;
    branchId?: bigint | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface ProductCategory {
    id: bigint;
    name: string;
    description?: string | null;
}
export interface Product {
    id: bigint;
    productCode: string;
    name: string;
    categoryId: bigint;
    unitPrice: Decimal;
    unitType: string;
    promotionId?: bigint | null;
    description?: string | null;
    imageUrl?: string | null;
    active: boolean;
    productImages?: ProductImage[];
}
export interface ProductImage {
    id: bigint;
    productId: bigint;
    imageUrl: string;
    createdAt: Date;
}
export interface CreateProductCategoryDto {
    name: string;
    description?: string;
}
export interface UpdateProductCategoryDto {
    name?: string;
    description?: string;
}
export interface CreateProductDto {
    productCode: string;
    name: string;
    categoryId: bigint;
    unitPrice: Decimal;
    unitType: string;
    promotionId?: bigint;
    description?: string;
    imageUrl?: string;
}
export interface UpdateProductDto {
    productCode?: string;
    name?: string;
    categoryId?: bigint;
    unitPrice?: Decimal;
    unitType?: string;
    promotionId?: bigint;
    description?: string;
    imageUrl?: string;
    active?: boolean;
}
export interface Promotion {
    id: bigint;
    title: string;
    discountPercent: Decimal;
    startDate: Date;
    endDate: Date;
    active: boolean;
}
export interface CreatePromotionDto {
    title: string;
    discountPercent: number;
    startDate: Date;
    endDate: Date;
    active?: boolean;
}
export interface UpdatePromotionDto {
    title?: string;
    discountPercent?: number;
    startDate?: Date;
    endDate?: Date;
    active?: boolean;
}
