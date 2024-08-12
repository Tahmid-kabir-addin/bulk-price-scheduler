-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `shop` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `isOnline` BOOLEAN NOT NULL DEFAULT false,
    `scope` VARCHAR(191) NULL,
    `expires` DATETIME(3) NULL,
    `accessToken` VARCHAR(191) NOT NULL,
    `userId` BIGINT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CompareAtPrice` (
    `id` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `relativeToActualPrice` BOOLEAN NOT NULL DEFAULT false,
    `percent` DOUBLE NOT NULL DEFAULT 0,
    `amount` DOUBLE NOT NULL DEFAULT 0,
    `type` VARCHAR(191) NOT NULL DEFAULT 'by_percent',
    `overrideCents` BOOLEAN NOT NULL DEFAULT false,
    `toNearestValue` BOOLEAN NOT NULL DEFAULT false,
    `cents` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PriceFields` (
    `id` VARCHAR(191) NOT NULL,
    `percent` DOUBLE NOT NULL DEFAULT 0,
    `amount` DOUBLE NOT NULL DEFAULT 0,
    `type` VARCHAR(191) NOT NULL DEFAULT 'by_percent',
    `action` VARCHAR(191) NOT NULL,
    `overrideCents` BOOLEAN NOT NULL DEFAULT false,
    `toNearestValue` BOOLEAN NOT NULL DEFAULT false,
    `cents` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CostPerItemFields` (
    `id` VARCHAR(191) NOT NULL,
    `percent` DOUBLE NOT NULL DEFAULT 0,
    `amount` DOUBLE NOT NULL DEFAULT 0,
    `type` VARCHAR(191) NOT NULL DEFAULT 'by_percent',
    `action` VARCHAR(191) NOT NULL,
    `overrideCents` BOOLEAN NOT NULL DEFAULT false,
    `toNearestValue` BOOLEAN NOT NULL DEFAULT false,
    `cents` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Task` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(191) NOT NULL DEFAULT 'Completed',
    `compareAtPriceId` VARCHAR(191) NOT NULL,
    `priceFieldsId` VARCHAR(191) NOT NULL,
    `costPerItemFieldsId` VARCHAR(191) NULL,
    `applyTo` VARCHAR(191) NOT NULL DEFAULT 'whole_store',
    `exclude` VARCHAR(191) NOT NULL DEFAULT 'nothing',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sale` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `startedAt` DATETIME(3) NULL,
    `endedAt` DATETIME(3) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Active',
    `compareAtPriceId` VARCHAR(191) NOT NULL,
    `priceFieldsId` VARCHAR(191) NOT NULL,
    `applyTo` VARCHAR(191) NOT NULL DEFAULT 'whole_store',
    `exclude` VARCHAR(191) NOT NULL DEFAULT 'nothing',
    `tags` VARCHAR(191) NOT NULL,
    `scheduleId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Sale_scheduleId_key`(`scheduleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Schedule` (
    `id` VARCHAR(191) NOT NULL,
    `startDate` VARCHAR(191) NOT NULL,
    `startTime` VARCHAR(191) NOT NULL,
    `setEndDate` BOOLEAN NOT NULL,
    `endDate` VARCHAR(191) NULL,
    `endTime` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `title` VARCHAR(191) NOT NULL,
    `taskId` VARCHAR(191) NULL,
    `salesId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `variant` (
    `id` VARCHAR(191) NOT NULL,
    `variantId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `inventoryItemId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `previousPrice` DOUBLE NOT NULL DEFAULT 0,
    `previousCompareAtPrice` DOUBLE NOT NULL DEFAULT 0,
    `previousCostPrice` DOUBLE NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `timer` (
    `id` VARCHAR(191) NOT NULL,
    `startId` VARCHAR(191) NOT NULL,
    `endId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Active',

    UNIQUE INDEX `timer_startId_key`(`startId`),
    UNIQUE INDEX `timer_endId_key`(`endId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_compareAtPriceId_fkey` FOREIGN KEY (`compareAtPriceId`) REFERENCES `CompareAtPrice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_priceFieldsId_fkey` FOREIGN KEY (`priceFieldsId`) REFERENCES `PriceFields`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_costPerItemFieldsId_fkey` FOREIGN KEY (`costPerItemFieldsId`) REFERENCES `CostPerItemFields`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sale` ADD CONSTRAINT `Sale_compareAtPriceId_fkey` FOREIGN KEY (`compareAtPriceId`) REFERENCES `CompareAtPrice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sale` ADD CONSTRAINT `Sale_priceFieldsId_fkey` FOREIGN KEY (`priceFieldsId`) REFERENCES `PriceFields`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sale` ADD CONSTRAINT `Sale_scheduleId_fkey` FOREIGN KEY (`scheduleId`) REFERENCES `Schedule`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `Task`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_salesId_fkey` FOREIGN KEY (`salesId`) REFERENCES `Sale`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `variant` ADD CONSTRAINT `variant_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
