import userRepository from "../repositories/user.repository";
import vehicleRepository from "../repositories/vehicle.repository";
import bcrypt from "bcryptjs";
import { User, CreateUserDto, UpdateUserDto } from "../types";

class UserService {
  async getAllUsers(
    branchId: string | undefined,
    roleId: string | undefined,
  ): Promise<User[]> {
    let users: User[];

    if (branchId) {
      users = await userRepository.findByBranchId(branchId);
    } else {
      users = await userRepository.findAll();
    }

    // Apply roleId filter if provided
    if (roleId) {
      users = users.filter((user) => user.roleId === BigInt(roleId));
    }

    return users;
  }

  async getUserById(id: string | number): Promise<User> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async getUserByUsername(username: string): Promise<User> {
    const user = await userRepository.findByUsername(username);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async getUsersByRoleName(
    roleName: string,
    branchId: string | undefined,
  ): Promise<User[]> {
    if (branchId) {
      const users = await userRepository.findByRoleNameAndBranchId(
        roleName,
        branchId,
      );
      return users;
    } else {
      const users = await userRepository.findByRoleName(roleName);
      return users;
    }
  }

  async createUser(userData: CreateUserDto): Promise<User> {
    // Check if user with email already exists
    const existingUserByEmail = await userRepository.findByEmail(
      userData.email,
    );
    if (existingUserByEmail) {
      throw new Error("User with this email already exists");
    }

    // Check if user with username already exists
    const existingUserByUsername = await userRepository.findByUsername(
      userData.username,
    );
    if (existingUserByUsername) {
      throw new Error("User with this username already exists");
    }

    // if role name is Driver, ensure vehicle details are provided
    const roleName = await userRepository.getRoleNameById(userData.roleId);
    if (roleName === "Driver") {
      if (
        !userData.vehicleNumber ||
        !userData.vehicleType ||
        !userData.vehicleBrand ||
        !userData.vehicleCapacity
      ) {
        throw new Error("Vehicle details are required for Driver role");
      }
      // Validate vehicle capacity is a positive integer
      if (Number(userData.vehicleCapacity) <= 0) {
        throw new Error("Vehicle capacity must be a positive integer");
      }

      // Check if vehicle number already exists
      const existingVehicle = await vehicleRepository.findByVehicleNumber(
        userData.vehicleNumber,
      );
      if (existingVehicle) {
        throw new Error("Vehicle number already exists");
      }

      // Create vehicle
      const vehicle = await vehicleRepository.create({
        vehicleNumber: userData.vehicleNumber,
        vehicleType: userData.vehicleType,
        brand: userData.vehicleBrand,
        capacityKg: userData.vehicleCapacity,
        branchId: userData.branchId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Hash password and create user with vehicle ID
      const hashedPassword = await bcrypt.hash(userData.password, 12);

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
        latitude: userData.latitude,
        longitude: userData.longitude,
      };

      return await userRepository.create(newUserData);
    }

    // Hash password for non-driver users
    const hashedPassword = await bcrypt.hash(userData.password, 12);

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
      latitude: userData.latitude,
      longitude: userData.longitude,
    };

    return await userRepository.create(newUserData);
  }

  async updateUser(
    id: string | number,
    userData: UpdateUserDto,
  ): Promise<User> {
    await this.getUserById(id);

    // If email is being updated, check if it's already in use by another user
    if (userData.email) {
      const existingUser = await userRepository.findByEmail(userData.email);
      if (existingUser && existingUser.id !== BigInt(id)) {
        throw new Error("Email is already in use by another user");
      }
    }

    // If username is being updated, check if it's already in use by another user
    if (userData.username) {
      const existingUser = await userRepository.findByUsername(
        userData.username,
      );
      if (existingUser && existingUser.id !== BigInt(id)) {
        throw new Error("Username is already in use by another user");
      }
    }

    // If customerCode is being updated, check if it's already in use by another user
    if (userData.customerCode) {
      const existingUser = await userRepository.findByCustomerCode(
        userData.customerCode,
      );
      if (existingUser && existingUser.id !== BigInt(id)) {
        throw new Error("Customer code is already in use by another user");
      }
    }

    // Remove password from update data if present (use separate method for password updates)
    const { password, ...updateData } = userData;

    return await userRepository.update(id, updateData);
  }

  async deleteUser(id: string | number): Promise<User> {
    await this.getUserById(id);
    return await userRepository.delete(id);
  }

  async changePassword(
    id: string | number,
    oldPassword: string,
    newPassword: string,
  ): Promise<User> {
    const user = await this.getUserById(id);

    // Verify old password
    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid current password");
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    return await userRepository.updatePassword(id, hashedNewPassword);
  }

  async activateUser(id: string | number): Promise<User> {
    await this.getUserById(id);
    return await userRepository.update(id, { active: true });
  }
}

export default new UserService();
