# Real Estate Analytics Dashboard

A modern, polished data analytics dashboard built with React, PrimeReact, and Chart.js. This dashboard provides comprehensive real estate analytics including revenue tracking, property distribution, regional sales, and transaction management.

## Features

- **Interactive KPI Cards**: Real-time statistics with trend indicators
- **Multiple Chart Types**: Line charts, bar charts, pie charts, and doughnut charts
- **Data Tables**: Sortable, searchable tables with pagination
- **Responsive Design**: Mobile-friendly layout using PrimeFlex grid system
- **Mock Data Service**: Built-in mock data generator for testing and development
- **Modern UI**: Clean, professional interface with PrimeReact components

## Tech Stack

- **React 18.2.0**: Modern React with hooks
- **PrimeReact 10.2.1**: Comprehensive UI component library
- **Chart.js 4.4.1**: Powerful charting library
- **React-ChartJS-2 5.2.0**: React wrapper for Chart.js
- **Axios 1.6.2**: HTTP client for API calls
- **React Router 6.20.1**: Client-side routing
- **PrimeFlex 3.3.1**: CSS utility library for responsive layouts
- **React Icons 4.12.0**: Icon library

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and set your API URL:
```
REACT_APP_API_URL=http://localhost:5000/api
```

For production:
```
REACT_APP_API_URL=https://flask-app.gravvisoft.com/api
```

### Running the Application

Start the development server:
```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

### Building for Production

Create an optimized production build:
```bash
npm run build
```

The build output will be in the `build/` directory.

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── StatCard.jsx          # KPI stat card component
│   │   ├── StatCard.css
│   │   ├── ChartCard.jsx         # Reusable chart component
│   │   ├── ChartCard.css
│   │   ├── DataTable.jsx         # Data table component
│   │   ├── DataTable.css
│   │   ├── Navbar.jsx            # Navigation bar
│   │   └── Navbar.css
│   ├── pages/
│   │   ├── Dashboard.jsx         # Main dashboard page
│   │   └── Dashboard.css
│   ├── services/
│   │   └── dataService.js        # API service with mock data
│   ├── App.jsx
│   ├── App.css
│   ├── index.js
│   └── index.css
├── .env
├── .gitignore
├── package.json
└── README.md
```

## Components Overview

### StatCard
Displays key performance indicators with:
- Title and value
- Icon with customizable color
- Trend indicator (up/down with percentage)
- Hover animation

### ChartCard
Flexible chart component supporting:
- Line charts
- Bar charts
- Pie charts
- Doughnut charts
- Customizable options and styling

### DataTable
Feature-rich data table with:
- Global search
- Column sorting
- Pagination
- Status badges
- Responsive design

### Navbar
Navigation component featuring:
- Brand logo and name
- Menu items with active states
- Notification badge
- User avatar

## Mock Data Service

The application includes a comprehensive mock data service (`dataService.js`) that provides:
- Revenue data over time
- Property type distribution
- Sales by region
- Monthly trends
- Recent transactions
- Top performing agents
- KPI statistics

The service automatically falls back to mock data if the API is unavailable, making it perfect for development and testing.

## Customization

### Changing Colors

Modify the color scheme in component CSS files:
- Primary: `#3B82F6` (blue)
- Success: `#10B981` (green)
- Warning: `#F59E0B` (amber)
- Danger: `#EF4444` (red)

### Adding New Charts

1. Create chart data in `dataService.js`
2. Add a new `ChartCard` component in your page
3. Pass the data and specify the chart type

### Connecting to Real API

Update `dataService.js` to use your backend endpoints:
```javascript
async getDashboardData() {
  const response = await axios.get(`${API_BASE_URL}/dashboard`);
  return response.data;
}
```

## Available Scripts

- `npm start`: Run development server
- `npm run build`: Create production build
- `npm test`: Run tests
- `npm run eject`: Eject from Create React App (irreversible)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is part of the Flask Real Estate application.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request