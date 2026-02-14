import { Request, Response, NextFunction } from "express";
import userService from "../services/user.service";
import { CreateUserDto, UpdateUserDto } from "../types";
import { serializeBigInt } from "../utils/serializer";

class UserController {
  async getAllUsers(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const rawBranchId = req.headers.branchid as string | undefined;
      const branchId = rawBranchId && rawBranchId !== "null" && rawBranchId !== "undefined" ? rawBranchId : undefined;      const roleId = req.query.roleId as string | undefined;
      const users = await userService.getAllUsers(branchId, roleId);
      // Remove password from response
      const sanitizedUsers = users.map((user) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json({
        success: true,
        data: serializeBigInt(sanitizedUsers),
        message: "Users retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const users = await userService.getUserById(id as string);
      // Remove password from response
      const user = users[0];
      const { password, ...userWithoutPassword } = user;
      res.json({
        success: true,
        data: serializeBigInt(userWithoutPassword),
        message: "User retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getUsersByRoleName(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { roleName } = req.query;
      const branchId = req.headers.branchid as string | undefined;

      if (!roleName) {
        res.status(400).json({
          success: false,
          message: "Role name is required",
        });
        return;
      }

      const users = await userService.getUsersByRoleName(
        roleName as string,
        branchId,
      );

      // Remove password from response
      const sanitizedUsers = users.map((user) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      if (sanitizedUsers.length === 0) {
        res.status(404).json({
          success: false,
          message: `No users found with role: ${roleName}`,
          data: [],
        });
        return;
      }

      res.json({
        success: true,
        data: serializeBigInt(sanitizedUsers),
        message: "Users retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async createUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userData: CreateUserDto = req.body;
      const newUser = await userService.createUser(userData);
      // Remove password from response
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json({
        success: true,
        data: serializeBigInt(userWithoutPassword),
        message: "User created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const userData: UpdateUserDto = req.body;
      const updatedUser = await userService.updateUser(id as string, userData);
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json({
        success: true,
        data: serializeBigInt(userWithoutPassword),
        message: "User updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      await userService.deleteUser(id as string);
      res.json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { oldPassword, newPassword } = req.body;
      await userService.changePassword(id as string, oldPassword, newPassword);
      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async activateUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const updatedUser = await userService.activateUser(id as string);
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json({
        success: true,
        data: serializeBigInt(userWithoutPassword),
        message: "User activated successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
