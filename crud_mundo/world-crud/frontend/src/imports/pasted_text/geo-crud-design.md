Create a complete, modern, minimalist UI/UX design for a geographic CRUD web application.

The system manages Continents, Countries, and Cities with the hierarchy:

Continent → Country → City

The main experience should be centered around an interactive world map. The user should be able to explore the map, select a country, view its information, select one of its cities, and edit the city data through a clean side panel or modal.

Project context:
This is an academic web application that must support full CRUD operations for continents, countries, and cities. It should also display external API data such as country flags, population, currency, official language, weather, maps, coordinates, or geographic information.

Design style:
Create a minimalist, modern, clean, and professional dashboard inspired by the globe and world geography. Use a neutral color palette with subtle accents of deep blue, teal, cyan, or soft green. The design should feel polished, elegant, and complete, like a modern SaaS dashboard.

Main visual concept:
A map-first interface where the world map is the central element of the system, not just decoration. The user should naturally navigate through:

World Map → Select Country → View Country Details → Select City → Edit City

Required screens:

1. Login Screen
- Minimal centered login card
- Email and password fields
- Primary login button
- Subtle globe or world map background
- Clean academic/professional look

2. Main Dashboard
- Large interactive world map as the main focus
- Sidebar navigation
- Header with page title, search bar, and user profile
- Summary cards showing total continents, countries, and cities
- External API cards showing examples such as featured country, weather, flag, currency, or population
- Recent activity section
- Quick action buttons for adding continent, country, or city

3. Interactive World Map Screen
Design this as the main feature of the app.
- Large world map occupying most of the screen
- Countries should appear selectable
- When a country is selected, open a right-side panel with:
  - Country name
  - Flag
  - Continent
  - Population
  - Currency
  - Official language
  - Coordinates
  - Weather preview
  - List of cities related to that country
- Include actions:
  - View country details
  - Edit country
  - Add city
  - Delete country

4. City Selection and Editing Flow
After selecting a country, the user should see a list of cities.
When selecting a city, show a city details/edit panel with:
- City name
- Population
- Latitude
- Longitude
- Related country
- Weather information
- Map/location preview
- Save button
- Cancel button
- Delete button
- Success and error feedback states

5. Continents Management Screen
- Table or card layout
- Fields: ID, name, description
- Search filter
- Pagination
- Create, edit, delete, and view actions
- Modal or drawer form for adding/editing continents

6. Countries Management Screen
- Table or card layout
- Fields: ID, name, population, official language, currency, continent
- Country flag display
- Filter by continent
- Search and pagination
- Create, edit, delete, and view actions
- Modal or drawer form

7. Cities Management Screen
- Table or card layout
- Fields: ID, name, population, latitude, longitude, country
- Filters by country and continent
- Search and pagination
- Create, edit, delete, and view actions
- Modal or drawer form

8. Country Details Screen
- Hero section with country name, flag, and continent
- Cards for population, currency, language, coordinates, and weather
- Related cities list
- Map preview
- Edit and delete actions

9. City Details Screen
- City title and related country
- Population card
- Latitude and longitude card
- Weather card
- Map/location preview
- Edit and delete actions

Components to design:
- Sidebar
- Header
- Search bar
- Metric cards
- Interactive world map area
- Country side panel
- City side panel
- Data tables
- Filters
- Pagination
- Forms
- Modals
- Drawers
- Badges
- Empty states
- Loading skeletons
- Delete confirmation dialog
- Toast notifications
- API data cards
- Map preview cards

UX requirements:
- The interface must be intuitive and easy to navigate
- The map should be the central navigation experience
- The CRUD actions must be clear and accessible
- The design must be responsive for desktop, tablet, and mobile
- Use realistic mock data
- Include empty, loading, success, and error states
- Keep the visual style minimal, but do not make the app feel incomplete
- Avoid a landing-page look. This must look like a real web application dashboard

Visual identity:
Use subtle globe-inspired elements:
- Soft map grid patterns
- Rounded world map cards
- Small coordinate labels
- Flag badges
- Location pins
- Thin borders
- Soft shadows
- Clean typography
- Spacious layout

Goal:
Design a complete map-first CRUD dashboard for managing continents, countries, and cities, with a modern global/geographic identity and a minimalist professional interface.