import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL || "";
const adapter = new PrismaMariaDb(connectionString);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting database seeding...");

  // Create default roles
  const roles = [
    {
      roleName: "System Administrator",
      permissions:
        "Full system access: manage all users, roles, permissions, system configurations, audit logs, backups, and perform any operation across all modules",
      active: true,
    },
    {
      roleName: "Retail Customer",
      permissions:
        "Browse products and promotions, place and view own orders, track own shipments in real-time, view own invoices and payment history, update own profile, receive order/delivery notifications",
      active: true,
    },
    {
      roleName: "Business Customer",
      permissions:
        "Browse products and promotions, place bulk/special orders, view and manage own orders, track shipments, view invoices and payment history, request credit terms (view only), update own profile, receive notifications",
      active: true,
    },
    {
      roleName: "RDC Staff",
      permissions:
        "View and process incoming orders (confirm/reject/update status), manage local inventory (adjust stock, record returns/damages), request/view inter-branch stock transfers, view regional sales and stock reports, update order-related notes",
      active: true,
    },
    {
      roleName: "Logistics Officer",
      permissions:
        "View scheduled deliveries and orders ready for dispatch, optimize and assign delivery routes, assign drivers/vehicles, monitor real-time GPS tracking, update delivery statuses (dispatched, in-transit, delivered, failed), view regional delivery performance reports",
      active: true,
    },
    {
      roleName: "Driver",
      permissions:
        "View assigned deliveries and routes for the day, update delivery status and add proof/notes (e.g., photos, signatures), view customer delivery details and map, update own profile and availability",
      active: true,
    },
    {
      roleName: "Head Office Manager",
      permissions:
        "View island-wide real-time dashboards (sales, inventory levels, stock turnover, delivery KPIs, route efficiency), generate and export detailed reports (sales by region/product, performance analytics), oversee inter-RDC stock balancing, approve high-value transactions/transfers, monitor overall system performance and staff KPIs",
      active: true,
    },
  ];

  console.log("Creating roles...");
  for (const roleData of roles) {
    const role = await prisma.role.upsert({
      where: { id: roles.indexOf(roleData) + 1 },
      update: {},
      create: roleData,
    });
    console.log(`Created role: ${role.roleName}`);
  }

  // Create default branches
  const branches = [
    {
      name: "North",
      code: "BRN",
      region: "Northern Region",
      address: "123 Northern Ave, Jaffna",
      contactNumber: "+94112345671",
      active: true,
    },
    {
      name: "South",
      code: "BRS",
      region: "Southern Region",
      address: "456 Southern Rd, Galle",
      contactNumber: "+94112345672",
      active: true,
    },
    {
      name: "East",
      code: "BRE",
      region: "Eastern Region",
      address: "789 Eastern St, Batticaloa",
      contactNumber: "+94112345673",
      active: true,
    },
    {
      name: "West",
      code: "BRW",
      region: "Western Region",
      address: "321 Western Blvd, Colombo",
      contactNumber: "+94112345674",
      active: true,
    },
    {
      name: "Central",
      code: "BRC",
      region: "Central Region",
      address: "654 Central Rd, Kandy",
      contactNumber: "+94112345675",
      active: true,
    },
  ];

  console.log("Creating branches...");
  for (const branchData of branches) {
    const branch = await prisma.branch.upsert({
      where: { id: branches.indexOf(branchData) + 1 },
      update: {},
      create: branchData,
    });
    console.log(`Created branch: ${branch.name}`);
  }

  // Get System Administrator role
  const superAdminRole = await prisma.role.findFirst({
    where: { roleName: "System Administrator" },
  });

  if (!superAdminRole) {
    throw new Error("System Administrator role not found!");
  }

  // Hash password for super admin
  const hashedPassword = await bcrypt.hash("superadmin", 10);

  // Create System Administrator user
  console.log("Creating System Administrator user...");
  const superAdminUser = await prisma.user.upsert({
    where: { email: "superadmin@gmail.com" },
    update: {},
    create: {
      username: "superadmin",
      email: "superadmin@gmail.com",
      password: hashedPassword,
      roleId: superAdminRole.id,
      name: "Super Administrator",
      contactNumber: "+94771234567",
      active: true,
    },
  });

  console.log(`Created System Administrator user: ${superAdminUser.username}`);
  console.log(`Email: ${superAdminUser.email}`);
  console.log(`Default Password: superadmin`);

  console.log("\nDatabase seeding completed successfully!");

  const productCategories = [
    {
      name: "Packaged Foods",
      description: "Various packaged food items",
    },
    {
      name: "Beverages",
      description: "Soft drinks, juices, and other beverages",
    },
    {
      name: "Personal Care & Hygiene",
      description: "Products for personal care and hygiene",
    },
    {
      name: "Home Cleaning & Household Care",
      description: "Cleaning supplies and household care products",
    },
  ];

  console.log("Creating product categories...");

  for (const categoryData of productCategories) {
    const category = await prisma.productCategory.upsert({
      where: { name: categoryData.name },
      update: {},
      create: categoryData,
    });
    console.log(`Created product category: ${category.name}`);
  }

  const promotionTypes = [
    {
      title: "Discount",
      discountPercent: 5,
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-12-31"),
      active: true,
    },
    {
      title: "Discount",
      discountPercent: 10,
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-12-31"),
      active: true,
    },
  ];

  console.log("Creating promotion types...");

  for (const promoData of promotionTypes) {
    const promotion = await prisma.promotion.upsert({
      where: { id: promotionTypes.indexOf(promoData) + 1 },
      update: {},
      create: promoData,
    });
    console.log(`Created promotion type: ${promotion.title}`);
  }
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
