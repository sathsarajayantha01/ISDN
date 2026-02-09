-- AlterTable
ALTER TABLE `orders` ADD COLUMN `current_location` JSON NULL,
    ADD COLUMN `driver_id` BIGINT NULL;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_driver_id_fkey` FOREIGN KEY (`driver_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
