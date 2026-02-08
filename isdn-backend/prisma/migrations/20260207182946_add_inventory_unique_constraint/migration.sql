/*
  Warnings:

  - A unique constraint covering the columns `[product_id,branch_id]` on the table `inventory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `inventory_product_id_branch_id_key` ON `inventory`(`product_id`, `branch_id`);
