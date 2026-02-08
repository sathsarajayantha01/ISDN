import { Vehicle } from "../types";
declare class VehicleRepository {
    findAll(): Promise<Vehicle[]>;
    findById(id: string | number): Promise<Vehicle | null>;
    create(data: Omit<Vehicle, "id">): Promise<Vehicle>;
    update(id: string | number, data: Partial<Omit<Vehicle, "id">>): Promise<Vehicle>;
    delete(id: string | number): Promise<Vehicle>;
    findByVehicleNumber(vehicleNumber: string): Promise<Vehicle | null>;
}
declare const _default: VehicleRepository;
export default _default;
