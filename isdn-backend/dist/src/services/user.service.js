"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_repository_1 = __importDefault(require("../repositories/user.repository"));
const vehicle_repository_1 = __importDefault(require("../repositories/vehicle.repository"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class UserService {
    async getAllUsers(branchId, roleId) {
        let users;
        if (branchId) {
            users = await user_repository_1.default.findByBranchId(branchId);
        }
        else {
            users = await user_repository_1.default.findAll();
        }
        // Apply roleId filter if provided
        if (roleId) {
            users = users.filter((user) => user.roleId === BigInt(roleId));
        }
        return users;
    }
    async getUserById(id) {
        const user = await user_repository_1.default.findById(id);
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
    async getUserByEmail(email) {
        const user = await user_repository_1.default.findByEmail(email);
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
    async getUserByUsername(username) {
        const user = await user_repository_1.default.findByUsername(username);
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
    async createUser(userData) {
        // Check if user with email already exists
        const existingUserByEmail = await user_repository_1.default.findByEmail(userData.email);
        if (existingUserByEmail) {
            throw new Error("User with this email already exists");
        }
        // Check if user with username already exists
        const existingUserByUsername = await user_repository_1.default.findByUsername(userData.username);
        if (existingUserByUsername) {
            throw new Error("User with this username already exists");
        }
        // if role name is Driver, ensure vehicle details are provided
        const roleName = await user_repository_1.default.getRoleNameById(userData.roleId);
        if (roleName === "Driver") {
            if (!userData.vehicleNumber ||
                !userData.vehicleType ||
                !userData.vehicleBrand ||
                !userData.vehicleCapacity) {
                throw new Error("Vehicle details are required for Driver role");
            }
            // Validate vehicle capacity is a positive integer
            if (Number(userData.vehicleCapacity) <= 0) {
                throw new Error("Vehicle capacity must be a positive integer");
            }
            // Check if vehicle number already exists
            const existingVehicle = await vehicle_repository_1.default.findByVehicleNumber(userData.vehicleNumber);
            if (existingVehicle) {
                throw new Error("Vehicle number already exists");
            }
            // Create vehicle
            const vehicle = await vehicle_repository_1.default.create({
                vehicleNumber: userData.vehicleNumber,
                vehicleType: userData.vehicleType,
                brand: userData.vehicleBrand,
                capacityKg: userData.vehicleCapacity,
                branchId: userData.branchId,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            // Hash password and create user with vehicle ID
            const hashedPassword = await bcryptjs_1.default.hash(userData.password, 12);
            const newUserData = {
                username: userData.username,
                email: userData.email,
                password: hashedPassword,
                roleId: userData.roleId,
                name: userData.name,
                contactNumber: userData.contactNumber,
                businessName: userData.businessName || undefined,
                customerCode: userData.customerCode || undefined,
                address: userData.address || undefined,
                district: userData.district || undefined,
                customerType: userData.customerType || undefined,
                assignedBranchId: userData.assignedBranchId,
                branchId: userData.branchId,
                vehicleId: vehicle.id,
                licenseNumber: userData.licenseNumber || undefined,
            };
            return await user_repository_1.default.create(newUserData);
        }
        // Hash password for non-driver users
        const hashedPassword = await bcryptjs_1.default.hash(userData.password, 12);
        const newUserData = {
            username: userData.username,
            email: userData.email,
            password: hashedPassword,
            roleId: userData.roleId,
            name: userData.name,
            contactNumber: userData.contactNumber,
            businessName: userData.businessName || undefined,
            customerCode: userData.customerCode || undefined,
            address: userData.address || undefined,
            district: userData.district || undefined,
            customerType: userData.customerType || undefined,
            assignedBranchId: userData.assignedBranchId,
            branchId: userData.branchId,
            licenseNumber: userData.licenseNumber || undefined,
        };
        return await user_repository_1.default.create(newUserData);
    }
    async updateUser(id, userData) {
        await this.getUserById(id);
        // If email is being updated, check if it's already in use by another user
        if (userData.email) {
            const existingUser = await user_repository_1.default.findByEmail(userData.email);
            if (existingUser && existingUser.id !== BigInt(id)) {
                throw new Error("Email is already in use by another user");
            }
        }
        // If username is being updated, check if it's already in use by another user
        if (userData.username) {
            const existingUser = await user_repository_1.default.findByUsername(userData.username);
            if (existingUser && existingUser.id !== BigInt(id)) {
                throw new Error("Username is already in use by another user");
            }
        }
        // Remove password from update data if present (use separate method for password updates)
        const { password, ...updateData } = userData;
        return await user_repository_1.default.update(id, updateData);
    }
    async deleteUser(id) {
        await this.getUserById(id);
        return await user_repository_1.default.delete(id);
    }
    async changePassword(id, oldPassword, newPassword) {
        const user = await this.getUserById(id);
        // Verify old password
        const isValidPassword = await bcryptjs_1.default.compare(oldPassword, user.password);
        if (!isValidPassword) {
            throw new Error("Invalid current password");
        }
        // Hash new password
        const hashedNewPassword = await bcryptjs_1.default.hash(newPassword, 12);
        return await user_repository_1.default.updatePassword(id, hashedNewPassword);
    }
    async activateUser(id) {
        await this.getUserById(id);
        return await user_repository_1.default.update(id, { active: true });
    }
}
exports.default = new UserService();
//# sourceMappingURL=user.service.js.map