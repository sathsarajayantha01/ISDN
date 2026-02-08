"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// user login
router.post("/login", auth_controller_1.default.login);
// user registration
router.post("/register", auth_controller_1.default.register);
// get current user
router.get("/log", auth_1.authenticate, auth_controller_1.default.getCurrentUser);
// logout
router.post("/logout", auth_1.authenticate, auth_controller_1.default.logout);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map