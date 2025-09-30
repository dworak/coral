import { 
  Installation, 
  Client, 
  PowerData, 
  EnergyData, 
  InstallationDetail, 
  ProcessIssue, 
  MonthlyReport 
} from '@/types';

// Mock data
const mockInstallations: Installation[] = [
  {
    id: "inst-001",
    name: "Solar Farm Alpha",
    clientId: "client-001",
    clientName: "Green Energy Corp",
    installedPower: 50.0,
    location: "Warsaw, Poland",
    status: "active",
    lastUpdate: new Date().toISOString()
  },
  {
    id: "inst-002",
    name: "Residential Solar 1",
    clientId: "client-002",
    clientName: "John Smith",
    installedPower: 10.5,
    location: "Krakow, Poland",
    status: "active",
    lastUpdate: new Date().toISOString()
  },
  {
    id: "inst-003",
    name: "Industrial Solar",
    clientId: "client-001",
    clientName: "Green Energy Corp",
    installedPower: 100.0,
    location: "Gdansk, Poland",
    status: "maintenance",
    lastUpdate: new Date().toISOString()
  },
];

const mockClients: Client[] = [
  {
    id: "client-001",
    name: "Green Energy Corp",
    email: "contact@greenenergy.com",
    installations: mockInstallations.filter(inst => inst.clientId === "client-001")
  },
  {
    id: "client-002",
    name: "John Smith",
    email: "john.smith@email.com",
    installations: mockInstallations.filter(inst => inst.clientId === "client-002")
  },
];

const mockIssues: ProcessIssue[] = [
  {
    id: "issue-001",
    installationId: "inst-001",
    type: "warning",
    message: "Inverter efficiency below optimal range",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    resolved: false
  },
  {
    id: "issue-002",
    installationId: "inst-002",
    type: "info",
    message: "Scheduled maintenance completed",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    resolved: true
  },
  {
    id: "issue-003",
    installationId: "inst-003",
    type: "error",
    message: "Communication lost with monitoring system",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    resolved: false
  },
];

// Helper function to generate mock power data
const generatePowerData = (installationId: string, granularity: string): PowerData[] => {
  const data: PowerData[] = [];
  const now = new Date();
  
  if (granularity === "5min") {
    // 5-minute data for last 24 hours
    for (let i = 0; i < 288; i++) {
      const timestamp = new Date(now.getTime() - 5 * 60 * 1000 * i);
      const hour = timestamp.getHours();
      
      let power = 0;
      let irradiation = 0;
      
      if (6 <= hour && hour <= 18) {
        power = Math.random() * 40 + 10;
        irradiation = Math.random() * 600 + 200;
      }
      
      data.push({
        timestamp: timestamp.toISOString(),
        power: Math.round(power * 10) / 10,
        irradiation: Math.round(irradiation * 10) / 10
      });
    }
  }
  
  return data.reverse();
};

// Helper function to generate mock energy data
const generateEnergyData = (installationId: string, granularity: string): EnergyData[] => {
  const data: EnergyData[] = [];
  const now = new Date();
  
  if (granularity === "hourly") {
    // Hourly energy data for last 7 days
    for (let i = 0; i < 168; i++) {
      const timestamp = new Date(now.getTime() - 60 * 60 * 1000 * i);
      const hour = timestamp.getHours();
      
      const production = (6 <= hour && hour <= 18) ? Math.random() * 50 : 0;
      const consumption = Math.random() * 25 + 5;
      const exportEnergy = Math.max(0, production - consumption);
      const importEnergy = Math.max(0, consumption - production);
      
      data.push(
        { timestamp: timestamp.toISOString(), energy: Math.round(production * 10) / 10, type: "production" },
        { timestamp: timestamp.toISOString(), energy: Math.round(consumption * 10) / 10, type: "consumption" },
        { timestamp: timestamp.toISOString(), energy: Math.round(exportEnergy * 10) / 10, type: "export" },
        { timestamp: timestamp.toISOString(), energy: Math.round(importEnergy * 10) / 10, type: "import" }
      );
    }
  }
  
  return data.reverse();
};

// Mock API client
export const mockApiClient = {
  async getClients(): Promise<Client[]> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    return mockClients;
  },

  async getInstallations(clientId?: string): Promise<Installation[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (clientId) {
      return mockInstallations.filter(inst => inst.clientId === clientId);
    }
    return mockInstallations;
  },

  async getPowerData(
    installationId: string, 
    granularity: '5min' | 'hourly' | 'daily' | 'monthly' | 'yearly',
    startDate?: string,
    endDate?: string
  ): Promise<PowerData[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return generatePowerData(installationId, granularity);
  },

  async getEnergyData(
    installationId: string,
    granularity: 'hourly' | 'daily' | 'monthly' | 'yearly',
    startDate?: string,
    endDate?: string
  ): Promise<EnergyData[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return generateEnergyData(installationId, granularity);
  },

  async getWeatherData(
    installationId: string,
    startDate?: string,
    endDate?: string
  ): Promise<Array<{
    timestamp: string;
    temperature: number;
    humidity: number;
    windSpeed: number;
    irradiation: number;
  }>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const data = [];
    const now = new Date();
    
    for (let i = 0; i < 24; i++) {
      const timestamp = new Date(now.getTime() - 60 * 60 * 1000 * i);
      data.push({
        timestamp: timestamp.toISOString(),
        temperature: Math.round((Math.random() * 15 + 15) * 10) / 10,
        humidity: Math.round((Math.random() * 40 + 40) * 10) / 10,
        windSpeed: Math.round((Math.random() * 13 + 2) * 10) / 10,
        irradiation: (6 <= timestamp.getHours() && timestamp.getHours() <= 18) 
          ? Math.round((Math.random() * 500 + 100) * 10) / 10 
          : 0
      });
    }
    
    return data.reverse();
  },

  async getInstallationDetail(installationId: string): Promise<InstallationDetail> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const installation = mockInstallations.find(inst => inst.id === installationId);
    
    if (!installation) {
      throw new Error("Installation not found");
    }
    
    return {
      installation,
      currentPower: Math.round((Math.random() * 40 + 10) * 10) / 10,
      autokonsumpcja: Math.round((Math.random() * 80 + 20) * 10) / 10,
      energyImported: Math.round((Math.random() * 25 + 5) * 10) / 10,
      energyExported: Math.round((Math.random() * 70 + 10) * 10) / 10,
      powerHistory: generatePowerData(installationId, "5min"),
      weatherData: []
    };
  },

  async getProcessIssues(installationId?: string): Promise<ProcessIssue[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (installationId) {
      return mockIssues.filter(issue => issue.installationId === installationId);
    }
    return mockIssues;
  },

  async getMonthlyReport(installationId: string, month: number, year: number): Promise<MonthlyReport> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const installation = mockInstallations.find(inst => inst.id === installationId);
    
    if (!installation) {
      throw new Error("Installation not found");
    }
    
    return {
      installationId,
      month: month.toString().padStart(2, '0'),
      year,
      totalProduction: Math.round((Math.random() * 4000 + 1000) * 10) / 10,
      totalConsumption: Math.round((Math.random() * 2200 + 800) * 10) / 10,
      totalExport: Math.round((Math.random() * 1800 + 200) * 10) / 10,
      totalImport: Math.round((Math.random() * 700 + 100) * 10) / 10,
      efficiency: Math.round((Math.random() * 20 + 75) * 10) / 10
    };
  },

  async generatePDFReport(installationId: string, month: number, year: number): Promise<Blob> {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate PDF generation
    return new Blob(['Mock PDF content'], { type: 'application/pdf' });
  }
};
