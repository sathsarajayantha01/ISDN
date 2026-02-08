-- AddForeignKey
ALTER TABLE `inventory` ADD CONSTRAINT `inventory_reserved_branch_id_fkey` FOREIGN KEY (`reserved_branch_id`) REFERENCES `branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
