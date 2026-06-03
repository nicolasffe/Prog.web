import { createBrowserRouter, redirect } from 'react-router';
import GlobeMain from './components/GlobeMain';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ContinentsPage from './components/ContinentsPage';
import CountriesPage from './components/CountriesPage';
import CitiesPage from './components/CitiesPage';
import CountryDetails from './components/CountryDetails';
import CityDetails from './components/CityDetails';
import WorldMapPage from './components/WorldMapPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: GlobeMain,
  },
  {
    path: '/login',
    loader: () => redirect('/'),
  },
  {
    path: '/register',
    loader: () => redirect('/'),
  },
  {
    path: '/dashboard',
    loader: () => redirect('/app/dashboard'),
  },
  {
    path: '/continents',
    loader: () => redirect('/app/continents'),
  },
  {
    path: '/countries',
    loader: () => redirect('/app/countries'),
  },
  {
    path: '/countries/:id',
    loader: ({ params }) => redirect(`/app/countries/${params.id}`),
  },
  {
    path: '/cities',
    loader: () => redirect('/app/cities'),
  },
  {
    path: '/cities/:id',
    loader: ({ params }) => redirect(`/app/cities/${params.id}`),
  },
  {
    path: '/map',
    loader: () => redirect('/'),
  },
  {
    path: '/app',
    Component: Layout,
    children: [
      {
        index: true,
        loader: () => redirect('/app/dashboard'),
      },
      {
        path: 'dashboard',
        Component: Dashboard,
      },
      {
        path: 'continents',
        Component: ContinentsPage,
      },
      {
        path: 'countries',
        Component: CountriesPage,
      },
      {
        path: 'countries/:id',
        Component: CountryDetails,
      },
      {
        path: 'cities',
        Component: CitiesPage,
      },
      {
        path: 'cities/:id',
        Component: CityDetails,
      },
      {
        path: 'map',
        Component: WorldMapPage,
      },
    ],
  },
  {
    path: '*',
    loader: () => redirect('/'),
  },
]);
