"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const promotions_controller_1 = __importDefault(require("../controllers/promotions.controller"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all promotions - authenticated access
router.get("/", auth_1.authenticate, promotions_controller_1.default.getAllPromotions);
// Get promotion by ID - authenticated access
router.get("/:id", auth_1.authenticate, promotions_controller_1.default.getPromotionById);
// Create promotion - admin only
router.post("/", auth_1.authenticate, (0, auth_1.authorize)(["admin", "manager"]), promotions_controller_1.default.createPromotion);
// Update promotion - admin only
router.put("/:id", auth_1.authenticate, (0, auth_1.authorize)(["admin", "manager"]), promotions_controller_1.default.updatePromotion);
// Delete promotion - admin only
router.delete("/:id", auth_1.authenticate, (0, auth_1.authorize)(["admin"]), promotions_controller_1.default.deletePromotion);
exports.default = router;
//# sourceMappingURL=promotions.routes.js.map