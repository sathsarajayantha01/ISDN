import { User, CreateUserDto, UpdateUserDto } from "../types";
declare class UserRepository {
    findAll(): Promise<User[]>;
    findById(id: string | number): Promise<User | null>;
    findByBranchId(branchId: string): Promise<User[]>;
    findByEmail(email: string): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    create(userData: CreateUserDto & {
        vehicleId?: bigint;
    }): Promise<User>;
    update(id: string | number, userData: UpdateUserDto): Promise<User>;
    delete(id: string | number): Promise<User>;
    updatePassword(id: string | number, hashedPassword: string): Promise<User>;
    getRoleNameById(roleId: bigint): Promise<string | null>;
}
declare const _default: UserRepository;
export default _default;
