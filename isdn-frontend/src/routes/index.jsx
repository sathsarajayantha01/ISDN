import { Dashboard } from "../pages/Dashboard";
import { ActiveOrders } from "../pages/ActiveOrders/ActiveOrders";
import { Users } from "../pages/Users/Users";
import { Drivers } from "../pages/Drivers/Drivers";
import { Customers } from "../pages/Customers/Customers";
import { ProductCategory } from "../pages/ProductCategory/ProductCategory";
import { Product } from "../pages/Product/Product";
import { Inventory } from "../pages/Inventory/Inventory";
import { CustomerProduct } from "../pages/CustomerProduct/CustomerProduct";
import { OrdersHistory } from "../pages/OrdersHistory/OrdersHistory";
import { Account } from "../pages/Account/Account";
import { Deliveries } from "../pages/Deliveries/Deliveries";
import { DeliveredOrders } from "../pages/DeliveredOrders/DeliveredOrders";

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
    path: "active-orders",
    element: ActiveOrders,
    label: "Active Orders",
  },
  {
    path: "delivered-orders",
    element: DeliveredOrders,
    label: "Delivered Orders",
  },
  {
    path: "orders-history",
    element: OrdersHistory,
    label: "Orders History",
  },
  {
    path: "deliveries",
    element: Deliveries,
    label: "Deliveries",
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
