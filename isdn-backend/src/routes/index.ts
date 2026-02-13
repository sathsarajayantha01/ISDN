import express, { Application } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import roleRoutes from "./role.routes";
import branchRoutes from "./branch.routes";
import productCategoryRoutes from "./productCategory.routes";
import productRoutes from "./product.routes";
import promotionRoutes from "./promotions.routes";
import orderRoutes from "./order.routes";
import dashboardRoutes from "./dashboard.routes";

const api: Application = express();

api.use("/auth", authRoutes);
api.use("/users", userRoutes);
api.use("/roles", roleRoutes);
api.use("/branches", branchRoutes);
api.use("/product-categories", productCategoryRoutes);
api.use("/products", productRoutes);
api.use("/promotions", promotionRoutes);
api.use("/orders", orderRoutes);
api.use("/dashboard", dashboardRoutes);

export default api;
