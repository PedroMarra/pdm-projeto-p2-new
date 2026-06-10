/*
  Warnings:

  - You are about to drop the column `is_default` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `transaction` table. All the data in the column will be lost.
  - Added the required column `displayName` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `category` DROP COLUMN `is_default`,
    DROP COLUMN `type`,
    ADD COLUMN `background` VARCHAR(191) NULL,
    ADD COLUMN `displayName` VARCHAR(191) NOT NULL,
    ADD COLUMN `icon` VARCHAR(191) NULL,
    ADD COLUMN `isIncome` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `transaction` DROP COLUMN `amount`,
    ADD COLUMN `value` DOUBLE NOT NULL,
    ALTER COLUMN `date` DROP DEFAULT;
