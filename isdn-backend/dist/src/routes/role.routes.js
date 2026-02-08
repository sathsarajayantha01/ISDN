"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const role_controller_1 = __importDefault(require("../controllers/role.controller"));
const router = express_1.default.Router();
// Get all roles
router.get("/", role_controller_1.default.getAllRoles);
exports.default = router;
//# sourceMappingURL=role.routes.js.map