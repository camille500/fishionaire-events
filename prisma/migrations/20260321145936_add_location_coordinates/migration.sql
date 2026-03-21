-- AlterTable
ALTER TABLE "events" ADD COLUMN     "location_lat" DOUBLE PRECISION,
ADD COLUMN     "location_lon" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "sub_events" ADD COLUMN     "location_lat" DOUBLE PRECISION,
ADD COLUMN     "location_lon" DOUBLE PRECISION;
