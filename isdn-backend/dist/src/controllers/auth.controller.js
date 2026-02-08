"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_service_1 = __importDefault(require("../services/user.service"));
const serializer_1 = require("../utils/serializer");
const database_1 = __importDefault(require("../../config/database"));
class AuthController {
    async login(req, res, next) {
        try {
            const { email, username, password } = req.body;
            if ((!email && !username) || !password) {
                res.status(400).json({
                    success: false,
                    message: "Email/username and password are required",
                });
                return;
            }
            let user;
            if (email) {
                user = await user_service_1.default.getUserByEmail(email);
            }
            else {
                user = await user_service_1.default.getUserByUsername(username);
            }
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: "Invalid credentials",
                });
                return;
            }
            if (!user.active) {
                res.status(401).json({
                    success: false,
                    message: "Account is deactivated",
                });
                return;
            }
            const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                res.status(401).json({
                    success: false,
                    message: "Invalid credentials",
                });
                return;
            }
            const tokenPayload = {
                id: user.id.toString(),
                email: user.email,
                username: user.username,
                roleId: user.roleId.toString(),
            };
            const token = jsonwebtoken_1.default.sign(tokenPayload, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN || "24h",
            });
            // Remove password from response
            const { password: _, ...userWithoutPassword } = user;
            res.json({
                success: true,
                data: (0, serializer_1.serializeBigInt)({
                    token,
                    user: userWithoutPassword,
                }),
                message: "Login successful",
            });
        }
        catch (error) {
            if (error instanceof Error && error.message === "User not found") {
                res.status(401).json({
                    success: false,
                    message: "Invalid credentials",
                });
                return;
            }
            next(error);
        }
    }
    async register(req, res, next) {
        try {
            const userData = req.body;
            // Validate required fields
            const requiredFields = [
                "username",
                "email",
                "password",
                "name",
                "contactNumber",
                "roleId",
            ];
            const missingFields = requiredFields.filter((field) => !userData[field]);
            if (missingFields.length > 0) {
                res.status(400).json({
                    success: false,
                    message: `Missing required fields: ${missingFields.join(", ")}`,
                });
                return;
            }
            const newUser = await user_service_1.default.createUser(userData);
            const tokenPayload = {
                id: newUser.id.toString(),
                email: newUser.email,
                username: newUser.username,
                roleId: newUser.roleId.toString(),
            };
            const token = jsonwebtoken_1.default.sign(tokenPayload, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN || "24h",
            });
            // Remove password from response
            const { password: _, ...userWithoutPassword } = newUser;
            res.status(201).json({
                success: true,
                data: (0, serializer_1.serializeBigInt)({
                    token,
                    user: userWithoutPassword,
                }),
                message: "Registration successful",
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getCurrentUser(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
                return;
            }
            const user = await user_service_1.default.getUserById(userId);
            // Remove password from response
            // const { password: _, ...userWithoutPassword } = user;
            res.json({
                success: true,
                data: (0, serializer_1.serializeBigInt)(user),
                message: "Current user retrieved successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
    async logout(req, res, next) {
        try {
            // Extract token from Authorization header
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                res.status(401).json({
                    success: false,
                    message: "No token provided",
                });
                return;
            }
            const token = authHeader.substring(7); // Remove "Bearer " prefix
            // Decode token to get expiration time
            const decoded = jsonwebtoken_1.default.decode(token);
            if (!decoded || !decoded.exp) {
                res.status(400).json({
                    success: false,
                    message: "Invalid token",
                });
                return;
            }
            // Add token to blacklist with its expiration time
            await database_1.default.blacklistedToken.create({
                data: {
                    token,
                    expiresAt: new Date(decoded.exp * 1000), // Convert to milliseconds
                },
            });
            res.json({
                success: true,
                message: "Logout successful",
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new AuthController();
//# sourceMappingURL=auth.controller.js.map