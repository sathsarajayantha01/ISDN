"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../../config/database"));
class VehicleRepository {
    async findAll() {
        return await database_1.default.vehicle.findMany();
    }
    async findById(id) {
        return await database_1.default.vehicle.findUnique({
            where: { id: BigInt(id) },
        });
    }
    async create(data) {
        return await database_1.default.vehicle.create({
            data: {
                vehicleNumber: data.vehicleNumber,
                vehicleType: data.vehicleType,
                brand: data.brand,
                capacityKg: data.capacityKg,
                branchId: data.branchId || null,
            },
        });
    }
    async update(id, data) {
        return await database_1.default.vehicle.update({
            where: { id: BigInt(id) },
            data: {
                vehicleNumber: data.vehicleNumber,
                vehicleType: data.vehicleType,
                brand: data.brand,
                capacityKg: data.capacityKg,
            },
        });
    }
    async delete(id) {
        return await database_1.default.vehicle.delete({
            where: { id: BigInt(id) },
        });
    }
    async findByVehicleNumber(vehicleNumber) {
        return await database_1.default.vehicle.findUnique({
            where: { vehicleNumber },
        });
    }
}
exports.default = new VehicleRepository();
//# sourceMappingURL=vehicle.repository.js.map