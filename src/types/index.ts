export interface Installation {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  installedPower: number; // kW
  location: string;
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  lastUpdate: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  installations: Installation[];
}

export interface PowerData {
  timestamp: string;
  power: number; // kW
  irradiation?: number; // W/m²
}

export interface EnergyData {
  timestamp: string;
  energy: number; // kWh
  type: 'production' | 'consumption' | 'export' | 'import';
}

export interface InstallationComparison {
  installationId: string;
  installationName: string;
  totalPower: number;
  totalEnergy: number;
  energyYield: number; // kWh/kW
  period: string;
}

export interface InstallationDetail {
  installation: Installation;
  currentPower: number;
  autokonsumpcja: number; // self-consumption
  energyImported: number;
  energyExported: number;
  powerHistory: PowerData[];
  weatherData: WeatherData[];
}

export interface WeatherData {
  timestamp: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  irradiation: number;
}

export interface ProcessIssue {
  id: string;
  installationId: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface MonthlyReport {
  installationId: string;
  month: string;
  year: number;
  totalProduction: number;
  totalConsumption: number;
  totalExport: number;
  totalImport: number;
  efficiency: number;
}

export interface ApiConfig {
  baseUrl: string;
  endpoints: {
    installations: string;
    clients: string;
    powerData: string;
    energyData: string;
    weatherData: string;
    reports: string;
    issues: string;
  };
}
