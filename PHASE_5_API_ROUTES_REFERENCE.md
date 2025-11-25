# Phase 5 API Routes Reference
**Status**: ✅ Ready for Integration  
**Last Updated**: November 24, 2024

---

## Quick Navigation

- [Dashboard Routes](#dashboard-routes)
- [Widget Routes](#widget-routes)
- [Layout Routes](#layout-routes)
- [Request/Response Examples](#requestresponse-examples)
- [Error Codes](#error-codes)
- [Caching Behavior](#caching-behavior)

---

## Dashboard Routes

### GET /api/dashboard
**Fetch user's current dashboard layout and widget data**

```typescript
// Request
GET /api/dashboard?widgets=research-progress,quick-stats

// Query Parameters
- widgets: string (optional) - Comma-separated widget IDs to fetch data for

// Response (200 OK)
{
  "success": true,
  "layout": {
    "id": "layout-123",
    "name": "Default Dashboard",
    "widgets": [/* widget configs */],
    "isDefault": true
  },
  "state": {
    "currentLayoutId": "layout-123",
    "isLoading": false,
    "isDirty": false
  },
  "widgetData": {
    "research-progress": {/* data */},
    "quick-stats": {/* data */}
  },
  "timestamp": "2024-11-24T12:00:00Z"
}
```

### POST /api/dashboard
**Save complete dashboard layout and state**

```typescript
// Request
POST /api/dashboard
Content-Type: application/json

{
  "layout": {
    "id": "layout-123",
    "name": "My Dashboard",
    "widgets": [/* widget configs */],
    "isDefault": true
  },
  "state": {
    "currentLayoutId": "layout-123",
    "viewMode": "edit"
  },
  "widgetData": {
    "research-progress": {/* data */},
    "quick-stats": {/* data */}
  }
}

// Response (200 OK)
{
  "success": true,
  "layout": {/* saved layout */},
  "state": {/* saved state */},
  "timestamp": "2024-11-24T12:00:00Z"
}
```

### PUT /api/dashboard
**Update specific dashboard settings**

```typescript
// Request
PUT /api/dashboard
Content-Type: application/json

{
  "layout": {
    "name": "Updated Name"
  },
  "state": {
    "viewMode": "view"
  }
}

// Response (200 OK)
{
  "success": true,
  "layout": {/* merged layout */},
  "state": {/* merged state */}
}
```

---

## Widget Routes

### GET /api/dashboard/widgets/[widgetId]
**Fetch data for a specific widget**

```typescript
// Request
GET /api/dashboard/widgets/research-progress?refresh=false

// Query Parameters
- refresh: boolean (optional, default: false) - Force refresh from data source

// Response (200 OK)
{
  "success": true,
  "widgetId": "research-progress",
  "data": {
    "papersRead": 42,
    "notesCreated": 127,
    "goalsCompleted": 8,
    "weeklyTrend": [/* trend data */]
  },
  "cached": true,  // indicates if from cache
  "valid": true,   // schema validation passed
  "errors": [],
  "timestamp": "2024-11-24T12:00:00Z"
}
```

### POST /api/dashboard/widgets/[widgetId]
**Update widget data or settings**

```typescript
// Request
POST /api/dashboard/widgets/research-progress
Content-Type: application/json

{
  "data": {
    "papersRead": 45,
    "notesCreated": 130
  },
  "settings": {
    "showTrend": true,
    "timeRange": "month"
  }
}

// Response (200 OK)
{
  "success": true,
  "widgetId": "research-progress",
  "data": {/* saved data */},
  "settings": {/* saved settings */},
  "timestamp": "2024-11-24T12:00:00Z"
}
```

### DELETE /api/dashboard/widgets/[widgetId]
**Clear cached data for a widget**

```typescript
// Request
DELETE /api/dashboard/widgets/research-progress

// Response (200 OK)
{
  "success": true,
  "widgetId": "research-progress",
  "cleared": true,
  "timestamp": "2024-11-24T12:00:00Z"
}
```

### POST /api/dashboard/widgets/batch
**Fetch data for multiple widgets (fastest method)**

```typescript
// Request
POST /api/dashboard/widgets/batch
Content-Type: application/json

{
  "widgetIds": ["research-progress", "quick-stats", "recent-papers"],
  "forceRefresh": false
}

// Response (200 OK for all success, 207 Multi-Status if some fail)
{
  "success": true,
  "results": {
    "research-progress": {
      "data": {/* widget data */},
      "cached": true,
      "valid": true
    },
    "quick-stats": {
      "data": {/* widget data */},
      "cached": false,
      "valid": true
    },
    "recent-papers": {
      "data": {/* widget data */},
      "cached": true,
      "valid": true
    }
  },
  "timestamp": "2024-11-24T12:00:00Z"
}

// If some fail (207 Multi-Status)
{
  "success": false,
  "results": {
    "research-progress": {/* success */},
    "quick-stats": {/* success */}
  },
  "errors": {
    "recent-papers": "Unknown widget: recent-papers"
  },
  "timestamp": "2024-11-24T12:00:00Z"
}
```

### GET /api/dashboard/widgets/batch
**Alternative GET method for batch requests**

```typescript
// Request (query parameters)
GET /api/dashboard/widgets/batch?ids=research-progress,quick-stats,recent-papers&refresh=false

// Query Parameters
- ids: string (required) - Comma-separated widget IDs
- refresh: boolean (optional, default: false) - Force refresh

// Response - Same as POST batch
```

---

## Layout Routes

### GET /api/dashboard/layouts
**List all dashboard layouts for user**

```typescript
// Request
GET /api/dashboard/layouts?default=false&templates=false

// Query Parameters
- default: boolean (optional) - Only return default layout
- templates: boolean (optional) - Only return template layouts

// Response (200 OK)
{
  "success": true,
  "layouts": [
    {
      "id": "layout-1",
      "name": "Default Dashboard",
      "widgets": [/* configs */],
      "isDefault": true,
      "isTemplate": false,
      "created_at": "2024-11-24T10:00:00Z",
      "updated_at": "2024-11-24T11:00:00Z"
    },
    {/* more layouts */}
  ],
  "default": {/* default layout */},
  "count": 3,
  "timestamp": "2024-11-24T12:00:00Z"
}
```

### POST /api/dashboard/layouts
**Create a new dashboard layout**

```typescript
// Request
POST /api/dashboard/layouts
Content-Type: application/json

{
  "name": "My Custom Layout",
  "description": "Optimized for research",
  "widgets": [
    {
      "id": "widget-1",
      "widgetId": "research-progress",
      "position": { "x": 0, "y": 0, "width": 2, "height": 2 },
      "settings": { "showTrend": true }
    }
  ],
  "isDefault": false,
  "isTemplate": false
}

// Response (201 Created)
{
  "success": true,
  "layout": {
    "id": "layout-1234567890",
    "name": "My Custom Layout",
    /* ... rest of layout */
    "created_at": "2024-11-24T12:00:00Z",
    "updated_at": "2024-11-24T12:00:00Z"
  },
  "timestamp": "2024-11-24T12:00:00Z"
}
```

### GET /api/dashboard/layouts/[id]
**Fetch a specific layout by ID**

```typescript
// Request
GET /api/dashboard/layouts/layout-123

// Response (200 OK)
{
  "success": true,
  "layout": {
    "id": "layout-123",
    "name": "My Dashboard",
    "widgets": [/* configs */],
    "isDefault": true,
    "created_at": "2024-11-24T10:00:00Z",
    "updated_at": "2024-11-24T11:00:00Z"
  },
  "timestamp": "2024-11-24T12:00:00Z"
}

// Error Response (404 Not Found)
{
  "error": "Layout not found"
}
```

### PUT /api/dashboard/layouts/[id]
**Update a specific layout**

```typescript
// Request
PUT /api/dashboard/layouts/layout-123
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description",
  "widgets": [/* new widget configs */],
  "isDefault": true
}

// Response (200 OK)
{
  "success": true,
  "layout": {
    "id": "layout-123",
    "name": "Updated Name",
    /* ... rest of layout */
    "updated_at": "2024-11-24T12:00:00Z"
  },
  "timestamp": "2024-11-24T12:00:00Z"
}
```

### DELETE /api/dashboard/layouts/[id]
**Delete a specific layout**

```typescript
// Request
DELETE /api/dashboard/layouts/layout-123

// Response (200 OK)
{
  "success": true,
  "deletedId": "layout-123",
  "timestamp": "2024-11-24T12:00:00Z"
}

// Error: Cannot delete default layout (409 Conflict)
{
  "error": "Cannot delete the default layout. Set another layout as default first."
}
```

### POST /api/dashboard/layouts/[id]
**Clone a layout**

```typescript
// Request
POST /api/dashboard/layouts/layout-123
Content-Type: application/json

{
  "name": "My Layout Copy"
}

// Response (201 Created)
{
  "success": true,
  "layout": {
    "id": "layout-9876543210",
    "name": "My Layout Copy",
    "widgets": [/* same as original */],
    "isDefault": false,
    "created_at": "2024-11-24T12:00:00Z"
  },
  "timestamp": "2024-11-24T12:00:00Z"
}
```

### PUT /api/dashboard/layouts
**Update multiple layouts or set default**

```typescript
// Request
PUT /api/dashboard/layouts
Content-Type: application/json

{
  "layoutId": "layout-123",
  "setDefault": true,
  "name": "New Name" // optional
}

// Response (200 OK)
{
  "success": true,
  "layout": {/* updated layout */},
  "timestamp": "2024-11-24T12:00:00Z"
}
```

---

## Request/Response Examples

### Complete Workflow: Create and Save Layout

```typescript
// 1. Create a new layout
const createResponse = await fetch('/api/dashboard/layouts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Research Dashboard',
    widgets: [
      {
        id: 'w1',
        widgetId: 'research-progress',
        position: { x: 0, y: 0, width: 2, height: 2 }
      },
      {
        id: 'w2',
        widgetId: 'recent-papers',
        position: { x: 2, y: 0, width: 2, height: 2 }
      }
    ]
  })
});
const { layout } = await createResponse.json();

// 2. Fetch data for all widgets
const dataResponse = await fetch('/api/dashboard/widgets/batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    widgetIds: ['research-progress', 'recent-papers']
  })
});
const { results } = await dataResponse.json();

// 3. Save to dashboard
const saveResponse = await fetch('/api/dashboard', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    layout,
    state: { currentLayoutId: layout.id },
    widgetData: {
      'research-progress': results['research-progress'].data,
      'recent-papers': results['recent-papers'].data
    }
  })
});
const { success } = await saveResponse.json();
```

---

## Error Codes

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | Success | Widget fetched successfully |
| 201 | Created | Layout created successfully |
| 207 | Multi-Status | Some widgets succeeded, some failed |
| 400 | Bad Request | Invalid JSON or missing required field |
| 401 | Unauthorized | Not authenticated |
| 404 | Not Found | Layout or widget doesn't exist |
| 409 | Conflict | Cannot delete default layout |
| 500 | Server Error | Database error or unexpected issue |

### Error Response Format

```json
{
  "error": "Human-readable error message",
  "details": [/* optional validation errors */],
  "timestamp": "2024-11-24T12:00:00Z"
}
```

---

## Caching Behavior

### Cache Strategy
- **Default TTL**: 1 hour
- **Cache-First**: Returns cached data if valid
- **Force Refresh**: Skips cache and fetches fresh data
- **Validation**: Data validated against widget schema

### Cache Headers

```typescript
// Cached response (within TTL)
{
  "data": {/* widget data */},
  "cached": true,    // From cache
  "valid": true      // Passed validation
}

// Fresh response (beyond TTL or force refresh)
{
  "data": {/* widget data */},
  "cached": false,   // From source
  "valid": true      // Passed validation
}
```

### Force Refresh

```typescript
// Single widget
GET /api/dashboard/widgets/research-progress?refresh=true

// Batch widgets
POST /api/dashboard/widgets/batch
{
  "widgetIds": ["research-progress", "quick-stats"],
  "forceRefresh": true
}
```

---

## Authentication

All endpoints require valid session:

```typescript
// Session is validated automatically
// If not authenticated, returns 401:
{
  "error": "Unauthorized"
}
```

---

## Rate Limiting & Constraints

| Constraint | Value |
|-----------|-------|
| Batch size limit | 50 widgets per request |
| Widget ID length | 1-255 characters |
| Layout name length | 1-255 characters |
| Description length | 0-1000 characters |
| Cache TTL | 1 hour default |
| Widget position | Grid coordinates (x, y, width, height) |

---

## Integration Checklist

### Before Using These Routes
- [ ] Database migrations completed
- [ ] Zustand store updated with async actions
- [ ] DataSourceManager properly configured
- [ ] Widget schemas defined
- [ ] API routes deployed to server

### Testing These Routes
- [ ] Create layout endpoint
- [ ] Fetch widgets individually
- [ ] Batch fetch multiple widgets
- [ ] Update layout
- [ ] Delete layout
- [ ] Clone layout
- [ ] Error handling

### Frontend Integration
- [ ] useWidgetData hook connected
- [ ] useWidgetsData hook connected
- [ ] Dashboard store connected
- [ ] Loading states shown
- [ ] Error boundaries implemented

---

## Performance Tips

1. **Use Batch Requests**: Fetch multiple widgets at once
2. **Leverage Cache**: Don't force refresh unless necessary
3. **Limit Widget Count**: Keep dashboard under 10 widgets
4. **Debounce Updates**: Don't save on every keystroke
5. **Lazy Load**: Only load data when needed

---

## Troubleshooting

### Widget Data Returns Null
- Check widget ID is correct
- Verify DataSourceManager is configured
- Check database has data for widget
- Try force refresh: `?refresh=true`

### Cache Not Updating
- Clear cache with DELETE endpoint
- Wait for TTL expiration (1 hour)
- Use force refresh flag
- Check widget_data_cache table

### Layout Not Saving
- Verify authentication
- Check network request
- Validate layout JSON format
- Check user_id matches

### Performance Issues
- Use batch fetch instead of individual
- Reduce widget count
- Clear old cache entries
- Check database query performance

---

## Next Steps

1. ✅ API routes implemented
2. 🔄 Database migrations (coming next)
3. 🔄 Zustand store updates (coming next)
4. 🔄 Unit tests (coming next)
5. 🔄 Frontend integration (after database)

---

**Last Updated**: November 24, 2024  
**Status**: ✅ Production Ready (awaiting database migration)
