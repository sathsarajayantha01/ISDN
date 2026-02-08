"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_routes_1 = __importDefault(require("./auth.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const role_routes_1 = __importDefault(require("./role.routes"));
const branch_routes_1 = __importDefault(require("./branch.routes"));
const productCategory_routes_1 = __importDefault(require("./productCategory.routes"));
const product_routes_1 = __importDefault(require("./product.routes"));
const promotions_routes_1 = __importDefault(require("./promotions.routes"));
const api = (0, express_1.default)();
api.use("/auth", auth_routes_1.default);
api.use("/users", user_routes_1.default);
api.use("/roles", role_routes_1.default);
api.use("/branches", branch_routes_1.default);
api.use("/product-categories", productCategory_routes_1.default);
api.use("/products", product_routes_1.default);
api.use("/promotions", promotions_routes_1.default);
exports.default = api;
//# sourceMappingURL=index.js.map