import { createClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';

import { serverEnv } from '@/lib/env';
import { createRedisClient } from '@/lib/redis-client';
import type { PaddleDocumentParseResult, PaddleParseResponse } from '@/lib/types/paddleocr';

const PARSER_BASE_URL = process.env.PARSER_BASE_URL ?? 'http://localhost:8080';

interface EnqueuePayload {
  document_id: string;
  file_url: string;
  filename: string;
}

export async function enqueueDocumentParse(payload: EnqueuePayload): Promise<PaddleParseResponse> {
  const response = await fetch(`${PARSER_BASE_URL}/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to enqueue parse job: ${response.statusText}`);
  }

  return response.json();
}

export async function uploadAndParse(file: File): Promise<PaddleParseResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${PARSER_BASE_URL}/parse/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload: ${response.statusText}`);
  }

  return response.json();
}

export async function getParseStatus(taskId: string): Promise<PaddleParseResponse> {
  const response = await fetch(`${PARSER_BASE_URL}/status/${taskId}`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to fetch status: ${response.statusText}`);
  }
  return response.json();
}
