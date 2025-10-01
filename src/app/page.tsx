'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { apiClient } from '@/lib/api';
import { Installation, Client, ProcessIssue } from '@/types';
import { Zap, TrendingUp, AlertTriangle, Users, Activity, Sun } from 'lucide-react';
import ActivePowerClock from '@/components/ActivePowerClock';
import WeatherCard from '@/components/WeatherCard';

export default function Dashboard() {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [issues, setIssues] = useState<ProcessIssue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [installationsData, clientsData, issuesData] = await Promise.all([
        apiClient.getInstallations(),
        apiClient.getClients(),
        apiClient.getProcessIssues()
      ]);

      setInstallations(installationsData);
      setClients(clientsData);
      setIssues(issuesData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeInstallations = installations.filter(inst => inst.status === 'active');
  const totalInstalledPower = installations.reduce((sum, inst) => sum + inst.installedPower, 0);
  const activeIssues = issues.filter(issue => !issue.resolved);
  const criticalIssues = activeIssues.filter(issue => issue.type === 'error');

  // Mock data for charts
  const powerTrendData = [
    { time: '00:00', power: 0, optimal: 0 },
    { time: '04:00', power: 0, optimal: 0 },
    { time: '06:00', power: 2.1, optimal: 5.2 },
    { time: '08:00', power: 15.2, optimal: 18.5 },
    { time: '10:00', power: 28.7, optimal: 32.1 },
    { time: '12:00', power: 45.8, optimal: 48.2 },
    { time: '14:00', power: 42.3, optimal: 45.8 },
    { time: '16:00', power: 38.4, optimal: 35.2 },
    { time: '18:00', power: 18.7, optimal: 22.1 },
    { time: '20:00', power: 8.2, optimal: 12.5 },
    { time: '22:00', power: 1.5, optimal: 3.2 },
    { time: '24:00', power: 0, optimal: 0 },
  ];

  const monthlyProductionData = [
    { month: 'Jan', production: 1200, consumption: 800 },
    { month: 'Feb', production: 1350, consumption: 750 },
    { month: 'Mar', production: 1580, consumption: 920 },
    { month: 'Apr', production: 1820, consumption: 880 },
    { month: 'May', production: 2100, consumption: 950 },
    { month: 'Jun', production: 2250, consumption: 1100 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Solar Monitoring Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of all solar installations and system status
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Installations</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{installations.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeInstallations.length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Power</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInstalledPower.toFixed(1)} kW</div>
            <p className="text-xs text-muted-foreground">
              Installed capacity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{activeIssues.length}</div>
            <p className="text-xs text-muted-foreground">
              {criticalIssues.length} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">
              Total clients
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Details */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="installations">Installations</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Second Row - Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily Power Trend</CardTitle>
                <CardDescription>
                  Actual vs optimal power generation throughout the day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={powerTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        `${value} kW`, 
                        name === 'power' ? 'Actual Power' : name === 'optimal' ? 'Optimal Power' : name
                      ]} 
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="power" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Actual Power"
                      dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="optimal" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Optimal Power"
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Production vs Consumption</CardTitle>
                <CardDescription>
                  Energy production and consumption trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyProductionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`${value} kWh`, 'Energy']} />
                    <Bar dataKey="production" fill="#00C49F" name="Production" />
                    <Bar dataKey="consumption" fill="#0088FE" name="Consumption" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          {/* First Row - Clock and Weather Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ActivePowerClock />
            <WeatherCard />
          </div>
        </TabsContent>

        <TabsContent value="production" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Production Summary</CardTitle>
              <CardDescription>
                Current production status across all installations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">2,450 kWh</div>
                  <div className="text-sm text-muted-foreground">Today&apos;s Production</div>
                  <Sun className="h-4 w-4 mx-auto mt-2 text-green-600" />
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">1,820 kWh</div>
                  <div className="text-sm text-muted-foreground">Today&apos;s Consumption</div>
                  <Activity className="h-4 w-4 mx-auto mt-2 text-blue-600" />
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">630 kWh</div>
                  <div className="text-sm text-muted-foreground">Exported to Grid</div>
                  <TrendingUp className="h-4 w-4 mx-auto mt-2 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="installations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Installation Status</CardTitle>
              <CardDescription>
                Current status of all solar installations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {installations.map((installation) => (
                  <div key={installation.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{installation.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {installation.location} • {installation.installedPower} kW
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">15.2 kW</div>
                        <div className="text-xs text-muted-foreground">Current Power</div>
                      </div>
                      <Badge variant={installation.status === 'active' ? 'default' : 'secondary'}>
                        {installation.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Issues</CardTitle>
              <CardDescription>
                Latest issues and alerts from all installations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeIssues.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>No active issues</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeIssues.slice(0, 5).map((issue) => (
                    <div key={issue.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        {issue.type === 'error' ? (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        ) : (
                          <Activity className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{issue.message}</h4>
                          <Badge variant={issue.type === 'error' ? 'destructive' : 'secondary'}>
                            {issue.type}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(issue.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
        </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </div>
      </div>
    </div>
  );
}