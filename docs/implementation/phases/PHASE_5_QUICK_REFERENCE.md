# Phase 5: Quick Reference Card

## API Endpoints at a Glance

### Dashboard
```
GET    /api/dashboard              → Fetch layout + state + widget data
POST   /api/dashboard              → Save layout + state  
PUT    /api/dashboard              → Update specific settings
```

### Widgets (Batch)
```
POST   /api/dashboard/widgets/batch → Fetch multiple (max 50)
GET    /api/dashboard/widgets/batch → Same with query params
```

### Widgets (Individual)
```
GET    /api/dashboard/widgets/:id  → Fetch single widget
POST   /api/dashboard/widgets/:id  → Update widget data
DELETE /api/dashboard/widgets/:id  → Clear cache
```

### Real-time
```
GET    /api/realtime               → Health check + WebSocket info
POST   /api/realtime               → Sync pending operations
```

---

## Configured Widgets

13 widgets available. Usage example:

```json
{
  "widgetIds": [
    "research-progress",
    "quick-stats", 
    "recent-papers",
    "writing-goals",
    "collaboration",
    "calendar",
    "trends",
    "notes",
    "citations",
    "suggestions",
    "time-tracker",
    "custom",
    "stats"
  ]
}
```

---

## Cache Strategy

| Strategy | Behavior | Best For |
|----------|----------|----------|
| cache-first | Check cache first, fallback to API | Static data, reports |
| network-first | Fetch API first, fallback to cache | Real-time data |
| network-only | Always fetch fresh | Live data |
| cache-only | Cache only, no API call | Offline mode |

**TTLs**:
- Shortest: 2 min (collaboration)
- Longest: 30 min (citations)
- Default: 5 min

**Force Refresh**:
```json
{ "widgetIds": ["stats"], "forceRefresh": true }
```

---

## Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | ✓ All data valid |
| 207 | Partial failure | Check `errors` field |
| 400 | Invalid request | Fix parameters |
| 401 | Unauthorized | Re-authenticate |
| 500 | Server error | Fallback to mock data |

---

## Response Format

### Success (200)
```json
{
  "success": true,
  "results": {
    "widget-id": {
      "data": { /* widget data */ },
      "cached": false,
      "valid": true
    }
  },
  "timestamp": "2024-11-28T12:00:00Z"
}
```

### Partial Failure (207)
```json
{
  "success": false,
  "results": {
    "valid-widget": { /* data */ },
    "invalid-widget": null
  },
  "errors": {
    "invalid-widget": "Unknown widget"
  },
  "timestamp": "2024-11-28T12:00:00Z"
}
```

---

## Query Parameters

### Force Refresh
```
?refresh=true    → Bypass cache
```

### Single Widget
```
GET /api/dashboard/widgets/stats?refresh=true
```

### Batch via Query
```
GET /api/dashboard/widgets/batch?ids=stats,research-progress&refresh=true
```

---

## Client Code Examples

### React Hook
```typescript
const [widgets, setWidgets] = useState({});
const [loading, setLoading] = useState(false);

useEffect(() => {
  setLoading(true);
  fetch('/api/dashboard/widgets/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      widgetIds: ['stats', 'research-progress'],
      forceRefresh: false
    })
  })
    .then(r => r.json())
    .then(data => {
      setWidgets(data.results);
      setLoading(false);
    });
}, []);
```

### Single Widget
```typescript
fetch(`/api/dashboard/widgets/stats`)
  .then(r => r.json())
  .then(data => console.log(data.data))
```

### Real-time Check
```javascript
fetch('/api/realtime')
  .then(r => r.json())
  .then(data => console.log('WS URL:', data.wsUrl))
```

---

## Performance Targets

| Operation | Target | Target |
|-----------|--------|--------|
| Single (uncached) | 100-300ms | ~150ms avg |
| Single (cached) | <50ms | ~20ms avg |
| Batch 5 | 200-500ms | ~300ms avg |
| Batch 50 | 300-800ms | ~500ms avg |
| Cache hit ratio | >80% | After warm-up |

---

## Common Issues

### Widget Not Found
```
Error: "Unknown widget: invalid-id"
Response: 207 (partial failure)
```
**Fix**: Check widget ID matches list above

### Cache Expired
```json
{
  "data": null,
  "cached": false,
  "valid": false
}
```
**Fix**: Automatic on next request; or force refresh

### Unauthorized (401)
```json
{ "error": "Unauthorized" }
```
**Fix**: Check authentication token

### Server Error (500)
```json
{ "error": "Internal server error" }
```
**Fix**: API falls back to mock data; check logs

---

## Debugging

### Check Widget Schema
```typescript
import { widgetSchemas, validateWidgetData } from '@/lib/dashboard/widget-schemas'

const validation = validateWidgetData('stats', data)
console.log('Valid:', validation.valid)
console.log('Errors:', validation.errors)
```

### Check Cache
```typescript
// Browser console
const cached = await fetch('/api/dashboard/widgets/stats')
const data = await cached.json()
console.log('Cached?', data.cached)
console.log('Timestamp:', data.timestamp)
```

### Monitor Real-time
```javascript
// Browser console on dashboard
const ws = new WebSocket('ws://localhost:3001/realtime?userId=user-id')
ws.onmessage = (e) => console.log('Message:', e.data)
ws.onerror = (e) => console.error('Error:', e)
```

---

## Database Tables

### widget_data_cache
```sql
-- Check cached data
SELECT * FROM widget_data_cache 
WHERE user_id = 'user-123'
AND expires_at > NOW()
```

### widget_settings
```sql
-- Check widget settings
SELECT widget_id, settings 
FROM widget_settings
WHERE user_id = 'user-123'
```

### user_preferences
```sql
-- Check dashboard preferences
SELECT dashboard_layout, dashboard_widgets
FROM user_preferences
WHERE user_id = 'user-123'
```

---

## Testing Commands

### Build
```bash
pnpm build          # Production build (46s)
pnpm dev           # Development server
pnpm lint          # Check ESLint
pnpm test          # Run tests
```

### Manual API Test
```bash
# Batch request
curl -X POST http://localhost:3001/api/dashboard/widgets/batch \
  -H "Content-Type: application/json" \
  -d '{"widgetIds": ["stats", "research-progress"]}'

# Individual widget
curl http://localhost:3001/api/dashboard/widgets/stats

# Real-time check
curl http://localhost:3001/api/realtime
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/app/(app)/dashboard/page.tsx` | Dashboard page (role-based routing) |
| `src/app/api/dashboard/route.ts` | Dashboard API (GET/POST/PUT) |
| `src/app/api/dashboard/widgets/batch/route.ts` | Batch endpoint |
| `src/app/api/dashboard/widgets/[widgetId]/route.ts` | Individual widget |
| `src/lib/dashboard/data-source-manager.ts` | Data fetching + caching |
| `src/lib/dashboard/widget-schemas.ts` | Validation + mock data |
| `src/components/student-dashboard-enterprise.tsx` | Dashboard UI |
| `src/components/dashboard/DashboardRealtimeProvider.tsx` | Real-time WebSocket |

---

## Environment Variables

### Required
```env
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Optional (defaults to localhost:3000)
NEXT_PUBLIC_WS_URL=wss://yourdomain.com
```

---

## Health Check

```bash
# Is everything ready?
curl http://localhost:3001/api/metrics/health

# Can we connect?
curl http://localhost:3001/api/realtime

# Can we fetch a widget?
curl -X POST http://localhost:3001/api/dashboard/widgets/batch \
  -H "Content-Type: application/json" \
  -d '{"widgetIds": ["stats"]}'
```

---

## Migration Checklist (Staging → Production)

- [ ] Run performance benchmarks
- [ ] Accessibility audit (90+ score)
- [ ] Load test batch endpoint
- [ ] Test with real data
- [ ] Verify WebSocket connection
- [ ] Check error handling
- [ ] Monitor error logs
- [ ] Get stakeholder approval
- [ ] Enable monitoring
- [ ] Plan rollback

---

## Support

### Related Documents
- **SESSION_12_DELIVERY.md** - Full infrastructure report
- **SESSION_12_E2E_VERIFICATION.md** - Detailed verification
- **PHASE_5_PERFORMANCE_TEST.md** - Performance testing
- **SESSION_11_E2E_TEST_PLAN.md** - Original test plan

### Key Contacts
- Build Issues: See AGENTS.md
- API Issues: Check api-error-handler.ts
- Cache Issues: Check data-source-manager.ts
- Real-time Issues: Check DashboardRealtimeProvider.tsx

---

**Last Updated**: Session 12 (Nov 28, 2024)  
**Status**: ✅ Verified & Production Ready (Performance testing pending)
