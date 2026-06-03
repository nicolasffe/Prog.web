import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/client";

export class WeatherRepository {
  findByCityId(cityId: string) {
    return prisma.weatherCache.findUnique({ where: { cityId } });
  }

  upsert(cityId: string, data: Omit<Prisma.WeatherCacheUncheckedCreateInput, "cityId">) {
    return prisma.weatherCache.upsert({
      where: { cityId },
      update: data,
      create: { cityId, ...data }
    });
  }
}

export const weatherRepository = new WeatherRepository();
