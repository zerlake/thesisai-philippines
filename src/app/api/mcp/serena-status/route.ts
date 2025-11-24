/**
 * Serena MCP Server Status Endpoint
 * GET /api/mcp/serena-status
 * Returns current connection status of Serena MCP Server
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check if Serena URL is configured
    const serenaUrl = process.env.SERENA_URL || process.env.NEXT_PUBLIC_SERENA_URL;
    
    if (!serenaUrl) {
      return NextResponse.json({
        status: 'disconnected',
        server: 'Serena MCP Server',
        model: 'claude-3-sonnet',
        lastChecked: new Date().toISOString(),
        error: 'Serena URL not configured'
      }, { status: 200 });
    }

    // Try to check Serena server health via dashboard API
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      // Try the dashboard endpoint first
      const response = await fetch(`${serenaUrl}/api/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' }
      });

      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          status: 'connected',
          server: 'Serena MCP Server',
          model: data.model || 'Puter AI',
          lastChecked: new Date().toISOString(),
          error: null
        });
      } else if (response.status === 404) {
        // If /api/health doesn't exist, check if dashboard is accessible
        const dashboardCheck = await fetch(`${serenaUrl}/dashboard/index.html`, {
          method: 'HEAD',
          signal: controller.signal
        });
        
        if (dashboardCheck.ok) {
          return NextResponse.json({
            status: 'connected',
            server: 'Serena MCP Server',
            model: 'Puter AI',
            lastChecked: new Date().toISOString(),
            error: null
          });
        }
      }
    } catch (error) {
      // Server is not responding
      console.error('Serena health check failed:', error);
    }

    return NextResponse.json({
      status: 'disconnected',
      server: 'Serena MCP Server',
      model: 'Puter AI',
      lastChecked: new Date().toISOString(),
      error: 'Unable to connect to Serena server'
    }, { status: 200 });

  } catch (error) {
    console.error('Error checking Serena status:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error',
      status: 'disconnected'
    }, { status: 500 });
  }
}
