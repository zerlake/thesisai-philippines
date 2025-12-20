// src/app/api/learning/progress/route.ts

import { createServerClient } from '@/lib/supabase-server';
import { withAuth } from '@/lib/jwt-validator';
import { logAuditEvent, AuditAction, AuditSeverity } from '@/lib/audit-logger';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate request
    const auth = await withAuth(request);
    if (!auth) {
      await logAuditEvent(AuditAction.AUTH_FAILED, {
        severity: AuditSeverity.WARNING,
        resourceType: 'learning_progress',
        resourceId: 'unknown',
        ipAddress: request.ip,
        details: { endpoint: 'GET /api/learning/progress', reason: 'Missing auth token' },
      });
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const userId = auth.userId;

    // 2. Initialize Supabase client
    const supabase = await createServerClient();

    // 3. In a real implementation, this would query actual progress data
    // For now, we'll return mock data that would be realistic
    const mockProgressData = {
      estimatedReadiness: Math.floor(Math.random() * 30) + 65, // 65-95%
      learningVelocity: parseFloat((Math.random() * 2 + 1.5).toFixed(1)), // 1.5-3.5%/week
      daysSinceStart: Math.floor(Math.random() * 30) + 10, // 10-40 days
      totalReviews: Math.floor(Math.random() * 100) + 20, // 20-120 reviews
      averageSuccess: Math.floor(Math.random() * 30) + 70, // 70-100%
      consistencyScore: Math.floor(Math.random() * 30) + 70, // 70-100%
      sessionFrequency: parseFloat((Math.random() * 2 + 1.5).toFixed(1)), // 1.5-3.5 sessions/day
      avgSessionLength: Math.floor(Math.random() * 30) + 15, // 15-45 minutes
      topicsMastered: Math.floor(Math.random() * 15) + 5, // 5-20 topics
      areasNeedingWork: Math.floor(Math.random() * 5) + 1, // 1-5 areas
    };

    // 4. Log successful access
    await logAuditEvent(AuditAction.DOCUMENT_ACCESSED, {
      userId,
      severity: AuditSeverity.INFO,
      resourceType: 'learning_progress',
      ipAddress: request.ip,
      statusCode: 200,
      details: { dataPoints: Object.keys(mockProgressData).length },
    });

    return NextResponse.json({ 
      success: true, 
      data: mockProgressData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching progress data:', error);
    await logAuditEvent(AuditAction.API_ERROR, {
      severity: AuditSeverity.ERROR,
      resourceType: 'learning_progress',
      ipAddress: request.ip,
      details: {
        endpoint: 'GET /api/learning/progress',
        error: error instanceof Error ? error.message : String(error),
      },
    });
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}