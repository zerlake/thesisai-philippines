# Phase 5: Manual API Testing Guide

**Purpose**: Validate all dashboard API endpoints manually using curl or Postman  
**Time**: ~30 minutes  
**Status**: Ready to execute

---

## 📋 Prerequisites

### Setup Required
```bash
# 1. Start dev server
npm run dev

# 2. Get your auth token (from browser console)
# Run in browser: await supabase.auth.getSession()
# Copy the session token

# 3. Set environment variable for convenience
export AUTH_TOKEN="your_token_here"

# Or on Windows PowerShell
$env:AUTH_TOKEN="your_token_here"
```

### Base URL
```
http://localhost:3000/api/dashboard
```

---

## 🧪 Test Cases

### 1. Single Widget Fetch

#### Get Research Progress Widget
```bash
curl -X GET http://localhost:3000/api/dashboard/widgets/research-progress \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response**:
```json
{
  "data": {
    "papersRead": 24,
    "notesCreated": 47,
    "goalsCompleted": 3,
    "goalsTotal": 5,
    "researchAccuracy": 87,
    "weeklyTrend": [...],
    "monthlyTrend": [...],
    "period": "month",
    "chartType": "line"
  },
  "cached": false
}
```

**Expected Status**: `200 OK`

#### Get Quick Stats Widget
```bash
curl -X GET http://localhost:3000/api/dashboard/widgets/quick-stats \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

**Expected Response**:
```json
{
  "data": {
    "totalPapers": 156,
    "totalNotes": 487,
    "totalWords": 45230,
    "totalReadTime": 3240,
    "avgReadTime": 20.8,
    "avgNoteLength": 92.8,
    "stats": [...]
  },
  "cached": true
}
```

#### Get Recent Papers Widget
```bash
curl -X GET http://localhost:3000/api/dashboard/widgets/recent-papers \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

#### Get Writing Goals Widget
```bash
curl -X GET http://localhost:3000/api/dashboard/widgets/writing-goals \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

#### Test Widget Not Found
```bash
curl -X GET http://localhost:3000/api/dashboard/widgets/invalid-widget \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

**Expected Status**: `404 Not Found`

---

### 2. Batch Widget Fetch

#### Fetch Multiple Widgets at Once
```bash
curl -X POST http://localhost:3000/api/dashboard/widgets/batch \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "widgetIds": [
      "research-progress",
      "quick-stats",
      "recent-papers"
    ],
    "forceRefresh": false
  }'
```

**Expected Response**:
```json
{
  "results": {
    "research-progress": { ... },
    "quick-stats": { ... },
    "recent-papers": { ... }
  },
  "errors": {}
}
```

#### Fetch with Force Refresh
```bash
curl -X POST http://localhost:3000/api/dashboard/widgets/batch \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "widgetIds": ["research-progress", "quick-stats"],
    "forceRefresh": true
  }'
```

#### Exceed Batch Limit (test error)
```bash
# Create array of 51 widget IDs
curl -X POST http://localhost:3000/api/dashboard/widgets/batch \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "widgetIds": [
      "widget-1", "widget-2", ..., "widget-51"
    ]
  }'
```

**Expected Status**: `400 Bad Request`

---

### 3. Dashboard Layout Endpoints

#### Get Main Dashboard
```bash
curl -X GET http://localhost:3000/api/dashboard \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

**Expected Response**:
```json
{
  "layout": {
    "id": "default",
    "name": "Default Dashboard",
    "description": "Default dashboard layout",
    "widgets": [
      {
        "id": "widget-1",
        "widgetId": "research-progress",
        "x": 0, "y": 0, "w": 2, "h": 2
      }
    ]
  },
  "widgets": {
    "research-progress": { ... }
  }
}
```

#### Update Dashboard
```bash
curl -X PUT http://localhost:3000/api/dashboard \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Dashboard",
    "widgets": [
      {
        "widgetId": "research-progress",
        "x": 0, "y": 0, "w": 2, "h": 2
      }
    ]
  }'
```

**Expected Status**: `200 OK`

#### Save Dashboard Config
```bash
curl -X POST http://localhost:3000/api/dashboard \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Custom Dashboard",
    "description": "My personalized dashboard",
    "widgets": [
      {
        "widgetId": "research-progress",
        "x": 0, "y": 0, "w": 2, "h": 2
      },
      {
        "widgetId": "quick-stats",
        "x": 2, "y": 0, "w": 2, "h": 1
      }
    ]
  }'
```

**Expected Status**: `201 Created`

---

### 4. Layout Management Endpoints

#### List All Layouts
```bash
curl -X GET http://localhost:3000/api/dashboard/layouts \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

**Expected Response**:
```json
{
  "layouts": [
    {
      "id": "default",
      "name": "Default Dashboard",
      "description": "Default dashboard layout",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-11-24T00:00:00Z"
    },
    {
      "id": "custom-1",
      "name": "My Custom Dashboard",
      "description": "My personalized dashboard",
      "createdAt": "2024-11-24T10:00:00Z",
      "updatedAt": "2024-11-24T10:00:00Z"
    }
  ]
}
```

#### Create New Layout
```bash
curl -X POST http://localhost:3000/api/dashboard/layouts \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Research Dashboard",
    "description": "Focused on research progress"
  }'
```

**Expected Status**: `201 Created`

**Expected Response**:
```json
{
  "id": "research-1",
  "name": "Research Dashboard",
  "description": "Focused on research progress",
  "widgets": [],
  "createdAt": "2024-11-24T10:00:00Z",
  "updatedAt": "2024-11-24T10:00:00Z"
}
```

#### Get Specific Layout
```bash
# Use the ID from list response
curl -X GET http://localhost:3000/api/dashboard/layouts/research-1 \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

#### Update Layout
```bash
curl -X PUT http://localhost:3000/api/dashboard/layouts/research-1 \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Research Progress Dashboard",
    "description": "Updated description"
  }'
```

**Expected Status**: `200 OK`

#### Clone Layout
```bash
curl -X POST http://localhost:3000/api/dashboard/layouts/default/clone \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Default Copy"
  }'
```

**Expected Status**: `201 Created`

#### Delete Layout
```bash
curl -X DELETE http://localhost:3000/api/dashboard/layouts/research-1 \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

**Expected Status**: `204 No Content`

---

### 5. Error Handling Tests

#### Missing Authentication
```bash
curl -X GET http://localhost:3000/api/dashboard/widgets/research-progress
```

**Expected Status**: `401 Unauthorized`

**Expected Response**:
```json
{
  "error": "Authentication required",
  "message": "Please provide a valid authentication token"
}
```

#### Invalid Widget ID
```bash
curl -X GET http://localhost:3000/api/dashboard/widgets/non-existent \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

**Expected Status**: `404 Not Found`

#### Invalid Batch Request
```bash
curl -X POST http://localhost:3000/api/dashboard/widgets/batch \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"widgetIds": []}'
```

**Expected Status**: `400 Bad Request`

#### Server Error
```bash
# Trigger by requesting invalid data structure
curl -X POST http://localhost:3000/api/dashboard \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d 'invalid-json'
```

**Expected Status**: `400 Bad Request`

---

## 🛠️ Postman Collection

### Import these endpoints into Postman

#### Environment Variables
```json
{
  "base_url": "http://localhost:3000/api/dashboard",
  "auth_token": "your_token_here"
}
```

#### Headers (for all requests)
```
Authorization: Bearer {{auth_token}}
Content-Type: application/json
```

#### Requests to Import

| Method | Endpoint | Body |
|--------|----------|------|
| GET | `/widgets/research-progress` | None |
| GET | `/widgets/quick-stats` | None |
| GET | `/widgets/recent-papers` | None |
| POST | `/widgets/batch` | `{ "widgetIds": [...] }` |
| GET | `/` | None |
| PUT | `/` | Layout object |
| POST | `/` | Layout object |
| GET | `/layouts` | None |
| POST | `/layouts` | `{ "name": "...", "description": "..." }` |
| GET | `/layouts/:id` | None |
| PUT | `/layouts/:id` | Update object |
| POST | `/layouts/:id/clone` | `{ "name": "..." }` |
| DELETE | `/layouts/:id` | None |

---

## ✅ Testing Checklist

### Widget Endpoints
- [ ] GET `/widgets/research-progress` → 200 with data
- [ ] GET `/widgets/quick-stats` → 200 with data
- [ ] GET `/widgets/recent-papers` → 200 with data
- [ ] GET `/widgets/writing-goals` → 200 with data
- [ ] GET `/widgets/invalid` → 404
- [ ] POST `/widgets/batch` (3 widgets) → 200
- [ ] POST `/widgets/batch` (51 widgets) → 400
- [ ] POST `/widgets/batch` (force refresh) → 200

### Layout Endpoints
- [ ] GET `/` → 200 with layout
- [ ] PUT `/` → 200 updated
- [ ] POST `/` → 201 created
- [ ] GET `/layouts` → 200 list
- [ ] POST `/layouts` → 201 created
- [ ] GET `/layouts/:id` → 200
- [ ] PUT `/layouts/:id` → 200
- [ ] POST `/layouts/:id/clone` → 201
- [ ] DELETE `/layouts/:id` → 204

### Error Cases
- [ ] No auth token → 401
- [ ] Invalid widget → 404
- [ ] Batch size > 50 → 400
- [ ] Invalid JSON → 400
- [ ] Missing required fields → 400

### Caching
- [ ] First request cached: false
- [ ] Second request cached: true
- [ ] Force refresh cached: false
- [ ] Different widgets different cache

---

## 🔍 Debugging Tips

### Check Response Headers
```bash
curl -X GET http://localhost:3000/api/dashboard \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -v
```

### Pretty Print JSON
```bash
curl -X GET http://localhost:3000/api/dashboard \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq .
```

### Save Response to File
```bash
curl -X GET http://localhost:3000/api/dashboard \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -o response.json
```

### View Request/Response
```bash
# Using jq with verbose output
curl -X GET http://localhost:3000/api/dashboard \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -w "\n%{http_code}\n"
```

---

## 📊 Expected Performance

### Response Times
- Single widget: < 100ms
- Batch (10 widgets): < 200ms
- List layouts: < 50ms
- Create layout: < 150ms

### Cache Behavior
- First request: API → cache
- Subsequent: Cache hit within TTL
- After TTL: API again
- Force refresh: Always API

---

## 🐛 Common Issues

### Issue: 401 Unauthorized
```
Solution: Check auth token is valid
1. Go to browser console
2. Run: await supabase.auth.getSession()
3. Copy access_token value
4. Add to curl: -H "Authorization: Bearer {token}"
```

### Issue: 404 Not Found
```
Solution: Check widget name spelling
Valid widgets:
- research-progress
- quick-stats
- recent-papers
- writing-goals
- collaboration
- calendar
- trends
- notes
- citations
- suggestions
- time-tracker
- custom
```

### Issue: 400 Bad Request
```
Solution: Check JSON format
1. Validate JSON is valid: jsonlint.com
2. Check required fields
3. Use single quotes for curl, double for JSON
4. Escape special characters
```

### Issue: 500 Server Error
```
Solution: Check server logs
1. npm run dev should show errors
2. Check browser console for errors
3. Check database connection
4. Review request body format
```

---

## 📈 Success Indicators

✅ **All endpoints responding**
- Status codes correct
- Response formats valid
- Data structures match schema

✅ **Caching working**
- First request not cached
- Second request cached
- TTL respected

✅ **Error handling robust**
- 401 for auth failures
- 404 for not found
- 400 for bad requests

✅ **Performance acceptable**
- < 200ms for batch
- Consistent response times
- No timeouts

---

## 🎯 Final Verification

After completing all tests:

1. ✅ All 13+ endpoints responding
2. ✅ All error cases handled
3. ✅ Caching working correctly
4. ✅ Response data valid
5. ✅ Performance acceptable
6. ✅ No server errors in logs

**Result**: Dashboard APIs fully validated! ✅

---

**Next**: Run automated tests with `npm run test` to validate programmatically
