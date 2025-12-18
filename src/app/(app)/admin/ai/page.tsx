/**
 * Admin AI Pipeline Dashboard
 * Phase 5: Real-time Monitoring & Analytics
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import HealthGrid from '@/components/admin/ai-pipeline-health-grid';
import RequestTrace from '@/components/admin/ai-pipeline-request-trace';
import ProviderRouting from '@/components/admin/ai-pipeline-provider-routing';
import PerformanceReport from '@/components/admin/ai-performance-report';
import { AIPipelineEvent } from '@/lib/ai/monitoring/event-schema';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminAIDashboard() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-serif">AI Pipeline Monitoring Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time monitoring of ThesisAI Phase 5 components
        </p>
      </div>

      {/* Dynamic Performance Report */}
      <PerformanceReport className="mb-6" />

      {/* Performance Trends Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { time: '10:00', cache: 85, semantic: 220, suggestions: 120 },
                { time: '10:05', cache: 88, semantic: 180, suggestions: 95 },
                { time: '10:10', cache: 82, semantic: 250, suggestions: 140 },
                { time: '10:15', cache: 90, semantic: 160, suggestions: 85 },
                { time: '10:20', cache: 78, semantic: 300, suggestions: 160 },
                { time: '10:25', cache: 85, semantic: 200, suggestions: 100 },
                { time: '10:30', cache: 87, semantic: 180, suggestions: 90 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cache" name="Cache (ms)" fill="hsl(267, 75%, 47%)" /> {/* Electric purple */}
                <Bar dataKey="semantic" name="Semantic (ms)" fill="hsl(186, 74%, 61%)" /> {/* Cyan */}
                <Bar dataKey="suggestions" name="Suggestions (ms)" fill="hsl(22, 100%, 52%)" /> {/* Orange */}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Tabs */}
      <Tabs defaultValue="health" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="health">Health Grid</TabsTrigger>
          <TabsTrigger value="traces">Request Traces</TabsTrigger>
          <TabsTrigger value="providers">Provider Routing</TabsTrigger>
          <TabsTrigger value="alerts">Anomaly Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="mt-4">
          <HealthGrid />
        </TabsContent>

        <TabsContent value="traces" className="mt-4">
          <RequestTrace />
        </TabsContent>

        <TabsContent value="providers" className="mt-4">
          <ProviderRouting />
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Anomaly Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 rounded">
                  <div>
                    <h3 className="font-semibold">High Error Rate Detected</h3>
                    <p className="text-sm text-muted-foreground">Cache module showing 5% error rate (threshold: 2%)</p>
                  </div>
                  <Badge variant="destructive">CRITICAL</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-warning/10 border border-warning/20 rounded">
                  <div>
                    <h3 className="font-semibold">Cache Efficiency Optimized</h3>
                    <p className="text-sm text-muted-foreground">Auto-optimization increased hit rate to 93.9%</p>
                  </div>
                  <Badge variant="default" className="bg-success text-success-foreground">RESOLVED</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-info/10 border border-info/20 rounded">
                  <div>
                    <h3 className="font-semibold">High Load Detected</h3>
                    <p className="text-sm text-muted-foreground">300% increase in requests over last 5 minutes</p>
                  </div>
                  <Badge variant="default" className="bg-info text-info-foreground">INFO</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}