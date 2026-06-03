import { seedService } from "../src/services/SeedService";
import { prisma } from "../src/prisma/client";

async function main() {
  await seedService.seedCountries();
  console.log("Seed concluido com continentes, paises e cidades iniciais.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
