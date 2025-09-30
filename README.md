# Solar Monitoring System

A comprehensive Next.js application for monitoring and managing solar installations with real-time data visualization, reporting, and issue tracking.

## Features

### 1. Installation Comparison View
- **Total installed power** across multiple installations
- **Energy production comparison** between installations
- **Energy yield comparison** (kWh per installed kW)
- Interactive charts and detailed statistics

### 2. Detailed Installation View
- **Real-time power monitoring** with current power display
- **Self-consumption tracking** (autokonsumpcja + energy imported)
- **Energy export monitoring** (autokonsumpcja + energy exported to grid)
- **Power vs weather data charts** with solar irradiation correlation
- **Weather station integration** for environmental data

### 3. Process Monitoring
- **Current processes and issues** tracking
- **Real-time alerts** and notifications
- **Issue categorization** (errors, warnings, info)
- **Installation-specific filtering**

### 4. Monthly Reports
- **PDF report generation** for production/export/consumption
- **Email report distribution**
- **Monthly analytics** with charts and comparisons
- **Historical data analysis**

## API Integration

The application integrates with a FastAPI backend through aggregated queries with different granularity levels:

### Data Granularity
- **Power and irradiation data**: 5-minute intervals for daily data
- **Energy data**: Hourly intervals for daily data
- **Monthly data**: Daily intervals for monthly data
- **Yearly data**: Monthly intervals for yearly data
- **Total data**: Yearly intervals for complete history

### API Endpoints

#### Configuration API
- `GET /api/clients` - Get all clients
- `GET /api/installations` - Get all installations (with optional client filter)

#### Data API
- `GET /api/power-data` - Power and irradiation data with granularity
- `GET /api/energy-data` - Energy data with granularity
- `GET /api/weather-data` - Weather station data
- `GET /api/installations/{id}/detail` - Detailed installation data

#### Monitoring API
- `GET /api/issues` - Process issues and alerts
- `GET /api/reports/monthly` - Monthly report data
- `POST /api/reports/pdf` - Generate PDF report
- `POST /api/reports/email` - Send email report

## Technology Stack

- **Frontend**: Next.js 15 with TypeScript
- **UI Components**: shadcn/ui with Tailwind CSS
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **PDF Generation**: jsPDF with html2canvas
- **Date Handling**: date-fns

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- FastAPI backend running on port 8000

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd solar-monitoring
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

Edit `.env.local` with your API configuration:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Dashboard
│   ├── comparison/        # Installation comparison
│   ├── installations/     # Installation management
│   ├── issues/           # Process monitoring
│   └── reports/          # Monthly reports
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── InstallationComparison.tsx
│   ├── InstallationDetail.tsx
│   ├── ProcessIssues.tsx
│   ├── MonthlyReport.tsx
│   └── Navigation.tsx
├── lib/                  # Utilities and API client
│   ├── api.ts            # API client with FastAPI integration
│   └── utils.ts          # Utility functions
└── types/                # TypeScript type definitions
    └── index.ts          # Application types
```

## API Client Configuration

The application uses a centralized API client (`src/lib/api.ts`) that handles:

- **Aggregated queries** with different granularity levels
- **Error handling** and retry logic
- **Type-safe** API responses
- **Configuration management** for different environments

### Example Usage

```typescript
import { apiClient } from '@/lib/api';

// Get power data with 5-minute granularity
const powerData = await apiClient.getPowerData(
  'installation-id',
  '5min',
  '2024-01-01',
  '2024-01-02'
);

// Get monthly report
const report = await apiClient.getMonthlyReport(
  'installation-id',
  1, // January
  2024
);
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.