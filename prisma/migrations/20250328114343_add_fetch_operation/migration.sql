-- CreateTable
CREATE TABLE `FetchOperation` (
    `id` VARCHAR(191) NOT NULL,
    `shopName` VARCHAR(191) NOT NULL,
    `isFetching` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
