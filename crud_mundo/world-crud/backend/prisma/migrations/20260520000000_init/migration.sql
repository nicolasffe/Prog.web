CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Continent" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Continent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Country" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "officialName" TEXT,
  "code" TEXT NOT NULL,
  "capital" TEXT,
  "region" TEXT,
  "subregion" TEXT,
  "population" INTEGER,
  "area" DOUBLE PRECISION,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "flagUrl" TEXT,
  "continentId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "City" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "state" TEXT,
  "countryId" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "population" INTEGER,
  "timezone" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WeatherCache" (
  "id" TEXT NOT NULL,
  "cityId" TEXT NOT NULL,
  "temperature" DOUBLE PRECISION NOT NULL,
  "feelsLike" DOUBLE PRECISION,
  "humidity" INTEGER,
  "windSpeed" DOUBLE PRECISION,
  "description" TEXT,
  "icon" TEXT,
  "provider" TEXT NOT NULL,
  "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WeatherCache_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Continent_code_key" ON "Continent"("code");
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");
CREATE UNIQUE INDEX "WeatherCache_cityId_key" ON "WeatherCache"("cityId");

ALTER TABLE "Country"
  ADD CONSTRAINT "Country_continentId_fkey"
  FOREIGN KEY ("continentId") REFERENCES "Continent"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "City"
  ADD CONSTRAINT "City_countryId_fkey"
  FOREIGN KEY ("countryId") REFERENCES "Country"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WeatherCache"
  ADD CONSTRAINT "WeatherCache_cityId_fkey"
  FOREIGN KEY ("cityId") REFERENCES "City"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
