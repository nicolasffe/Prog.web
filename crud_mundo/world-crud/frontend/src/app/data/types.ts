export interface Continent {
  id: string;
  name: string;
  code: string;
  description: string;
  color: string;
}

export interface Country {
  id: string;
  name: string;
  officialName?: string;
  continentId: string;
  population: number;
  language: string;
  languages?: string[];
  currency: string;
  currencies?: Array<{ code: string; name: string; symbol?: string }>;
  capital: string;
  flag: string;
  flagUrl?: string;
  flagAlt?: string;
  lat: number;
  lng: number;
  area: number;
  timezone: string;
  timezones?: string[];
  region?: string;
  subregion?: string;
  maps?: {
    googleMaps?: string;
    openStreetMaps?: string;
  };
  isoCode: string;
  isoNumeric: number;
}

export interface City {
  id: string;
  name: string;
  countryId: string;
  population: number;
  lat: number;
  lng: number;
  isCapital: boolean;
}

export interface ActivityItem {
  id: string;
  action: 'created' | 'updated' | 'deleted' | 'signed_in' | 'signed_out' | 'registered' | 'refreshed';
  entity: 'continent' | 'country' | 'city' | 'user' | 'weather';
  name: string;
  timestamp: Date;
}
