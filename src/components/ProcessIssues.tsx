'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiClient } from '@/lib/api';
import { ProcessIssue, Installation } from '@/types';
import { AlertTriangle, CheckCircle, Info, XCircle, RefreshCw } from 'lucide-react';

interface ProcessIssuesProps {
  installationId?: string;
}

export default function ProcessIssues({ installationId }: ProcessIssuesProps) {
  const [issues, setIssues] = useState<ProcessIssue[]>([]);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInstallation, setSelectedInstallation] = useState<string | 'all'>('all');

  useEffect(() => {
    loadData();
  }, [installationId, selectedInstallation]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load installations if no specific installation is selected
      if (!installationId) {
        const installationsData = await apiClient.getInstallations();
        setInstallations(installationsData);
      }

      // Load issues
      const issuesData = await apiClient.getProcessIssues(
        selectedInstallation === 'all' ? undefined : selectedInstallation
      );
      setIssues(issuesData);
    } catch (error) {
      console.error('Error loading process issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIssueIcon = (type: ProcessIssue['type']) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getIssueBadgeVariant = (type: ProcessIssue['type']) => {
    switch (type) {
      case 'error':
        return 'destructive' as const;
      case 'warning':
        return 'secondary' as const;
      case 'info':
        return 'outline' as const;
      default:
        return 'outline' as const;
    }
  };

  const getInstallationName = (issueInstallationId: string) => {
    if (installationId) {
      const installation = installations.find(inst => inst.id === issueInstallationId);
      return installation?.name || 'Unknown Installation';
    }
    return 'Current Installation';
  };

  const activeIssues = issues.filter(issue => !issue.resolved);
  const resolvedIssues = issues.filter(issue => issue.resolved);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading process issues...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Process Monitoring</h1>
          <p className="text-muted-foreground">
            Current processes and issues in solar installations
          </p>
        </div>
        <Button onClick={loadData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Installation Filter */}
      {!installationId && installations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Filter by Installation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedInstallation === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedInstallation('all')}
              >
                All Installations
              </Button>
              {installations.map((installation) => (
                <Button
                  key={installation.id}
                  variant={selectedInstallation === installation.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedInstallation(installation.id)}
                >
                  {installation.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{issues.length}</div>
            <p className="text-xs text-muted-foreground">
              All issues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{activeIssues.length}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Issues</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{resolvedIssues.length}</div>
            <p className="text-xs text-muted-foreground">
              Successfully resolved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {issues.length > 0 ? ((activeIssues.filter(i => i.type === 'error').length / issues.length) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Critical errors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Issues List */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Active Issues ({activeIssues.length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved Issues ({resolvedIssues.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All Issues ({issues.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Issues</CardTitle>
              <CardDescription>
                Issues that require immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeIssues.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>No active issues found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeIssues.map((issue) => (
                    <div key={issue.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        {getIssueIcon(issue.type)}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{issue.message}</h4>
                            <Badge variant={getIssueBadgeVariant(issue.type)}>
                              {issue.type}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(issue.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Installation: {getInstallationName(issue.installationId)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resolved Issues</CardTitle>
              <CardDescription>
                Issues that have been successfully resolved
              </CardDescription>
            </CardHeader>
            <CardContent>
              {resolvedIssues.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Info className="h-12 w-12 mx-auto mb-4" />
                  <p>No resolved issues found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {resolvedIssues.map((issue) => (
                    <div key={issue.id} className="flex items-start space-x-4 p-4 border rounded-lg bg-muted/50">
                      <div className="flex-shrink-0 mt-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-muted-foreground line-through">{issue.message}</h4>
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              resolved
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(issue.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Installation: {getInstallationName(issue.installationId)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Issues</CardTitle>
              <CardDescription>
                Complete history of all issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {issues.map((issue) => (
                  <div 
                    key={issue.id} 
                    className={`flex items-start space-x-4 p-4 border rounded-lg ${
                      issue.resolved ? 'bg-muted/50' : ''
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {issue.resolved ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        getIssueIcon(issue.type)
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h4 className={`font-medium ${issue.resolved ? 'text-muted-foreground line-through' : ''}`}>
                            {issue.message}
                          </h4>
                          <Badge variant={issue.resolved ? 'outline' : getIssueBadgeVariant(issue.type)}>
                            {issue.resolved ? 'resolved' : issue.type}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(issue.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Installation: {getInstallationName(issue.installationId)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
