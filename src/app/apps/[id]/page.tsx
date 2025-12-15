// src/app/apps/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { getAppById, getAppDefaultValues } from '@/lib/app-registry';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Play, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function AppDetailPage({ params }: { params: { id: string } }) {
  const [app, setApp] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [result, setResult] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchedApp = getAppById(params.id);
    if (fetchedApp) {
      setApp(fetchedApp);

      // Initialize form data with default values
      const defaults = getAppDefaultValues(fetchedApp);
      setFormData(defaults);
    }
  }, [params.id]);

  if (!app) {
    return (
      <div className="container py-8">
        <p>App not found</p>
        <Link href="/apps">Back to apps</Link>
      </div>
    );
  }

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const renderInputField = (fieldName: string, fieldSchema: z.ZodTypeAny) => {
    const fieldDef = (fieldSchema as any)._def;
    const currentValue = formData[fieldName];

    if (fieldDef.typeName === 'ZodString') {
      // Check if this is an enum type
      if (fieldDef.innerType && fieldDef.innerType._def && fieldDef.innerType._def.typeName === 'ZodEnum') {
        const values = fieldDef.innerType._def.values;
        return (
          <Select
            value={currentValue || ''}
            onValueChange={(value) => handleInputChange(fieldName, value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Select ${fieldName}`} />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(values).map((value) => (
                <SelectItem key={value} value={value}>
                  {values[value as any]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      } else {
        // Regular text input or textarea based on description
        const description = (fieldSchema as any).description || '';
        if (description && (description.toLowerCase().includes('text') || description.toLowerCase().includes('content'))) {
          return (
            <Textarea
              value={currentValue || ''}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              placeholder={`Enter ${fieldName}`}
            />
          );
        } else {
          return (
            <Input
              type="text"
              value={currentValue || ''}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              placeholder={`Enter ${fieldName}`}
            />
          );
        }
      }
    } else if (fieldDef.typeName === 'ZodNumber') {
      return (
        <Input
          type="number"
          value={currentValue || 0}
          onChange={(e) => handleInputChange(fieldName, Number(e.target.value))}
          placeholder={`Enter ${fieldName}`}
        />
      );
    } else if (fieldDef.typeName === 'ZodBoolean') {
      return (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={fieldName}
            checked={currentValue || false}
            onChange={(e) => handleInputChange(fieldName, e.target.checked)}
          />
          <label htmlFor={fieldName}>Enable {fieldName}</label>
        </div>
      );
    } else if (fieldDef.typeName === 'ZodArray') {
      return (
        <Textarea
          value={Array.isArray(currentValue) ? currentValue.join('\n') : ''}
          onChange={(e) => handleInputChange(fieldName, e.target.value.split('\n'))}
          placeholder={`Enter ${fieldName} (one per line)`}
        />
      );
    } else {
      return (
        <Input
          type="text"
          value={currentValue || ''}
          onChange={(e) => handleInputChange(fieldName, e.target.value)}
          placeholder={`Enter ${fieldName}`}
        />
      );
    }
  };

  const handleSubmit = async () => {
    try {
      setIsRunning(true);
      setError(null);
      
      // Validate inputs against schema
      const result = app.inputSchema.safeParse(formData);
      if (!result.success) {
        throw new Error(result.error.errors[0].message);
      }
      
      // Run the app
      const output = await app.handler(formData);
      setResult(output);
    } catch (err) {
      console.error('Error running app:', err);
      setError((err as Error).message || 'An error occurred while running the app');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="text-3xl">{app.icon}</div>
          <div>
            <h1 className="text-3xl font-bold">{app.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="capitalize">
                {app.category}
              </Badge>
            </div>
          </div>
        </div>
        <p className="text-slate-400">{app.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>App Configuration</CardTitle>
              <CardDescription>
                Configure the inputs for this app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries((app.inputSchema as z.ZodObject<any>).shape).map(([name, schema]) => (
                  <div key={name}>
                    <label className="block text-sm font-medium mb-1 capitalize">
                      {name.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    {renderInputField(name, schema as z.ZodTypeAny)}
                    <p className="text-xs text-slate-500 mt-1">
                      {(schema as z.ZodTypeAny).description || 'No description'}
                    </p>
                  </div>
                ))}
                
                {error && (
                  <div className="p-3 bg-red-900/30 border border-red-700 rounded text-red-300 text-sm">
                    Error: {error}
                  </div>
                )}
                
                <Button 
                  className="w-full gap-2 mt-4" 
                  onClick={handleSubmit}
                  disabled={isRunning}
                >
                  {isRunning ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Run App
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>App Result</CardTitle>
              <CardDescription>
                Output from the app execution
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-900/50 rounded text-sm">
                    <p className="text-xs text-slate-500 mb-2">Results:</p>
                    <pre className="whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                  <Button className="w-full" variant="outline">
                    Save Result
                  </Button>
                  <Button className="w-full" variant="outline">
                    Add to Workflow
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <p>Run the app to see results here</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>About This App</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-slate-400">Category</h4>
                  <p className="capitalize">{app.category}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-slate-400">Input Schema</h4>
                  <pre className="text-xs bg-slate-900/50 p-2 rounded overflow-x-auto">
                    {JSON.stringify(
                      Object.keys((app.inputSchema as z.ZodObject<any>).shape), 
                      null, 
                      2
                    )}
                  </pre>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-slate-400">Output Schema</h4>
                  <pre className="text-xs bg-slate-900/50 p-2 rounded overflow-x-auto">
                    {JSON.stringify(
                      Object.keys((app.outputSchema as z.ZodObject<any>).shape), 
                      null, 
                      2
                    )}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}