'use client';

/**
 * Personalization Features Showcase for Landing Page
 * Demonstrates modern personalization & adaptation capabilities
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  Smartphone,
  Zap,
  Bell,
  LayoutDashboard,
  Brain,
  Lock,
  Sliders,
} from 'lucide-react';

interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
}

export function PersonalizationShowcase() {
  const [selectedFeature, setSelectedFeature] = useState<string>('adaptive');

  const features: Record<string, FeatureCard> = {
    adaptive: {
      icon: <Brain className="w-8 h-8 text-purple-500" />,
      title: 'Adaptive Interfaces',
      description: 'Interfaces that learn from your usage patterns and adjust complexity automatically',
      benefits: [
        'Beginner, intermediate, and advanced UI modes',
        'Smart feature discovery based on behavior',
        'Contextual suggestions powered by ML',
        'Graceful complexity scaling',
      ],
    },
    preferences: {
      icon: <Sliders className="w-8 h-8 text-blue-500" />,
      title: 'Preference Systems',
      description: 'Comprehensive customization for layout, theme, and functionality',
      benefits: [
        'Layout: sidebar position, grid types, compact modes',
        'Theme: dark/light/auto with custom colors',
        'Accessibility: fonts, contrast, screen readers',
        'Notification preferences with quiet hours',
      ],
    },
    sync: {
      icon: <Smartphone className="w-8 h-8 text-green-500" />,
      title: 'Cross-Device Sync',
      description: 'Seamless preference synchronization across all your devices with conflict resolution',
      benefits: [
        'Automatic sync across devices',
        'Smart conflict detection and resolution',
        'Timestamp-based version control',
        'Device-specific overrides supported',
      ],
    },
    dashboard: {
      icon: <LayoutDashboard className="w-8 h-8 text-orange-500" />,
      title: 'Customizable Dashboards',
      description: 'Build your perfect dashboard with drag-and-drop widgets and flexible layouts',
      benefits: [
        '8+ widget types available',
        'Drag-and-drop reordering',
        'Flexible grid layouts',
        'Widget-specific customization',
      ],
    },
    notifications: {
      icon: <Bell className="w-8 h-8 text-red-500" />,
      title: 'Smart Notifications',
      description: 'Intelligent notification system that respects your time and priorities',
      benefits: [
        'ML-based priority calculation',
        'Optimal timing based on user patterns',
        'Multi-channel delivery (in-app, email, push)',
        'Quiet hours and Do Not Disturb support',
      ],
    },
    defaults: {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: 'Smart Defaults',
      description: 'System settings that improve over time by learning your preferences',
      benefits: [
        'Auto-save intervals optimized for you',
        'Notification frequency fine-tuned to behavior',
        'Layout suggestions based on patterns',
        '30-day learning period with optimization',
      ],
    },
  };

  const featureKeys = Object.keys(features);

  return (
    <div className="w-full max-w-6xl mx-auto py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold">Modern Personalization & Adaptation</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Experience an AI-powered platform that adapts to you. Every interface, every setting, every
          notification customized for your unique workflow.
        </p>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={selectedFeature} onValueChange={setSelectedFeature} className="w-full">
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full">
          {featureKeys.map(key => (
            <TabsTrigger key={key} value={key} className="text-sm">
              <span className="hidden sm:inline">{features[key].title.split(' ')[0]}</span>
              <span className="sm:hidden">{key.slice(0, 2).toUpperCase()}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Feature Details */}
        {featureKeys.map(key => (
          <TabsContent key={key} value={key} className="space-y-6">
            <Card className="border-2">
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-muted">{features[key].icon}</div>
                    <div>
                      <CardTitle className="text-2xl">{features[key].title}</CardTitle>
                      <CardDescription className="text-base mt-2">
                        {features[key].description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {features[key].benefits.map((benefit, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">✓</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{benefit}</p>
                    </div>
                  ))}
                </div>

                {/* Feature-specific details */}
                <FeatureDetails featureKey={key} />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Feature Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featureKeys.map(key => (
          <Card
            key={key}
            className={`cursor-pointer transition-all ${
              selectedFeature === key ? 'ring-2 ring-primary' : 'hover:border-primary'
            }`}
            onClick={() => setSelectedFeature(key)}
          >
            <CardHeader>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  {features[key].icon}
                  <CardTitle className="text-lg">{features[key].title}</CardTitle>
                </div>
                <Badge variant="secondary">{key.replace(/_/g, ' ').toUpperCase()}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{features[key].description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Implementation Status */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Enterprise-Grade Implementation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Data Privacy</h4>
              <p className="text-sm text-muted-foreground">
                All preferences encrypted and stored securely. Full GDPR compliance.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2">Performance</h4>
              <p className="text-sm text-muted-foreground">
                Intelligent caching and lazy-loading for optimal speed across devices.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2">Scalability</h4>
              <p className="text-sm text-muted-foreground">
                Handles millions of users with distributed sync and conflict resolution.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Feature-specific details component
 */
function FeatureDetails({ featureKey }: { featureKey: string }) {
  const details: Record<string, React.ReactNode> = {
    adaptive: (
      <div className="space-y-4">
        <h4 className="font-semibold">How It Works</h4>
        <div className="space-y-3">
          <div className="flex gap-3">
            <Badge className="h-fit">1</Badge>
            <div>
              <p className="font-medium text-sm">Behavior Tracking</p>
              <p className="text-xs text-muted-foreground">System logs user interactions anonymously</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Badge className="h-fit">2</Badge>
            <div>
              <p className="font-medium text-sm">Pattern Recognition</p>
              <p className="text-xs text-muted-foreground">ML algorithms identify usage patterns</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Badge className="h-fit">3</Badge>
            <div>
              <p className="font-medium text-sm">Auto-Adaptation</p>
              <p className="text-xs text-muted-foreground">Interface adjusts in real-time</p>
            </div>
          </div>
        </div>
      </div>
    ),
    preferences: (
      <div className="space-y-4">
        <h4 className="font-semibold">Customizable Categories</h4>
        <div className="grid sm:grid-cols-2 gap-3">
          {['Layout', 'Theme', 'Notifications', 'Accessibility', 'Behavior'].map(cat => (
            <Badge key={cat} variant="outline">
              {cat}
            </Badge>
          ))}
        </div>
      </div>
    ),
    sync: (
      <div className="space-y-4">
        <h4 className="font-semibold">Conflict Resolution</h4>
        <p className="text-sm text-muted-foreground">
          When changes conflict, the system intelligently resolves them using timestamp comparison,
          user preferences, and 3-way merge strategies.
        </p>
      </div>
    ),
    dashboard: (
      <div className="space-y-4">
        <h4 className="font-semibold">Available Widgets</h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            'Statistics',
            'Recent Items',
            'Quick Actions',
            'Progress Tracker',
            'Calendar',
            'AI Suggestions',
            'Analytics',
            'Collaborators',
          ].map(widget => (
            <Badge key={widget} variant="outline" className="text-xs">
              {widget}
            </Badge>
          ))}
        </div>
      </div>
    ),
    notifications: (
      <div className="space-y-4">
        <h4 className="font-semibold">Delivery Channels</h4>
        <div className="space-y-2">
          {[
            { name: 'In-App', desc: 'Browser notifications and toasts' },
            { name: 'Email', desc: 'Batched and scheduled emails' },
            { name: 'Push', desc: 'Browser push notifications' },
          ].map(channel => (
            <div key={channel.name} className="flex gap-3">
              <Badge className="h-fit">{channel.name}</Badge>
              <p className="text-xs text-muted-foreground">{channel.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
    defaults: (
      <div className="space-y-4">
        <h4 className="font-semibold">Learning Process</h4>
        <div className="space-y-2">
          <p className="text-xs">
            <span className="font-medium">Week 1:</span> System collects baseline behavior
          </p>
          <p className="text-xs">
            <span className="font-medium">Week 2-3:</span> Patterns become visible
          </p>
          <p className="text-xs">
            <span className="font-medium">Week 4:</span> Suggestions and optimizations appear
          </p>
          <p className="text-xs">
            <span className="font-medium">Ongoing:</span> Continuous learning and refinement
          </p>
        </div>
      </div>
    ),
  };

  return <div className="border-t pt-6">{details[featureKey]}</div>;
}
