-- AI Analytics Table Schema
-- Phase 5: Real-time Monitoring & Analytics

-- Create the main analytics table
CREATE TABLE IF NOT EXISTS ai_analytics (
  id TEXT PRIMARY KEY,
  timestamp BIGINT NOT NULL,
  module TEXT NOT NULL,
  operation TEXT NOT NULL,
  user_id TEXT,
  document_id TEXT,
  metadata JSONB,
  context JSONB,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_analytics_timestamp ON ai_analytics (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ai_analytics_module ON ai_analytics (module);
CREATE INDEX IF NOT EXISTS idx_ai_analytics_operation ON ai_analytics (operation);
CREATE INDEX IF NOT EXISTS idx_ai_analytics_user_id ON ai_analytics (user_id);
CREATE INDEX IF NOT EXISTS idx_ai_analytics_document_id ON ai_analytics (document_id);
CREATE INDEX IF NOT EXISTS idx_ai_analytics_tags ON ai_analytics USING GIN (tags);

-- Create materialized views for common aggregations

-- Cache performance view
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_ai_cache_performance AS
SELECT
  module,
  operation,
  DATE_TRUNC('minute', TO_TIMESTAMP(timestamp/1000)) AS minute,
  COUNT(*) AS event_count,
  AVG((metadata->>'duration')::NUMERIC) AS avg_duration,
  SUM(CASE WHEN (metadata->>'cacheHit')::BOOLEAN THEN 1 ELSE 0 END) AS cache_hits,
  SUM(CASE WHEN (metadata->>'cacheHit')::BOOLEAN IS NULL OR (metadata->>'cacheHit')::BOOLEAN = FALSE THEN 1 ELSE 0 END) AS cache_misses,
  SUM(CASE WHEN (metadata->>'cacheHit')::BOOLEAN THEN 1 ELSE 0 END)::FLOAT / COUNT(*) AS hit_rate
FROM ai_analytics
WHERE module = 'cache'
GROUP BY module, operation, DATE_TRUNC('minute', TO_TIMESTAMP(timestamp/1000));

-- Provider performance view
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_ai_provider_performance AS
SELECT
  module,
  operation,
  (metadata->>'provider') AS provider,
  DATE_TRUNC('minute', TO_TIMESTAMP(timestamp/1000)) AS minute,
  COUNT(*) AS request_count,
  AVG((metadata->>'duration')::NUMERIC) AS avg_duration,
  AVG((metadata->>'retries')::NUMERIC) AS avg_retries,
  SUM(CASE WHEN (metadata->>'fallbackUsed')::BOOLEAN THEN 1 ELSE 0 END) AS fallbacks_used,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY (metadata->>'duration')::NUMERIC) AS p95_duration
FROM ai_analytics
WHERE module = 'integration'
GROUP BY module, operation, (metadata->>'provider'), DATE_TRUNC('minute', TO_TIMESTAMP(timestamp/1000));

-- Error rates view
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_ai_error_rates AS
SELECT
  module,
  (metadata->>'errorType') AS error_type,
  DATE_TRUNC('hour', TO_TIMESTAMP(timestamp/1000)) AS hour,
  COUNT(*) AS error_count,
  SUM(CASE WHEN operation LIKE '%error%' THEN 1 ELSE 0 END) AS error_operations,
  SUM(CASE WHEN operation LIKE '%recovery%' THEN 1 ELSE 0 END) AS recovery_operations
FROM ai_analytics
WHERE operation LIKE '%error%' OR operation LIKE '%recovery%'
GROUP BY module, (metadata->>'errorType'), DATE_TRUNC('hour', TO_TIMESTAMP(timestamp/1000));

-- Performance benchmarks view
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_ai_performance_benchmarks AS
SELECT
  module,
  operation,
  DATE_TRUNC('minute', TO_TIMESTAMP(timestamp/1000)) AS minute,
  COUNT(*) AS request_count,
  AVG((metadata->>'duration')::NUMERIC) AS avg_duration,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY (metadata->>'duration')::NUMERIC) AS p50_duration,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY (metadata->>'duration')::NUMERIC) AS p95_duration,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY (metadata->>'duration')::NUMERIC) AS p99_duration,
  MIN((metadata->>'duration')::NUMERIC) AS min_duration,
  MAX((metadata->>'duration')::NUMERIC) AS max_duration
FROM ai_analytics
WHERE metadata ? 'duration'
GROUP BY module, operation, DATE_TRUNC('minute', TO_TIMESTAMP(timestamp/1000));

-- Suggestions performance view
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_ai_suggestions_performance AS
SELECT
  module,
  operation,
  DATE_TRUNC('minute', TO_TIMESTAMP(timestamp/1000)) AS minute,
  COUNT(*) AS event_count,
  AVG((metadata->>'latency')::NUMERIC) AS avg_latency,
  AVG((metadata->>'acceptanceRate')::NUMERIC) AS avg_acceptance_rate,
  SUM(CASE WHEN operation = 'accept' THEN 1 ELSE 0 END) AS acceptances,
  SUM(CASE WHEN operation = 'reject' THEN 1 ELSE 0 END) AS rejections
FROM ai_analytics
WHERE module = 'suggestions'
GROUP BY module, operation, DATE_TRUNC('minute', TO_TIMESTAMP(timestamp/1000));

-- Refresh function for materialized views
CREATE OR REPLACE FUNCTION refresh_ai_analytics_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW mv_ai_cache_performance;
  REFRESH MATERIALIZED VIEW mv_ai_provider_performance;
  REFRESH MATERIALIZED VIEW mv_ai_error_rates;
  REFRESH MATERIALIZED VIEW mv_ai_performance_benchmarks;
  REFRESH MATERIALIZED VIEW mv_ai_suggestions_performance;
END;
$$ LANGUAGE plpgsql;

-- Schedule refresh every 30 seconds
-- This would be done via a background job in production
-- SELECT cron.schedule('refresh-ai-analytics', '*/30 * * * * *', $$SELECT refresh_ai_analytics_views()$$);

-- Insert sample data for testing
INSERT INTO ai_analytics (id, timestamp, module, operation, user_id, document_id, metadata, context, tags)
SELECT
  'event_' || g.id,
  EXTRACT(EPOCH FROM NOW() - (g.id || ' seconds')::INTERVAL) * 1000,
  CASE (RANDOM() * 9)::INTEGER
    WHEN 0 THEN 'cache'
    WHEN 1 THEN 'orchestration'
    WHEN 2 THEN 'errors'
    WHEN 3 THEN 'context'
    WHEN 4 THEN 'feedback'
    WHEN 5 THEN 'suggestions'
    WHEN 6 THEN 'semantic'
    WHEN 7 THEN 'multimodal'
    WHEN 8 THEN 'adaptive'
    WHEN 9 THEN 'integration'
  END,
  CASE (RANDOM() * 5)::INTEGER
    WHEN 0 THEN 'get'
    WHEN 1 THEN 'set'
    WHEN 2 THEN 'analyze'
    WHEN 3 THEN 'generate'
    WHEN 4 THEN 'request'
    WHEN 5 THEN 'response'
  END,
  'user_' || (RANDOM() * 1000)::INTEGER,
  'doc_' || (RANDOM() * 100)::INTEGER,
  jsonb_build_object(
    'duration', (RANDOM() * 1000)::INTEGER,
    'cacheHit', CASE WHEN RANDOM() > 0.5 THEN true ELSE false END,
    'provider', CASE (RANDOM() * 2)::INTEGER
      WHEN 0 THEN 'puter'
      WHEN 1 THEN 'openai'
      WHEN 2 THEN 'mock'
    END,
    'retries', (RANDOM() * 3)::INTEGER
  ),
  jsonb_build_object(
    'section', CASE (RANDOM() * 3)::INTEGER
      WHEN 0 THEN 'abstract'
      WHEN 1 THEN 'introduction'
      WHEN 2 THEN 'methodology'
      WHEN 3 THEN 'conclusion'
    END
  ),
  ARRAY['production', 'test']
FROM generate_series(1, 1000) g(id)
ON CONFLICT (id) DO NOTHING;