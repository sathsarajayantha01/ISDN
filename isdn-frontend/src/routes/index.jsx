import React from "react";
import { Dashboard } from "../pages/Dashboard";
import { Orders } from "../pages/Orders";
import { Users } from "../pages/Users/Users";
import { Drivers } from "../pages/Drivers/Drivers";
import { Customers } from "../pages/Customers/Customers";
import { ProductCategory } from "../pages/ProductCategory/ProductCategory";
import { Product } from "../pages/Product/Product";
import { Inventory } from "../pages/Inventory/Inventory";
import { CustomerProduct } from "../pages/CustomerProduct/CustomerProduct";

export const routes = [
  {
    path: "dashboard",
    element: Dashboard,
    label: "Dashboard",
  },
  {
    path: "product-categories",
    element: ProductCategory,
    label: "Product Categories",
  },
  {
    path: "customer-products",
    element: CustomerProduct,
    label: "Customer Products",
  },
  {
    path: "products",
    element: Product,
    label: "Products",
  },
  {
    path: "inventory",
    element: Inventory,
    label: "Inventory",
  },
  {
    path: "orders",
    element: Orders,
    label: "Orders",
  },
  {
    path: "adminUsers",
    element: Users,
    label: "Admin Users",
  },
  {
    path: "drivers",
    element: Drivers,
    label: "Drivers",
  },
  {
    path: "customers",
    element: Customers,
    label: "Customers",
  },
];

export const getRouteComponent = (path) => {
  const route = routes.find((r) => r.path === path);
  return route ? route.element : null;
};
