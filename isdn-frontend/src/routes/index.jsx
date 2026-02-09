import React from "react";
import { Dashboard } from "../pages/Dashboard";
import { OrdersManage } from "../pages/OrdersManage/OrdersManage";
import { Users } from "../pages/Users/Users";
import { Drivers } from "../pages/Drivers/Drivers";
import { Customers } from "../pages/Customers/Customers";
import { ProductCategory } from "../pages/ProductCategory/ProductCategory";
import { Product } from "../pages/Product/Product";
import { Inventory } from "../pages/Inventory/Inventory";
import { CustomerProduct } from "../pages/CustomerProduct/CustomerProduct";
import { OrdersHistory } from "../pages/OrdersHistory/OrdersHistory";
import { Account } from "../pages/Account/Account";

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
    element: OrdersManage,
    label: "Orders",
  },
  {
    path: "orders-history",
    element: OrdersHistory,
    label: "Orders History",
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
  {
    path: "account",
    element: Account,
    label: "My Account",
  },
];

export const getRouteComponent = (path) => {
  const route = routes.find((r) => r.path === path);
  return route ? route.element : null;
};
