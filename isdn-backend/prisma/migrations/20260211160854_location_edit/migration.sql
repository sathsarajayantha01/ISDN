/*
  Warnings:

  - You are about to drop the column `location` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `location`,
    ADD COLUMN `latitude` DECIMAL(10, 8) NULL,
    ADD COLUMN `longitude` DECIMAL(11, 8) NULL;
