-- AlterTable
ALTER TABLE "Plate" ADD COLUMN     "seq" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Plate_seq_key" ON "Plate"("seq");

