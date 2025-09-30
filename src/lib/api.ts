import { 
  Installation, 
  Client, 
  PowerData, 
  EnergyData, 
  InstallationDetail, 
  ProcessIssue, 
  MonthlyReport,
  ApiConfig 
} from '@/types';
import { mockApiClient } from './mockApi';

const API_CONFIG: ApiConfig = {
  baseUrl: 'http://localhost:8000',
  endpoints: {
    installations: '/api/installations',
    clients: '/api/clients',
    powerData: '/api/power-data',
    energyData: '/api/energy-data',
    weatherData: '/api/weather-data',
    reports: '/api/reports',
    issues: '/api/issues'
  }
};

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.warn('Backend not available, using mock data:', error);
      throw error; // Re-throw to be handled by individual methods
    }
  }

  // Configuration API
  async getClients(): Promise<Client[]> {
    try {
      return await this.request<Client[]>(API_CONFIG.endpoints.clients);
    } catch {
      return mockApiClient.getClients();
    }
  }

  async getInstallations(clientId?: string): Promise<Installation[]> {
    try {
      const endpoint = clientId 
        ? `${API_CONFIG.endpoints.installations}?client_id=${clientId}`
        : API_CONFIG.endpoints.installations;
      return await this.request<Installation[]>(endpoint);
    } catch {
      return mockApiClient.getInstallations(clientId);
    }
  }

  // Data API with different granularity levels
  async getPowerData(
    installationId: string, 
    granularity: '5min' | 'hourly' | 'daily' | 'monthly' | 'yearly',
    startDate?: string,
    endDate?: string
  ): Promise<PowerData[]> {
    try {
      const params = new URLSearchParams({
        installation_id: installationId,
        granularity,
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate }),
      });
      
      return await this.request<PowerData[]>(`${API_CONFIG.endpoints.powerData}?${params}`);
    } catch {
      return mockApiClient.getPowerData(installationId, granularity, startDate, endDate);
    }
  }

  async getEnergyData(
    installationId: string,
    granularity: 'hourly' | 'daily' | 'monthly' | 'yearly',
    startDate?: string,
    endDate?: string
  ): Promise<EnergyData[]> {
    try {
      const params = new URLSearchParams({
        installation_id: installationId,
        granularity,
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate }),
      });
      
      return await this.request<EnergyData[]>(`${API_CONFIG.endpoints.energyData}?${params}`);
    } catch {
      return mockApiClient.getEnergyData(installationId, granularity, startDate, endDate);
    }
  }

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
    try {
      const params = new URLSearchParams({
        installation_id: installationId,
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate }),
      });
      
      return await this.request<Array<{
        timestamp: string;
        temperature: number;
        humidity: number;
        windSpeed: number;
        irradiation: number;
      }>>(`${API_CONFIG.endpoints.weatherData}?${params}`);
    } catch {
      return mockApiClient.getWeatherData(installationId, startDate, endDate);
    }
  }

  // Installation details
  async getInstallationDetail(installationId: string): Promise<InstallationDetail> {
    try {
      return await this.request<InstallationDetail>(`${API_CONFIG.endpoints.installations}/${installationId}/detail`);
    } catch {
      return mockApiClient.getInstallationDetail(installationId);
    }
  }

  // Issues and processes
  async getProcessIssues(installationId?: string): Promise<ProcessIssue[]> {
    try {
      const endpoint = installationId 
        ? `${API_CONFIG.endpoints.issues}?installation_id=${installationId}`
        : API_CONFIG.endpoints.issues;
      return await this.request<ProcessIssue[]>(endpoint);
    } catch {
      return mockApiClient.getProcessIssues(installationId);
    }
  }

  // Reports
  async getMonthlyReport(installationId: string, month: number, year: number): Promise<MonthlyReport> {
    try {
      return await this.request<MonthlyReport>(
        `${API_CONFIG.endpoints.reports}/monthly?installation_id=${installationId}&month=${month}&year=${year}`
      );
    } catch {
      return mockApiClient.getMonthlyReport(installationId, month, year);
    }
  }

  async generatePDFReport(installationId: string, month: number, year: number): Promise<Blob> {
    try {
      const response = await fetch(
        `${this.baseUrl}${API_CONFIG.endpoints.reports}/pdf?installation_id=${installationId}&month=${month}&year=${year}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate PDF report');
      }

      return response.blob();
    } catch {
      return mockApiClient.generatePDFReport(installationId, month, year);
    }
  }
}

export const apiClient = new ApiClient();
export { API_CONFIG };
