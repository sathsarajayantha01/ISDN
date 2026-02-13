/*
  Warnings:

  - You are about to drop the column `active` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `reserved_branch_id` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `contact_number` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `current_location` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `customer_location` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `driver_id` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `category_id` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `stock_transfer` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `stock_transfer` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `product_category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_image` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `category` to the `product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `inventory` DROP FOREIGN KEY `inventory_product_id_fkey`;

-- DropForeignKey
ALTER TABLE `inventory` DROP FOREIGN KEY `inventory_reserved_branch_id_fkey`;

-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `orders_driver_id_fkey`;

-- DropForeignKey
ALTER TABLE `product` DROP FOREIGN KEY `product_category_id_fkey`;

-- DropForeignKey
ALTER TABLE `product_image` DROP FOREIGN KEY `product_image_product_id_fkey`;

-- DropIndex
DROP INDEX `inventory_product_id_branch_id_key` ON `inventory`;

-- DropIndex
DROP INDEX `inventory_reserved_branch_id_fkey` ON `inventory`;

-- DropIndex
DROP INDEX `orders_driver_id_fkey` ON `orders`;

-- DropIndex
DROP INDEX `product_category_id_fkey` ON `product`;

-- AlterTable
ALTER TABLE `inventory` DROP COLUMN `active`,
    DROP COLUMN `reserved_branch_id`;

-- AlterTable
ALTER TABLE `orders` DROP COLUMN `address`,
    DROP COLUMN `contact_number`,
    DROP COLUMN `current_location`,
    DROP COLUMN `customer_location`,
    DROP COLUMN `driver_id`;

-- AlterTable
ALTER TABLE `product` DROP COLUMN `category_id`,
    ADD COLUMN `category` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `stock_transfer` DROP COLUMN `created_at`,
    DROP COLUMN `updated_at`,
    ALTER COLUMN `status` DROP DEFAULT,
    ALTER COLUMN `transfer_date` DROP DEFAULT;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `latitude`,
    DROP COLUMN `longitude`;

-- DropTable
DROP TABLE `product_category`;

-- DropTable
DROP TABLE `product_image`;

-- AddForeignKey
ALTER TABLE `vehicle` ADD CONSTRAINT `vehicle_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
