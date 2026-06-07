UPDATE "Continent"
SET "description" = 'Sem descricao informada.'
WHERE "description" IS NULL OR btrim("description") = '';

ALTER TABLE "Continent"
  ALTER COLUMN "description" SET NOT NULL;

ALTER TABLE "Country"
  ADD COLUMN "language" TEXT NOT NULL DEFAULT 'Nao informado',
  ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'Nao informado';

UPDATE "Country"
SET "population" = 0
WHERE "population" IS NULL;

ALTER TABLE "Country"
  ALTER COLUMN "population" SET NOT NULL,
  ALTER COLUMN "language" DROP DEFAULT,
  ALTER COLUMN "currency" DROP DEFAULT;

UPDATE "City"
SET "population" = 0
WHERE "population" IS NULL;

ALTER TABLE "City"
  ALTER COLUMN "population" SET NOT NULL;
