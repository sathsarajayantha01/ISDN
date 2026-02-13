/*
  Warnings:

  - You are about to drop the `stock_transfer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `stock_transfer` DROP FOREIGN KEY `stock_transfer_from_branch_id_fkey`;

-- DropForeignKey
ALTER TABLE `stock_transfer` DROP FOREIGN KEY `stock_transfer_product_id_fkey`;

-- DropForeignKey
ALTER TABLE `stock_transfer` DROP FOREIGN KEY `stock_transfer_to_branch_id_fkey`;

-- AlterTable
ALTER TABLE `orders` ADD COLUMN `customer_location` JSON NULL;

-- DropTable
DROP TABLE `stock_transfer`;
