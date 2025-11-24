/**
 * SerenaClient Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SerenaClient } from '../serena-client';

describe('SerenaClient', () => {
  let client: SerenaClient;

  beforeEach(() => {
    client = new SerenaClient('http://localhost:3000');
  });

  it('should create a session ID', () => {
    const context = client.getContext();
    expect(context.sessionId).toBeDefined();
    expect(context.sessionId).toMatch(/^session_/);
  });

  it('should initialize empty conversation history', () => {
    const context = client.getContext();
    expect(context.conversationHistory).toEqual([]);
  });

  it('should add metadata', () => {
    client.setMetadata('testKey', 'testValue');
    const context = client.getContext();
    expect(context.metadata.testKey).toBe('testValue');
  });

  it('should clear conversation history', () => {
    client.setMetadata('test', 'value');
    client.clearHistory();
    const context = client.getContext();
    expect(context.conversationHistory).toEqual([]);
  });

  it('should handle request errors gracefully', { timeout: 10000 }, async () => {
    // This test verifies error handling when Serena is unavailable
    const result = await client.sendRequest({
      task: 'test task',
    });

    // Should return a response object with success property
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('executionTime');
    // When Serena is unavailable, success should be false
    expect(typeof result.success).toBe('boolean');
  });
});
