import { prisma } from "../prisma/client";

const continents = [
  {
    name: "America do Sul",
    code: "SA",
    description: "Continente ao sul das Americas, com grande diversidade natural."
  },
  {
    name: "America do Norte",
    code: "NA",
    description: "Regiao continental com Canada, Estados Unidos, Mexico e territorios."
  },
  {
    name: "Europa",
    code: "EU",
    description: "Continente historico com alta densidade urbana e cultural."
  },
  {
    name: "Asia",
    code: "AS",
    description: "Maior continente do planeta em area e populacao."
  },
  {
    name: "Africa",
    code: "AF",
    description: "Continente de enorme diversidade geografica, cultural e climatica."
  },
  {
    name: "Oceania",
    code: "OC",
    description: "Regiao formada por Australia, Nova Zelandia e ilhas do Pacifico."
  },
  {
    name: "Antartida",
    code: "AN",
    description: "Continente polar dedicado majoritariamente a pesquisa cientifica."
  }
];

const countries = [
  {
    name: "Brasil",
    officialName: "Republica Federativa do Brasil",
    code: "BR",
    capital: "Brasilia",
    region: "Americas",
    subregion: "South America",
    population: 203080756,
    language: "Portugues",
    currency: "BRL",
    area: 8515767,
    latitude: -10,
    longitude: -55,
    flagUrl: "https://flagcdn.com/br.svg",
    continentCode: "SA",
    cities: [
      {
        name: "Sao Paulo",
        state: "Sao Paulo",
        latitude: -23.5505,
        longitude: -46.6333,
        population: 11451245,
        timezone: "America/Sao_Paulo"
      },
      {
        name: "Rio de Janeiro",
        state: "Rio de Janeiro",
        latitude: -22.9068,
        longitude: -43.1729,
        population: 6211223,
        timezone: "America/Sao_Paulo"
      },
      {
        name: "Brasilia",
        state: "Distrito Federal",
        latitude: -15.7939,
        longitude: -47.8828,
        population: 2817381,
        timezone: "America/Sao_Paulo"
      }
    ]
  },
  {
    name: "Estados Unidos",
    officialName: "United States of America",
    code: "US",
    capital: "Washington",
    region: "Americas",
    subregion: "North America",
    population: 334914895,
    language: "Ingles",
    currency: "USD",
    area: 9833517,
    latitude: 38,
    longitude: -97,
    flagUrl: "https://flagcdn.com/us.svg",
    continentCode: "NA",
    cities: [
      {
        name: "New York",
        state: "New York",
        latitude: 40.7128,
        longitude: -74.006,
        population: 8804190,
        timezone: "America/New_York"
      },
      {
        name: "Los Angeles",
        state: "California",
        latitude: 34.0522,
        longitude: -118.2437,
        population: 3898747,
        timezone: "America/Los_Angeles"
      },
      {
        name: "Washington",
        state: "District of Columbia",
        latitude: 38.9072,
        longitude: -77.0369,
        population: 689545,
        timezone: "America/New_York"
      }
    ]
  },
  {
    name: "Franca",
    officialName: "Republique francaise",
    code: "FR",
    capital: "Paris",
    region: "Europe",
    subregion: "Western Europe",
    population: 68042591,
    language: "Frances",
    currency: "EUR",
    area: 551695,
    latitude: 46.2276,
    longitude: 2.2137,
    flagUrl: "https://flagcdn.com/fr.svg",
    continentCode: "EU",
    cities: [
      {
        name: "Paris",
        state: "Ile-de-France",
        latitude: 48.8566,
        longitude: 2.3522,
        population: 2102650,
        timezone: "Europe/Paris"
      },
      {
        name: "Lyon",
        state: "Auvergne-Rhone-Alpes",
        latitude: 45.764,
        longitude: 4.8357,
        population: 522969,
        timezone: "Europe/Paris"
      }
    ]
  },
  {
    name: "Japao",
    officialName: "Japan",
    code: "JP",
    capital: "Tokyo",
    region: "Asia",
    subregion: "Eastern Asia",
    population: 124516650,
    language: "Japones",
    currency: "JPY",
    area: 377975,
    latitude: 36.2048,
    longitude: 138.2529,
    flagUrl: "https://flagcdn.com/jp.svg",
    continentCode: "AS",
    cities: [
      {
        name: "Tokyo",
        state: "Tokyo",
        latitude: 35.6762,
        longitude: 139.6503,
        population: 13960000,
        timezone: "Asia/Tokyo"
      },
      {
        name: "Osaka",
        state: "Osaka",
        latitude: 34.6937,
        longitude: 135.5023,
        population: 2752000,
        timezone: "Asia/Tokyo"
      }
    ]
  },
  {
    name: "Argentina",
    officialName: "Republica Argentina",
    code: "AR",
    capital: "Buenos Aires",
    region: "Americas",
    subregion: "South America",
    population: 46044703,
    language: "Espanhol",
    currency: "ARS",
    area: 2780400,
    latitude: -38.4161,
    longitude: -63.6167,
    flagUrl: "https://flagcdn.com/ar.svg",
    continentCode: "SA",
    cities: [
      {
        name: "Buenos Aires",
        state: "Buenos Aires",
        latitude: -34.6037,
        longitude: -58.3816,
        population: 3120612,
        timezone: "America/Argentina/Buenos_Aires"
      }
    ]
  },
  {
    name: "Alemanha",
    officialName: "Federal Republic of Germany",
    code: "DE",
    capital: "Berlin",
    region: "Europe",
    subregion: "Western Europe",
    population: 84482267,
    language: "Alemao",
    currency: "EUR",
    area: 357114,
    latitude: 51.1657,
    longitude: 10.4515,
    flagUrl: "https://flagcdn.com/de.svg",
    continentCode: "EU",
    cities: [
      {
        name: "Berlin",
        state: "Berlin",
        latitude: 52.52,
        longitude: 13.405,
        population: 3850809,
        timezone: "Europe/Berlin"
      }
    ]
  }
];

export class SeedService {
  async seedContinents() {
    const results = [];

    for (const continent of continents) {
      results.push(
        await prisma.continent.upsert({
          where: { code: continent.code },
          update: continent,
          create: continent
        })
      );
    }

    return results;
  }

  async seedCountries() {
    await this.seedContinents();
    const results = [];

    for (const countrySeed of countries) {
      const continent = await prisma.continent.findUniqueOrThrow({
        where: { code: countrySeed.continentCode }
      });

      const { cities, continentCode: _continentCode, ...countryData } = countrySeed;

      const country = await prisma.country.upsert({
        where: { code: countryData.code },
        update: {
          ...countryData,
          continentId: continent.id
        },
        create: {
          ...countryData,
          continentId: continent.id
        }
      });

      for (const citySeed of cities) {
        const existingCity = await prisma.city.findFirst({
          where: { name: citySeed.name, countryId: country.id }
        });

        if (existingCity) {
          await prisma.city.update({
            where: { id: existingCity.id },
            data: citySeed
          });
        } else {
          await prisma.city.create({
            data: {
              ...citySeed,
              countryId: country.id
            }
          });
        }
      }

      results.push(country);
    }

    return results;
  }
}

export const seedService = new SeedService();
