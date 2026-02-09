import { useState, useEffect } from "react";

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Car,
  Users,
  FileText,
  ChevronDown,
  LogOut,
  X,
} from "lucide-react";

export function Sidebar({
  activePage,
  onNavigate,
  currentBranch,
  branches,
  onSwitchBranch,
  onLogout,
  isOpen = false,
  onClose,
}) {
  const [loggedUser, setLoggedUser] = useState(null);

  useEffect(() => {
    // Get user details from localStorage

    const userStr = localStorage.getItem("user");
    const storedUser = userStr ? JSON.parse(userStr) : null;

    if (storedUser) {
      setLoggedUser({
        id: storedUser.id,
        name: storedUser.name,
        email: storedUser.email,
        role: storedUser.role?.roleName, // Map from roleId or use storedUser.role.roleName
        branchname: storedUser.branch?.name,
        avatar: null, // Fallback to passed user avatar,
      });
    }
  }, []);

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: [
        "System Administrator",
        "RDC Staff",
        "Logistics Officer",
        "Driver",
        "Head Office Manager",
      ],
    },
    {
      id: "product-categories",
      label: "Product Categories",
      icon: Package,
      roles: ["System Administrator", "RDC Staff", "Head Office Manager"],
    },
    {
      id: "customer-products",
      label: "Customer Products",
      icon: Package,
      roles: ["Business Customer", "Retail Customer"],
    },
    {
      id: "products",
      label: "Products",
      icon: Package,
      roles: ["System Administrator", "RDC Staff", "Head Office Manager"],
    },
    {
      id: "inventory",
      label: "Inventory",
      icon: Package,
      roles: [
        "System Administrator",
        "RDC Staff",
        "Logistics Officer",
        "Head Office Manager",
      ],
    },
    {
      id: "orders",
      label: "Orders",
      icon: ShoppingCart,
      roles: [
        "System Administrator",
        "RDC Staff",
        "Logistics Officer",
        "Head Office Manager",
      ],
    },
    {
      id: "orders-history",
      label: "Orders History",
      icon: FileText,
      roles: ["Retail Customer", "Business Customer"],
    },
    {
      id: "deliveries",
      label: "Deliveries",
      icon: Truck,
      roles: [
        "System Administrator",
        "Logistics Officer",
        "Driver",
        "Head Office Manager",
      ],
    },
    {
      id: "adminUsers",
      label: "Admin Users",
      icon: Users,
      roles: ["System Administrator"],
    },
    {
      id: "drivers",
      label: "Drivers",
      icon: Users,
      roles: [
        "System Administrator",
        "Logistics Officer",
        "Head Office Manager",
      ],
    },
    {
      id: "customers",
      label: "Customers",
      icon: Users,
      roles: ["System Administrator", "RDC Staff", "Head Office Manager"],
    },
    {
      id: "account",
      label: "My Account",
      icon: Users,
      roles: [
        "System Administrator",
        "RDC Staff",
        "Head Office Manager",
        "Logistics Officer",
        "Driver",
        "Retail Customer",
        "Business Customer",
      ],
    },
  ];

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter((item) => {
    if (!loggedUser?.role) return false;
    return item.roles.includes(loggedUser.role);
  });

  return (
    <aside
      className={`
      fixed left-0 top-0 z-50 h-screen w-[280px] sm:w-[260px]  text-slate-900 
      flex flex-col border-r border-slate-200
      transform transition-transform duration-300 ease-in-out
      lg:translate-x-0
      ${isOpen ? "translate-x-0" : "-translate-x-full"}
    `}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-slate-200  bg-slate-100">
        <div className="flex items-center text-white  rounded-lg p-8 w-full">
          <img src="/isdnlogo.png" alt="ISDN Logo" className="h-12 w-50" />
        </div>
      </div>

      {/* Branch Switcher */}
      <div className="p-3 sm:p-4 border-b border-slate-200 bg-slate-100">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block px-2">
          Current Branch
        </label>

        {/* if logged user rolename = System Administrator show branch list else showing current branch */}
        {loggedUser?.role === "System Administrator" ? (
          <div className="relative">
            <select
              value={currentBranch.id}
              onChange={(e) => onSwitchBranch(e.target.value)}
              className="w-full appearance-none  border border-slate-200 text-slate-900 text-sm rounded-lg pl-3 pr-10 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
            >
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        ) : (
          <div className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-lg px-3 py-2.5 font-medium shadow-sm">
            <div className="flex items-center gap-2">
              <span className="truncate">
                {loggedUser?.branchname || "User Branch"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 sm:py-6 px-2 sm:px-3 space-y-1 bg-white">
        {filteredNavItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-3 sm:py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive ? "bg-blue-950 text-white border " : "text-gray-600  hover:bg-blue-100 "}
              `}
            >
              <item.icon
                className={`h-5 w-5 flex-shrink-0   ${isActive ? "text-white " : " text-gray-600 "}`}
              />

              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User / Footer */}
      <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-100">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-3 sm:py-2.5 border bg-white  rounded-lg hover:bg-red-800 text-red-400 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
