'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar } from 'recharts';
import { apiClient } from '@/lib/api';
import { InstallationDetail as InstallationDetailType, PowerData, WeatherData } from '@/types';
import { Zap, Sun, Download, Upload, Activity, Thermometer, Wind } from 'lucide-react';

interface InstallationDetailProps {
  installationId: string;
}

export default function InstallationDetail({ installationId }: InstallationDetailProps) {
  const [detail, setDetail] = useState<InstallationDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    loadDetail();
  }, [installationId, selectedTimeRange]);

  const loadDetail = async () => {
    try {
      setLoading(true);
      const detailData = await apiClient.getInstallationDetail(installationId);
      setDetail(detailData);
    } catch (error) {
      console.error('Error loading installation detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeRangeHours = (range: string) => {
    switch (range) {
      case '1h': return 1;
      case '24h': return 24;
      case '7d': return 24 * 7;
      case '30d': return 24 * 30;
      default: return 24;
    }
  };

  const getGranularity = (range: string) => {
    switch (range) {
      case '1h': return '5min' as const;
      case '24h': return '5min' as const;
      case '7d': return 'hourly' as const;
      case '30d': return 'hourly' as const;
      default: return '5min' as const;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading installation details...</div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Installation not found</div>
      </div>
    );
  }

  const { installation, currentPower, autokonsumpcja, energyImported, energyExported, powerHistory, weatherData } = detail;
  
  // Debug: log the data to see if it's being loaded
  console.log('Installation Detail Data:', {
    installation,
    powerHistory: powerHistory?.length || 0,
    weatherData: weatherData?.length || 0
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{installation.name}</h1>
          <p className="text-muted-foreground">{installation.location} • {installation.installedPower} kW</p>
        </div>
        <Badge variant={installation.status === 'active' ? 'default' : 'secondary'}>
          {installation.status}
        </Badge>
      </div>

      {/* Current Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Power</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentPower.toFixed(1)} kW</div>
            <p className="text-xs text-muted-foreground">
              {((currentPower / installation.installedPower) * 100).toFixed(1)}% of capacity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Self-Consumption</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{autokonsumpcja.toFixed(1)} kWh</div>
            <p className="text-xs text-muted-foreground">
              Energy consumed on-site
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Energy Imported</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{energyImported.toFixed(1)} kWh</div>
            <p className="text-xs text-muted-foreground">
              From grid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Energy Exported</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{energyExported.toFixed(1)} kWh</div>
            <p className="text-xs text-muted-foreground">
              To grid
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="power" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="power">Power vs Weather</TabsTrigger>
            <TabsTrigger value="energy">Energy Flow</TabsTrigger>
            <TabsTrigger value="weather">Weather Data</TabsTrigger>
          </TabsList>
          
          <div className="flex space-x-2">
            {(['1h', '24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={`px-3 py-1 text-sm rounded-md ${
                  selectedTimeRange === range
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <TabsContent value="power" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Power Generation vs Solar Irradiation</CardTitle>
              <CardDescription>
                Power output compared to weather station data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {powerHistory && powerHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={powerHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                    />
                    <YAxis yAxisId="power" orientation="left" />
                    <YAxis yAxisId="irradiation" orientation="right" />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        `${value.toFixed(1)} ${name === 'power' ? 'kW' : 'W/m²'}`,
                        name === 'power' ? 'Power' : 'Irradiation'
                      ]}
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                    />
                    <Bar yAxisId="irradiation" dataKey="irradiation" fill="#ffc658" name="irradiation" />
                    <Line yAxisId="power" type="monotone" dataKey="power" stroke="#8884d8" strokeWidth={2} name="power" />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center">
                    <Activity className="h-12 w-12 mx-auto mb-4" />
                    <p>No power data available</p>
                    <p className="text-sm">Data will appear when the installation is active</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="energy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Energy Flow</CardTitle>
              <CardDescription>
                Self-consumption, import, and export over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{autokonsumpcja.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Self-Consumption (kWh)</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{energyImported.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Imported (kWh)</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{energyExported.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Exported (kWh)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weather" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weather Station Data</CardTitle>
              <CardDescription>
                Environmental conditions affecting solar production
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weatherData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis yAxisId="temp" orientation="left" />
                  <YAxis yAxisId="irradiation" orientation="right" />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `${value.toFixed(1)} ${name === 'temperature' ? '°C' : name === 'irradiation' ? 'W/m²' : '%'}`,
                      name === 'temperature' ? 'Temperature' : name === 'irradiation' ? 'Irradiation' : 'Humidity'
                    ]}
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                  />
                  <Line yAxisId="temp" type="monotone" dataKey="temperature" stroke="#ff7300" strokeWidth={2} name="temperature" />
                  <Line yAxisId="irradiation" type="monotone" dataKey="irradiation" stroke="#8884d8" strokeWidth={2} name="irradiation" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Weather Summary */}
      {weatherData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Weather Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Thermometer className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Temperature</div>
                  <div className="text-lg">{weatherData[weatherData.length - 1]?.temperature?.toFixed(1)}°C</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Irradiation</div>
                  <div className="text-lg">{weatherData[weatherData.length - 1]?.irradiation?.toFixed(0)} W/m²</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Humidity</div>
                  <div className="text-lg">{weatherData[weatherData.length - 1]?.humidity?.toFixed(0)}%</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Wind className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Wind Speed</div>
                  <div className="text-lg">{weatherData[weatherData.length - 1]?.windSpeed?.toFixed(1)} m/s</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
