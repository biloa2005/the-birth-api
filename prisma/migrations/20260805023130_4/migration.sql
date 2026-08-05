/*
  Warnings:

  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `user`;

-- CreateTable
CREATE TABLE `births` (
    `id` VARCHAR(191) NOT NULL,
    `actNumber` VARCHAR(191) NOT NULL,
    `childFirstname` VARCHAR(191) NOT NULL,
    `childLastname` VARCHAR(191) NOT NULL,
    `birthDate` DATETIME(3) NOT NULL,
    `birthPlace` VARCHAR(191) NOT NULL,
    `sex` ENUM('MALE', 'FEMALE') NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED') NOT NULL DEFAULT 'PENDING',
    `centerId` VARCHAR(191) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `births_actNumber_key`(`actNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `birth_parents` (
    `id` VARCHAR(191) NOT NULL,
    `birthId` VARCHAR(191) NOT NULL,
    `fatherName` VARCHAR(191) NOT NULL,
    `motherName` VARCHAR(191) NOT NULL,
    `fatherJob` VARCHAR(191) NULL,
    `motherJob` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `birth_attachments` (
    `id` VARCHAR(191) NOT NULL,
    `birthId` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `birth_histories` (
    `id` VARCHAR(191) NOT NULL,
    `birthId` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `birth_parents` ADD CONSTRAINT `birth_parents_birthId_fkey` FOREIGN KEY (`birthId`) REFERENCES `births`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `birth_attachments` ADD CONSTRAINT `birth_attachments_birthId_fkey` FOREIGN KEY (`birthId`) REFERENCES `births`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `birth_histories` ADD CONSTRAINT `birth_histories_birthId_fkey` FOREIGN KEY (`birthId`) REFERENCES `births`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
