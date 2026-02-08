"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../../config/database"));
class UserRepository {
    async findAll() {
        return await database_1.default.user.findMany({
            include: {
                role: true,
                branch: true,
                assignedBranch: true,
                vehicle: true,
            },
        });
    }
    async findById(id) {
        return await database_1.default.user.findUnique({
            where: { id: BigInt(id) },
            include: {
                role: true,
                branch: true,
                assignedBranch: true,
                vehicle: true,
            },
        });
    }
    async findByBranchId(branchId) {
        return await database_1.default.user.findMany({
            where: { branchId: BigInt(branchId) },
            include: {
                role: true,
                branch: true,
                assignedBranch: true,
                vehicle: true,
            },
        });
    }
    async findByEmail(email) {
        return await database_1.default.user.findUnique({
            where: { email },
            include: {
                role: true,
                branch: true,
                assignedBranch: true,
                vehicle: true,
            },
        });
    }
    async findByUsername(username) {
        return await database_1.default.user.findUnique({
            where: { username },
            include: {
                role: true,
                branch: true,
            },
        });
    }
    async create(userData) {
        return await database_1.default.user.create({
            data: {
                username: userData.username,
                email: userData.email,
                password: userData.password,
                name: userData.name,
                contactNumber: userData.contactNumber,
                businessName: userData.businessName,
                customerCode: userData.customerCode,
                address: userData.address,
                district: userData.district,
                customerType: userData.customerType,
                licenseNumber: userData.licenseNumber,
                roleId: BigInt(userData.roleId),
                branchId: userData.branchId ? BigInt(userData.branchId) : null,
                assignedBranchId: userData.assignedBranchId
                    ? BigInt(userData.assignedBranchId)
                    : null,
                vehicleId: userData.vehicleId ? BigInt(userData.vehicleId) : null,
            },
            include: {
                role: true,
                branch: true,
                assignedBranch: true,
                vehicle: true,
            },
        });
    }
    async update(id, userData) {
        return await database_1.default.user.update({
            where: { id: BigInt(id) },
            data: {
                ...userData,
                roleId: userData.roleId ? BigInt(userData.roleId) : undefined,
                branchId: userData.branchId ? BigInt(userData.branchId) : undefined,
                assignedBranchId: userData.assignedBranchId
                    ? BigInt(userData.assignedBranchId)
                    : undefined,
                vehicleId: userData.vehicleId ? BigInt(userData.vehicleId) : undefined,
            },
            include: {
                role: true,
                branch: true,
                assignedBranch: true,
                vehicle: true,
            },
        });
    }
    async delete(id) {
        return await database_1.default.user.delete({
            where: { id: BigInt(id) },
        });
    }
    async updatePassword(id, hashedPassword) {
        return await database_1.default.user.update({
            where: { id: BigInt(id) },
            data: { password: hashedPassword },
        });
    }
    async getRoleNameById(roleId) {
        const role = await database_1.default.role.findUnique({
            where: { id: BigInt(roleId) },
            select: { roleName: true },
        });
        return role?.roleName || null;
    }
}
exports.default = new UserRepository();
//# sourceMappingURL=user.repository.js.map