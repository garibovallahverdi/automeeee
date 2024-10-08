/*
  Warnings:

  - The values [accepted,rejected] on the enum `AgreementStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AgreementStatus_new" AS ENUM ('pending', 'sold', 'canceled');
ALTER TABLE "Agreement" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Agreement" ALTER COLUMN "status" TYPE "AgreementStatus_new" USING ("status"::text::"AgreementStatus_new");
ALTER TYPE "AgreementStatus" RENAME TO "AgreementStatus_old";
ALTER TYPE "AgreementStatus_new" RENAME TO "AgreementStatus";
DROP TYPE "AgreementStatus_old";
ALTER TABLE "Agreement" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;
