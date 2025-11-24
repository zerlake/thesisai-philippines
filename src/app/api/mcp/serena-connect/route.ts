/**
 * Serena MCP Server Connect Endpoint
 * POST /api/mcp/serena-connect
 * Establishes connection to Serena MCP Server
 */

import { NextRequest, NextResponse } from 'next/server';

interface ConnectRequest {
  action: 'connect' | 'disconnect';
}

export async function POST(request: NextRequest) {
  try {
    const body: ConnectRequest = await request.json();

    if (body.action === 'disconnect') {
      return NextResponse.json({
        success: true,
        status: 'disconnected',
        message: 'Disconnected from Serena MCP Server'
      });
    }

    // Check if Serena URL is configured
    const serenaUrl = process.env.SERENA_URL || process.env.NEXT_PUBLIC_SERENA_URL;
    
    if (!serenaUrl) {
      return NextResponse.json({
        success: false,
        error: 'Serena URL not configured in environment variables'
      }, { status: 400 });
    }

    // Try to establish connection to Serena dashboard
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      // Check if Serena dashboard is accessible
      const dashboardResponse = await fetch(`${serenaUrl}/dashboard/index.html`, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Content-Type': 'text/html' }
      });

      clearTimeout(timeout);

      if (dashboardResponse.ok) {
        return NextResponse.json({
          success: true,
          status: 'connected',
          server: 'Serena MCP Server',
          model: 'Puter AI',
          dashboardUrl: `${serenaUrl}/dashboard/index.html`,
          message: 'Connected to Serena MCP Server with Puter AI'
        });
      } else {
        return NextResponse.json({
          success: false,
          error: `Dashboard returned HTTP ${dashboardResponse.status}`
        }, { status: dashboardResponse.status });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      console.error('Serena connection error:', errorMessage);
      
      // If timeout or connection refused, provide helpful message
      if (errorMessage.includes('abort') || errorMessage.includes('ECONNREFUSED')) {
        return NextResponse.json({
          success: false,
          error: `Cannot reach Serena server at ${serenaUrl}. Ensure Serena is running at http://127.0.0.1:24282`
        }, { status: 503 });
      }

      return NextResponse.json({
        success: false,
        error: errorMessage
      }, { status: 503 });
    }

  } catch (error) {
    console.error('Error processing connect request:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
