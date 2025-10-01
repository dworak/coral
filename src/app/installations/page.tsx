'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/lib/api';
import { Installation, Client } from '@/types';
import { Zap, MapPin, Calendar, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function InstallationsPage() {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [selectedClient]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [installationsData, clientsData] = await Promise.all([
        apiClient.getInstallations(selectedClient === 'all' ? undefined : selectedClient),
        apiClient.getClients()
      ]);

      setInstallations(installationsData);
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading installations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Unknown Client';
  };

  const getStatusColor = (status: Installation['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading installations...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Solar Installations</h1>
          <p className="text-muted-foreground">
            Manage and monitor all solar installations
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Installations</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{installations.length}</div>
            <p className="text-xs text-muted-foreground">
              {installations.filter(i => i.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Power</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {installations.reduce((sum, inst) => sum + inst.installedPower, 0).toFixed(1)} kW
            </div>
            <p className="text-xs text-muted-foreground">
              Installed capacity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Zap className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {installations.filter(i => i.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Operating normally
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues</CardTitle>
            <Zap className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {installations.filter(i => i.status === 'error' || i.status === 'maintenance').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Installations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {installations.map((installation) => (
          <Card key={installation.id} className="hover:shadow-lg transition-shadow flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{installation.name}</CardTitle>
                <Badge className={getStatusColor(installation.status)}>
                  {installation.status}
                </Badge>
              </div>
              <CardDescription className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {installation.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Installed Power</div>
                  <div className="text-lg font-semibold">{installation.installedPower} kW</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Client</div>
                  <div className="text-lg font-semibold">{getClientName(installation.clientId)}</div>
                </div>
              </div>
              
              <div className="space-y-2 flex-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Power:</span>
                  <span className="font-medium">15.2 kW</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Today&apos;s Production:</span>
                  <span className="font-medium">245 kWh</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Update:</span>
                  <span className="font-medium">
                    {new Date(installation.lastUpdate).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t mt-auto">
                <div className="flex space-x-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link href={`/installations/${installation.id}`}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Reports
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {installations.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center text-muted-foreground">
              <Zap className="h-12 w-12 mx-auto mb-4" />
              <p>No installations found</p>
              <p className="text-sm">Try adjusting your filters or add a new installation</p>
            </div>
          </CardContent>
        </Card>
      )}
        </div>
      </div>
    </div>
  );
}
