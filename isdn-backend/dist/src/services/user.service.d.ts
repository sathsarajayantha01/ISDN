import { User, CreateUserDto, UpdateUserDto } from "../types";
declare class UserService {
    getAllUsers(branchId: string | undefined, roleId: string | undefined): Promise<User[]>;
    getUserById(id: string | number): Promise<User>;
    getUserByEmail(email: string): Promise<User>;
    getUserByUsername(username: string): Promise<User>;
    createUser(userData: CreateUserDto): Promise<User>;
    updateUser(id: string | number, userData: UpdateUserDto): Promise<User>;
    deleteUser(id: string | number): Promise<User>;
    changePassword(id: string | number, oldPassword: string, newPassword: string): Promise<User>;
    activateUser(id: string | number): Promise<User>;
}
declare const _default: UserService;
export default _default;
