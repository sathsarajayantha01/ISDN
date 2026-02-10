import prisma from "../../config/database";
import { User, CreateUserDto, UpdateUserDto } from "../types";

class UserRepository {
  async findAll(): Promise<User[]> {
    return await prisma.user.findMany({
      include: {
        role: true,
        branch: true,
        assignedBranch: true,
        vehicle: true,
      },
    });
  }

  async findById(id: string | number): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id: BigInt(id) },
      include: {
        role: true,
        branch: true,
        assignedBranch: true,
        vehicle: true,
      },
    });
  }

  async findByBranchId(branchId: string): Promise<User[]> {
    return await prisma.user.findMany({
      where: { branchId: BigInt(branchId) },
      include: {
        role: true,
        branch: true,
        assignedBranch: true,
        vehicle: true,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        branch: true,
        assignedBranch: true,
        vehicle: true,
      },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { username },
      include: {
        role: true,
        branch: true,
      },
    });
  }

  async create(
    userData: CreateUserDto & { vehicleId?: bigint },
  ): Promise<User> {
    return await prisma.user.create({
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

  async update(id: string | number, userData: UpdateUserDto): Promise<User> {
    return await prisma.user.update({
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

  async delete(id: string | number): Promise<User> {
    return await prisma.user.delete({
      where: { id: BigInt(id) },
    });
  }

  async updatePassword(
    id: string | number,
    hashedPassword: string,
  ): Promise<User> {
    return await prisma.user.update({
      where: { id: BigInt(id) },
      data: { password: hashedPassword },
    });
  }

  async getRoleNameById(roleId: bigint): Promise<string | null> {
    const role = await prisma.role.findUnique({
      where: { id: BigInt(roleId) },
      select: { roleName: true },
    });
    return role?.roleName || null;
  }

  async findByRoleName(roleName: string): Promise<User[]> {
    return await prisma.user.findMany({
      where: {
        role: {
          roleName,
        },
      },
      include: {
        role: true,
        branch: true,
        assignedBranch: true,
        vehicle: true,
      },
    });
  }
}

export default new UserRepository();
