import { prisma } from "../prisma/client";

const continents = [
  {
    name: "América do Sul",
    code: "SA",
    description: "Continente ao sul das Américas, com grande diversidade natural."
  },
  {
    name: "América do Norte",
    code: "NA",
    description: "Região continental com Canadá, Estados Unidos, México e territórios."
  },
  {
    name: "Europa",
    code: "EU",
    description: "Continente histórico com alta densidade urbana e cultural."
  },
  {
    name: "Ásia",
    code: "AS",
    description: "Maior continente do planeta em área e população."
  },
  {
    name: "África",
    code: "AF",
    description: "Continente de enorme diversidade geográfica, cultural e climática."
  },
  {
    name: "Oceania",
    code: "OC",
    description: "Região formada por Austrália, Nova Zelândia e ilhas do Pacífico."
  },
  {
    name: "Antártida",
    code: "AN",
    description: "Continente polar dedicado majoritariamente a pesquisa científica."
  }
];

const countries = [
  {
    name: "Brasil",
    officialName: "República Federativa do Brasil",
    code: "BR",
    capital: "Brasília",
    region: "Americas",
    subregion: "South America",
    population: 203080756,
    language: "Português",
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
      },
      {
        name: "Manaus",
        state: "Amazonas",
        latitude: -3.119,
        longitude: -60.0217,
        population: 2063689,
        timezone: "America/Manaus"
      },
      {
        name: "Salvador",
        state: "Bahia",
        latitude: -12.9777,
        longitude: -38.5016,
        population: 2417678,
        timezone: "America/Bahia"
      },
      {
        name: "Recife",
        state: "Pernambuco",
        latitude: -8.0476,
        longitude: -34.877,
        population: 1488920,
        timezone: "America/Recife"
      },
      {
        name: "Porto Alegre",
        state: "Rio Grande do Sul",
        latitude: -30.0346,
        longitude: -51.2177,
        population: 1332845,
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
    language: "Inglês",
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
      },
      {
        name: "Chicago",
        state: "Illinois",
        latitude: 41.8781,
        longitude: -87.6298,
        population: 2746388,
        timezone: "America/Chicago"
      },
      {
        name: "Houston",
        state: "Texas",
        latitude: 29.7604,
        longitude: -95.3698,
        population: 2304580,
        timezone: "America/Chicago"
      },
      {
        name: "Miami",
        state: "Florida",
        latitude: 25.7617,
        longitude: -80.1918,
        population: 442241,
        timezone: "America/New_York"
      },
      {
        name: "Seattle",
        state: "Washington",
        latitude: 47.6062,
        longitude: -122.3321,
        population: 737015,
        timezone: "America/Los_Angeles"
      }
    ]
  },
  {
    name: "França",
    officialName: "République française",
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
      },
      {
        name: "Marseille",
        state: "Provence-Alpes-Cote d'Azur",
        latitude: 43.2965,
        longitude: 5.3698,
        population: 873076,
        timezone: "Europe/Paris"
      },
      {
        name: "Nice",
        state: "Provence-Alpes-Cote d'Azur",
        latitude: 43.7102,
        longitude: 7.262,
        population: 343477,
        timezone: "Europe/Paris"
      },
      {
        name: "Toulouse",
        state: "Occitanie",
        latitude: 43.6047,
        longitude: 1.4442,
        population: 504078,
        timezone: "Europe/Paris"
      },
      {
        name: "Lille",
        state: "Hauts-de-France",
        latitude: 50.6292,
        longitude: 3.0573,
        population: 236234,
        timezone: "Europe/Paris"
      }
    ]
  },
  {
    name: "Japão",
    officialName: "Japan",
    code: "JP",
    capital: "Tokyo",
    region: "Ásia",
    subregion: "Eastern Asia",
    population: 124516650,
    language: "Japonês",
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
      },
      {
        name: "Sapporo",
        state: "Hokkaido",
        latitude: 43.0618,
        longitude: 141.3545,
        population: 1973395,
        timezone: "Asia/Tokyo"
      },
      {
        name: "Kyoto",
        state: "Kyoto",
        latitude: 35.0116,
        longitude: 135.7681,
        population: 1463723,
        timezone: "Asia/Tokyo"
      },
      {
        name: "Fukuoka",
        state: "Fukuoka",
        latitude: 33.5902,
        longitude: 130.4017,
        population: 1612392,
        timezone: "Asia/Tokyo"
      },
      {
        name: "Naha",
        state: "Okinawa",
        latitude: 26.2124,
        longitude: 127.6792,
        population: 317625,
        timezone: "Asia/Tokyo"
      }
    ]
  },
  {
    name: "Argentina",
    officialName: "República Argentina",
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
      },
      {
        name: "Cordoba",
        state: "Cordoba",
        latitude: -31.4201,
        longitude: -64.1888,
        population: 1565112,
        timezone: "America/Argentina/Cordoba"
      },
      {
        name: "Rosario",
        state: "Santa Fe",
        latitude: -32.9442,
        longitude: -60.6505,
        population: 1342369,
        timezone: "America/Argentina/Cordoba"
      },
      {
        name: "Mendoza",
        state: "Mendoza",
        latitude: -32.8895,
        longitude: -68.8458,
        population: 115041,
        timezone: "America/Argentina/Mendoza"
      },
      {
        name: "Ushuaia",
        state: "Tierra del Fuego",
        latitude: -54.8019,
        longitude: -68.303,
        population: 82000,
        timezone: "America/Argentina/Ushuaia"
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
    language: "Alemão",
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
      },
      {
        name: "Hamburg",
        state: "Hamburg",
        latitude: 53.5511,
        longitude: 9.9937,
        population: 1892122,
        timezone: "Europe/Berlin"
      },
      {
        name: "Munich",
        state: "Bavaria",
        latitude: 48.1351,
        longitude: 11.582,
        population: 1512491,
        timezone: "Europe/Berlin"
      },
      {
        name: "Cologne",
        state: "North Rhine-Westphalia",
        latitude: 50.9375,
        longitude: 6.9603,
        population: 1084831,
        timezone: "Europe/Berlin"
      },
      {
        name: "Frankfurt",
        state: "Hesse",
        latitude: 50.1109,
        longitude: 8.6821,
        population: 773068,
        timezone: "Europe/Berlin"
      }
    ]
  },
  {
    name: "Canadá",
    officialName: "Canada",
    code: "CA",
    capital: "Ottawa",
    region: "Americas",
    subregion: "North America",
    population: 40097761,
    language: "Inglês / Francês",
    currency: "CAD",
    area: 9984670,
    latitude: 56.1304,
    longitude: -106.3468,
    flagUrl: "https://flagcdn.com/ca.svg",
    continentCode: "NA",
    cities: [
      { name: "Toronto", state: "Ontario", latitude: 43.6532, longitude: -79.3832, population: 2794356, timezone: "America/Toronto" },
      { name: "Montreal", state: "Quebec", latitude: 45.5017, longitude: -73.5673, population: 1762949, timezone: "America/Toronto" },
      { name: "Vancouver", state: "British Columbia", latitude: 49.2827, longitude: -123.1207, population: 662248, timezone: "America/Vancouver" },
      { name: "Ottawa", state: "Ontario", latitude: 45.4215, longitude: -75.6972, population: 1017449, timezone: "America/Toronto" }
    ]
  },
  {
    name: "México",
    officialName: "Estados Unidos Mexicanos",
    code: "MX",
    capital: "Cidade do México",
    region: "Americas",
    subregion: "North America",
    population: 129875529,
    language: "Espanhol",
    currency: "MXN",
    area: 1964375,
    latitude: 23.6345,
    longitude: -102.5528,
    flagUrl: "https://flagcdn.com/mx.svg",
    continentCode: "NA",
    cities: [
      { name: "Cidade do México", state: "Cidade do México", latitude: 19.4326, longitude: -99.1332, population: 9209944, timezone: "America/Mexico_City" },
      { name: "Guadalajara", state: "Jalisco", latitude: 20.6597, longitude: -103.3496, population: 1385621, timezone: "America/Mexico_City" },
      { name: "Monterrey", state: "Nuevo Leon", latitude: 25.6866, longitude: -100.3161, population: 1142994, timezone: "America/Monterrey" },
      { name: "Cancun", state: "Quintana Roo", latitude: 21.1619, longitude: -86.8515, population: 888797, timezone: "America/Cancun" }
    ]
  },
  {
    name: "Colômbia",
    officialName: "República da Colômbia",
    code: "CO",
    capital: "Bogotá",
    region: "Americas",
    subregion: "South America",
    population: 52085168,
    language: "Espanhol",
    currency: "COP",
    area: 1141748,
    latitude: 4.5709,
    longitude: -74.2973,
    flagUrl: "https://flagcdn.com/co.svg",
    continentCode: "SA",
    cities: [
      { name: "Bogotá", state: "Distrito Capital", latitude: 4.711, longitude: -74.0721, population: 7181469, timezone: "America/Bogota" },
      { name: "Medellín", state: "Antioquia", latitude: 6.2442, longitude: -75.5812, population: 2533424, timezone: "America/Bogota" },
      { name: "Cali", state: "Valle del Cauca", latitude: 3.4516, longitude: -76.532, population: 2227642, timezone: "America/Bogota" },
      { name: "Cartagena", state: "Bolivar", latitude: 10.391, longitude: -75.4794, population: 914552, timezone: "America/Bogota" }
    ]
  },
  {
    name: "Reino Unido",
    officialName: "United Kingdom of Great Britain and Northern Ireland",
    code: "GB",
    capital: "London",
    region: "Europe",
    subregion: "Northern Europe",
    population: 68138484,
    language: "Inglês",
    currency: "GBP",
    area: 242495,
    latitude: 55.3781,
    longitude: -3.436,
    flagUrl: "https://flagcdn.com/gb.svg",
    continentCode: "EU",
    cities: [
      { name: "London", state: "England", latitude: 51.5072, longitude: -0.1276, population: 8799800, timezone: "Europe/London" },
      { name: "Manchester", state: "England", latitude: 53.4808, longitude: -2.2426, population: 552858, timezone: "Europe/London" },
      { name: "Edinburgh", state: "Scotland", latitude: 55.9533, longitude: -3.1883, population: 506520, timezone: "Europe/London" },
      { name: "Belfast", state: "Northern Ireland", latitude: 54.5973, longitude: -5.9301, population: 345418, timezone: "Europe/London" }
    ]
  },
  {
    name: "Itália",
    officialName: "Repubblica Italiana",
    code: "IT",
    capital: "Roma",
    region: "Europe",
    subregion: "Southern Europe",
    population: 58870762,
    language: "Italiano",
    currency: "EUR",
    area: 301340,
    latitude: 41.8719,
    longitude: 12.5674,
    flagUrl: "https://flagcdn.com/it.svg",
    continentCode: "EU",
    cities: [
      { name: "Roma", state: "Lazio", latitude: 41.9028, longitude: 12.4964, population: 2748109, timezone: "Europe/Rome" },
      { name: "Milão", state: "Lombardia", latitude: 45.4642, longitude: 9.19, population: 1354196, timezone: "Europe/Rome" },
      { name: "Nápoles", state: "Campania", latitude: 40.8518, longitude: 14.2681, population: 909048, timezone: "Europe/Rome" },
      { name: "Turim", state: "Piemonte", latitude: 45.0703, longitude: 7.6869, population: 841600, timezone: "Europe/Rome" }
    ]
  },
  {
    name: "Espanha",
    officialName: "Reino de España",
    code: "ES",
    capital: "Madrid",
    region: "Europe",
    subregion: "Southern Europe",
    population: 48619695,
    language: "Espanhol",
    currency: "EUR",
    area: 505990,
    latitude: 40.4637,
    longitude: -3.7492,
    flagUrl: "https://flagcdn.com/es.svg",
    continentCode: "EU",
    cities: [
      { name: "Madrid", state: "Comunidade de Madrid", latitude: 40.4168, longitude: -3.7038, population: 3280782, timezone: "Europe/Madrid" },
      { name: "Barcelona", state: "Catalunha", latitude: 41.3874, longitude: 2.1686, population: 1636193, timezone: "Europe/Madrid" },
      { name: "Valência", state: "Comunidade Valenciana", latitude: 39.4699, longitude: -0.3763, population: 792492, timezone: "Europe/Madrid" },
      { name: "Sevilha", state: "Andaluzia", latitude: 37.3891, longitude: -5.9845, population: 684234, timezone: "Europe/Madrid" }
    ]
  },
  {
    name: "China",
    officialName: "People's Republic of China",
    code: "CN",
    capital: "Beijing",
    region: "Asia",
    subregion: "Eastern Asia",
    population: 1410710000,
    language: "Mandarim",
    currency: "CNY",
    area: 9596960,
    latitude: 35.8617,
    longitude: 104.1954,
    flagUrl: "https://flagcdn.com/cn.svg",
    continentCode: "AS",
    cities: [
      { name: "Beijing", state: "Beijing", latitude: 39.9042, longitude: 116.4074, population: 21893095, timezone: "Asia/Shanghai" },
      { name: "Shanghai", state: "Shanghai", latitude: 31.2304, longitude: 121.4737, population: 24870895, timezone: "Asia/Shanghai" },
      { name: "Guangzhou", state: "Guangdong", latitude: 23.1291, longitude: 113.2644, population: 18810600, timezone: "Asia/Shanghai" },
      { name: "Shenzhen", state: "Guangdong", latitude: 22.5431, longitude: 114.0579, population: 17661900, timezone: "Asia/Shanghai" }
    ]
  },
  {
    name: "Índia",
    officialName: "Republic of India",
    code: "IN",
    capital: "New Delhi",
    region: "Asia",
    subregion: "Southern Asia",
    population: 1428627663,
    language: "Hindi / Inglês",
    currency: "INR",
    area: 3287263,
    latitude: 20.5937,
    longitude: 78.9629,
    flagUrl: "https://flagcdn.com/in.svg",
    continentCode: "AS",
    cities: [
      { name: "New Delhi", state: "Delhi", latitude: 28.6139, longitude: 77.209, population: 249998, timezone: "Asia/Kolkata" },
      { name: "Mumbai", state: "Maharashtra", latitude: 19.076, longitude: 72.8777, population: 12478447, timezone: "Asia/Kolkata" },
      { name: "Bengaluru", state: "Karnataka", latitude: 12.9716, longitude: 77.5946, population: 8443675, timezone: "Asia/Kolkata" },
      { name: "Kolkata", state: "West Bengal", latitude: 22.5726, longitude: 88.3639, population: 4496694, timezone: "Asia/Kolkata" }
    ]
  },
  {
    name: "Coreia do Sul",
    officialName: "Republic of Korea",
    code: "KR",
    capital: "Seoul",
    region: "Asia",
    subregion: "Eastern Asia",
    population: 51712619,
    language: "Coreano",
    currency: "KRW",
    area: 100210,
    latitude: 35.9078,
    longitude: 127.7669,
    flagUrl: "https://flagcdn.com/kr.svg",
    continentCode: "AS",
    cities: [
      { name: "Seoul", state: "Seoul", latitude: 37.5665, longitude: 126.978, population: 9386034, timezone: "Asia/Seoul" },
      { name: "Busan", state: "Busan", latitude: 35.1796, longitude: 129.0756, population: 3317812, timezone: "Asia/Seoul" },
      { name: "Incheon", state: "Incheon", latitude: 37.4563, longitude: 126.7052, population: 3000000, timezone: "Asia/Seoul" },
      { name: "Daegu", state: "Daegu", latitude: 35.8714, longitude: 128.6014, population: 2375306, timezone: "Asia/Seoul" }
    ]
  },
  {
    name: "Nigéria",
    officialName: "Federal Republic of Nigeria",
    code: "NG",
    capital: "Abuja",
    region: "Africa",
    subregion: "Western Africa",
    population: 223804632,
    language: "Inglês",
    currency: "NGN",
    area: 923768,
    latitude: 9.082,
    longitude: 8.6753,
    flagUrl: "https://flagcdn.com/ng.svg",
    continentCode: "AF",
    cities: [
      { name: "Lagos", state: "Lagos", latitude: 6.5244, longitude: 3.3792, population: 15946000, timezone: "Africa/Lagos" },
      { name: "Abuja", state: "FCT", latitude: 9.0765, longitude: 7.3986, population: 3770000, timezone: "Africa/Lagos" },
      { name: "Kano", state: "Kano", latitude: 12.0022, longitude: 8.592, population: 3848885, timezone: "Africa/Lagos" },
      { name: "Ibadan", state: "Oyo", latitude: 7.3775, longitude: 3.947, population: 3552000, timezone: "Africa/Lagos" }
    ]
  },
  {
    name: "Egito",
    officialName: "Arab Republic of Egypt",
    code: "EG",
    capital: "Cairo",
    region: "Africa",
    subregion: "Northern Africa",
    population: 112716598,
    language: "Árabe",
    currency: "EGP",
    area: 1001449,
    latitude: 26.8206,
    longitude: 30.8025,
    flagUrl: "https://flagcdn.com/eg.svg",
    continentCode: "AF",
    cities: [
      { name: "Cairo", state: "Cairo", latitude: 30.0444, longitude: 31.2357, population: 10100000, timezone: "Africa/Cairo" },
      { name: "Alexandria", state: "Alexandria", latitude: 31.2001, longitude: 29.9187, population: 5200000, timezone: "Africa/Cairo" },
      { name: "Giza", state: "Giza", latitude: 30.0131, longitude: 31.2089, population: 4430000, timezone: "Africa/Cairo" },
      { name: "Luxor", state: "Luxor", latitude: 25.6872, longitude: 32.6396, population: 506588, timezone: "Africa/Cairo" }
    ]
  },
  {
    name: "África do Sul",
    officialName: "Republic of South Africa",
    code: "ZA",
    capital: "Pretoria",
    region: "Africa",
    subregion: "Southern Africa",
    population: 60414495,
    language: "Zulu / Inglês / Africâner",
    currency: "ZAR",
    area: 1219090,
    latitude: -30.5595,
    longitude: 22.9375,
    flagUrl: "https://flagcdn.com/za.svg",
    continentCode: "AF",
    cities: [
      { name: "Pretoria", state: "Gauteng", latitude: -25.7479, longitude: 28.2293, population: 741651, timezone: "Africa/Johannesburg" },
      { name: "Johannesburg", state: "Gauteng", latitude: -26.2041, longitude: 28.0473, population: 5635127, timezone: "Africa/Johannesburg" },
      { name: "Cape Town", state: "Western Cape", latitude: -33.9249, longitude: 18.4241, population: 4618000, timezone: "Africa/Johannesburg" },
      { name: "Durban", state: "KwaZulu-Natal", latitude: -29.8587, longitude: 31.0218, population: 3442361, timezone: "Africa/Johannesburg" }
    ]
  },
  {
    name: "Austrália",
    officialName: "Commonwealth of Australia",
    code: "AU",
    capital: "Canberra",
    region: "Oceania",
    subregion: "Australia and New Zealand",
    population: 26638544,
    language: "Inglês",
    currency: "AUD",
    area: 7692024,
    latitude: -25.2744,
    longitude: 133.7751,
    flagUrl: "https://flagcdn.com/au.svg",
    continentCode: "OC",
    cities: [
      { name: "Sydney", state: "New South Wales", latitude: -33.8688, longitude: 151.2093, population: 5297089, timezone: "Australia/Sydney" },
      { name: "Melbourne", state: "Victoria", latitude: -37.8136, longitude: 144.9631, population: 5031195, timezone: "Australia/Melbourne" },
      { name: "Brisbane", state: "Queensland", latitude: -27.4698, longitude: 153.0251, population: 2505821, timezone: "Australia/Brisbane" },
      { name: "Canberra", state: "ACT", latitude: -35.2809, longitude: 149.13, population: 466566, timezone: "Australia/Sydney" }
    ]
  },
  {
    name: "Nova Zelândia",
    officialName: "New Zealand",
    code: "NZ",
    capital: "Wellington",
    region: "Oceania",
    subregion: "Australia and New Zealand",
    population: 5228100,
    language: "Inglês / Maori",
    currency: "NZD",
    area: 268021,
    latitude: -40.9006,
    longitude: 174.886,
    flagUrl: "https://flagcdn.com/nz.svg",
    continentCode: "OC",
    cities: [
      { name: "Auckland", state: "Auckland", latitude: -36.8485, longitude: 174.7633, population: 1695200, timezone: "Pacific/Auckland" },
      { name: "Wellington", state: "Wellington", latitude: -41.2865, longitude: 174.7762, population: 215900, timezone: "Pacific/Auckland" },
      { name: "Christchurch", state: "Canterbury", latitude: -43.5321, longitude: 172.6362, population: 389300, timezone: "Pacific/Auckland" },
      { name: "Queenstown", state: "Otago", latitude: -45.0312, longitude: 168.6626, population: 15790, timezone: "Pacific/Auckland" }
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
