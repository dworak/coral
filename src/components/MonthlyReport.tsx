'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { apiClient } from '@/lib/api';
import { MonthlyReport, Installation, Client } from '@/types';
import { Download, Mail, FileText, Calendar, TrendingUp, Zap, Upload, Download as DownloadIcon } from 'lucide-react';

interface MonthlyReportProps {
  installationId?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function MonthlyReport({ installationId }: MonthlyReportProps) {
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInstallation, setSelectedInstallation] = useState<string>(installationId || 'all');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedInstallation, selectedMonth, selectedYear]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load clients and installations
      const clientsData = await apiClient.getClients();
      setClients(clientsData);
      
      const installationsData = await apiClient.getInstallations();
      setInstallations(installationsData);

      // Load monthly report for selected installation
      if (selectedInstallation && selectedInstallation !== 'all') {
        const report = await apiClient.getMonthlyReport(selectedInstallation, selectedMonth, selectedYear);
        setReports([report]);
      } else {
        // Load reports for all installations
        const reportPromises = installationsData.map(installation =>
          apiClient.getMonthlyReport(installation.id, selectedMonth, selectedYear)
        );
        const allReports = await Promise.all(reportPromises);
        setReports(allReports);
      }
    } catch (error) {
      console.error('Error loading monthly reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!selectedInstallation || selectedInstallation === 'all') return;
    
    try {
      setGeneratingPDF(true);
      const blob = await apiClient.generatePDFReport(selectedInstallation, selectedMonth, selectedYear);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `monthly-report-${selectedInstallation}-${selectedYear}-${selectedMonth.toString().padStart(2, '0')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setGeneratingPDF(false);
    }
  };

  const sendEmailReport = async () => {
    if (!selectedInstallation || selectedInstallation === 'all') return;
    
    try {
      // This would typically call an API endpoint to send the report via email
      console.log('Sending email report...');
      // await apiClient.sendEmailReport(selectedInstallation, selectedMonth, selectedYear);
    } catch (error) {
      console.error('Error sending email report:', error);
    }
  };

  const getInstallationName = (installationId: string) => {
    const installation = installations.find(inst => inst.id === installationId);
    return installation?.name || 'Unknown Installation';
  };

  const getClientName = (installationId: string) => {
    const installation = installations.find(inst => inst.id === installationId);
    const client = clients.find(client => client.id === installation?.clientId);
    return client?.name || 'Unknown Client';
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading monthly reports...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monthly Reports</h1>
          <p className="text-muted-foreground">
            Production, export, and consumption analysis
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={generatePDF} disabled={!selectedInstallation || selectedInstallation === 'all' || generatingPDF}>
            <Download className="h-4 w-4 mr-2" />
            {generatingPDF ? 'Generating...' : 'Download PDF'}
          </Button>
          <Button onClick={sendEmailReport} variant="outline" disabled={!selectedInstallation || selectedInstallation === 'all'}>
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Installation</label>
              <Select value={selectedInstallation} onValueChange={setSelectedInstallation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select installation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Installations</SelectItem>
                  {installations.map((installation) => (
                    <SelectItem key={installation.id} value={installation.id}>
                      {installation.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Month</label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={index + 1} value={(index + 1).toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Year</label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={loadData} className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports */}
      {reports.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4" />
              <p>No reports available for the selected period</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            {reports.map((report) => (
              <Card key={report.installationId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{getInstallationName(report.installationId)}</CardTitle>
                      <CardDescription>
                        {getClientName(report.installationId)} • {months[report.month - 1]} {report.year}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      {report.efficiency.toFixed(1)}% Efficiency
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{report.totalProduction.toFixed(1)}</div>
                      <div className="text-sm text-muted-foreground">Production (kWh)</div>
                      <Zap className="h-4 w-4 mx-auto mt-2 text-green-600" />
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{report.totalConsumption.toFixed(1)}</div>
                      <div className="text-sm text-muted-foreground">Consumption (kWh)</div>
                      <DownloadIcon className="h-4 w-4 mx-auto mt-2 text-blue-600" />
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{report.totalExport.toFixed(1)}</div>
                      <div className="text-sm text-muted-foreground">Export (kWh)</div>
                      <Upload className="h-4 w-4 mx-auto mt-2 text-orange-600" />
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{report.totalImport.toFixed(1)}</div>
                      <div className="text-sm text-muted-foreground">Import (kWh)</div>
                      <DownloadIcon className="h-4 w-4 mx-auto mt-2 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="charts" className="space-y-4">
            {reports.map((report) => (
              <div key={report.installationId} className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Energy Distribution - {getInstallationName(report.installationId)}</CardTitle>
                    <CardDescription>
                      Breakdown of energy production, consumption, export, and import
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-lg font-medium mb-4">Energy Flow</h4>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={[
                            { name: 'Production', value: report.totalProduction, color: '#00C49F' },
                            { name: 'Consumption', value: report.totalConsumption, color: '#0088FE' },
                            { name: 'Export', value: report.totalExport, color: '#FFBB28' },
                            { name: 'Import', value: report.totalImport, color: '#FF8042' }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value: number) => [`${value.toFixed(1)} kWh`, 'Energy']} />
                            <Bar dataKey="value" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium mb-4">Energy Distribution</h4>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Production', value: report.totalProduction, color: '#00C49F' },
                                { name: 'Consumption', value: report.totalConsumption, color: '#0088FE' },
                                { name: 'Export', value: report.totalExport, color: '#FFBB28' },
                                { name: 'Import', value: report.totalImport, color: '#FF8042' }
                              ]}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {[
                                { name: 'Production', value: report.totalProduction, color: '#00C49F' },
                                { name: 'Consumption', value: report.totalConsumption, color: '#0088FE' },
                                { name: 'Export', value: report.totalExport, color: '#FFBB28' },
                                { name: 'Import', value: report.totalImport, color: '#FF8042' }
                              ].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => [`${value.toFixed(1)} kWh`, 'Energy']} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Installation Comparison</CardTitle>
                <CardDescription>
                  Compare performance across all installations for {months[selectedMonth - 1]} {selectedYear}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={reports}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="installationId" 
                      tickFormatter={(value) => getInstallationName(value)}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        `${value.toFixed(1)} kWh`, 
                        name === 'totalProduction' ? 'Production' :
                        name === 'totalConsumption' ? 'Consumption' :
                        name === 'totalExport' ? 'Export' : 'Import'
                      ]}
                    />
                    <Bar dataKey="totalProduction" stackId="a" fill="#00C49F" name="totalProduction" />
                    <Bar dataKey="totalConsumption" stackId="a" fill="#0088FE" name="totalConsumption" />
                    <Bar dataKey="totalExport" stackId="b" fill="#FFBB28" name="totalExport" />
                    <Bar dataKey="totalImport" stackId="b" fill="#FF8042" name="totalImport" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
