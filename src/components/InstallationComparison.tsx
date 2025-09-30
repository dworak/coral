'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { apiClient } from '@/lib/api';
import { InstallationComparison as InstallationComparisonType, Installation } from '@/types';
import { Zap, TrendingUp, BarChart3 } from 'lucide-react';

interface InstallationComparisonProps {
  clientId?: string;
}

export default function InstallationComparison({ clientId }: InstallationComparisonProps) {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [comparisonData, setComparisonData] = useState<InstallationComparisonType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    loadData();
  }, [clientId, selectedPeriod]);

  const loadData = async () => {
    try {
      setLoading(true);
      const installationsData = await apiClient.getInstallations(clientId);
      setInstallations(installationsData);

      // Load comparison data for each installation
      const comparisonPromises = installationsData.map(async (installation) => {
        const energyData = await apiClient.getEnergyData(
          installation.id,
          selectedPeriod === 'daily' ? 'hourly' : selectedPeriod,
          undefined,
          undefined
        );

        const totalEnergy = energyData
          .filter(d => d.type === 'production')
          .reduce((sum, d) => sum + d.energy, 0);

        const energyYield = installation.installedPower > 0 
          ? totalEnergy / installation.installedPower 
          : 0;

        return {
          installationId: installation.id,
          installationName: installation.name,
          totalPower: installation.installedPower,
          totalEnergy,
          energyYield,
          period: selectedPeriod
        };
      });

      const comparisonResults = await Promise.all(comparisonPromises);
      setComparisonData(comparisonResults);
    } catch (error) {
      console.error('Error loading comparison data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalInstalledPower = installations.reduce((sum, inst) => sum + inst.installedPower, 0);
  const totalEnergy = comparisonData.reduce((sum, data) => sum + data.totalEnergy, 0);
  const averageYield = comparisonData.length > 0 
    ? comparisonData.reduce((sum, data) => sum + data.energyYield, 0) / comparisonData.length 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading comparison data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Installed Power</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInstalledPower.toFixed(1)} kW</div>
            <p className="text-xs text-muted-foreground">
              Across {installations.length} installations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Energy Produced</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnergy.toFixed(1)} kWh</div>
            <p className="text-xs text-muted-foreground">
              In {selectedPeriod} period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Energy Yield</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageYield.toFixed(1)} kWh/kW</div>
            <p className="text-xs text-muted-foreground">
              Per installed kW
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Charts */}
      <Tabs defaultValue="energy" className="space-y-4">
        <TabsList>
          <TabsTrigger value="energy">Energy Production</TabsTrigger>
          <TabsTrigger value="yield">Energy Yield</TabsTrigger>
          <TabsTrigger value="power">Installed Power</TabsTrigger>
        </TabsList>

        <TabsContent value="energy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Energy Production Comparison</CardTitle>
              <CardDescription>
                Total energy produced by each installation in {selectedPeriod} period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="installationName" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(1)} kWh`, 'Energy Produced']}
                  />
                  <Bar dataKey="totalEnergy" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="yield" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Energy Yield Comparison</CardTitle>
              <CardDescription>
                Energy yield per installed kW for each installation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="installationName" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(1)} kWh/kW`, 'Energy Yield']}
                  />
                  <Bar dataKey="energyYield" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="power" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Installed Power Distribution</CardTitle>
              <CardDescription>
                Power capacity of each installation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="installationName" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(1)} kW`, 'Installed Power']}
                  />
                  <Bar dataKey="totalPower" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Installation List */}
      <Card>
        <CardHeader>
          <CardTitle>Installation Details</CardTitle>
          <CardDescription>
            Detailed comparison of all installations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {comparisonData.map((data) => {
              const installation = installations.find(inst => inst.id === data.installationId);
              return (
                <div key={data.installationId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">{data.installationName}</div>
                    <div className="text-sm text-muted-foreground">
                      {installation?.location} • {data.totalPower} kW
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">{data.totalEnergy.toFixed(1)} kWh</div>
                      <div className="text-xs text-muted-foreground">Energy Produced</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{data.energyYield.toFixed(1)} kWh/kW</div>
                      <div className="text-xs text-muted-foreground">Energy Yield</div>
                    </div>
                    <Badge variant={installation?.status === 'active' ? 'default' : 'secondary'}>
                      {installation?.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
