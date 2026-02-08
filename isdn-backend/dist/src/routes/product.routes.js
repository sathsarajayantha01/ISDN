"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_controller_1 = __importDefault(require("../controllers/product.controller"));
const auth_1 = require("../middleware/auth");
const multer_1 = require("../utils/multer");
const router = express_1.default.Router();
// Get all products - public access
router.get("/", auth_1.authenticate, product_controller_1.default.getAllProducts);
// Get products by category - public access (must come before /:id)
router.get("/category/:categoryId", auth_1.authenticate, product_controller_1.default.getProductsByCategory);
// Get product by ID - public access
router.get("/:id", auth_1.authenticate, product_controller_1.default.getProductById);
// Create new product with optional image upload
router.post("/", auth_1.authenticate, (0, auth_1.authorize)(["Super Admin", "Admin"]), multer_1.upload.single("image"), product_controller_1.default.createProduct);
// Update product with optional image upload
router.put("/:id", auth_1.authenticate, (0, auth_1.authorize)(["Super Admin", "Admin"]), multer_1.upload.single("image"), product_controller_1.default.updateProduct);
// Delete product
router.delete("/:id", (0, auth_1.authorize)(["Super Admin"]), product_controller_1.default.deleteProduct);
// Activate product
router.patch("/:id/activate", (0, auth_1.authorize)(["Super Admin", "Admin"]), product_controller_1.default.activateProduct);
// Deactivate product
router.patch("/:id/deactivate", (0, auth_1.authorize)(["Super Admin", "Admin"]), product_controller_1.default.deactivateProduct);
exports.default = router;
//# sourceMappingURL=product.routes.js.map