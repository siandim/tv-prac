-- CreateTable
CREATE TABLE `Form` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `source` TEXT NOT NULL,
    `panel` INTEGER NOT NULL,
    `tvId` INTEGER NOT NULL,
    `insideIndex` INTEGER NOT NULL DEFAULT 1,

    INDEX `Form_tvId_panel_insideIndex_idx`(`tvId`, `panel`, `insideIndex`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TV` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Form` ADD CONSTRAINT `Form_tvId_fkey` FOREIGN KEY (`tvId`) REFERENCES `TV`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
