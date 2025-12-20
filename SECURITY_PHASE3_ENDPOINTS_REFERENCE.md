# 🔐 Security Phase 3: Endpoints Reference Card

Quick reference for all secured endpoints and their security features.

---

## ✅ SECURED ENDPOINTS (6)

### Document Management Endpoints

#### 1. POST /api/documents/save
**Security**: JWT + Input Validation + Authorization  
**Role**: Any authenticated user  
**Required Fields**: documentId, contentJson  
**On Success**: 200 + audit log (DOCUMENT_UPDATED)  
**On Failure**: 401/400/403/500 + audit log

**Security Checks**:
```
1. JWT token validation → 401 if missing
2. Input validation (Zod) → 400 if invalid
3. User ownership check → 403 if not owner
4. RLS violation check → 403 + CRITICAL log
5. Database operation → 500 if fails + ERROR log
```

---

#### 2. POST /api/documents/submit
**Security**: JWT + Input Validation + Authorization + Role Check  
**Role**: User (own docs) or Admin  
**Required Fields**: documentId, userId  
**On Success**: 200 + audit log (DOCUMENT_UPDATED)  
**On Failure**: 401/400/403/500 + audit log

**Security Checks**:
```
1. JWT token validation → 401 if missing
2. Input validation (UUID validation) → 400 if invalid
3. Authorization (own doc or admin) → 403 + CRITICAL log
4. Document ownership → 403 if not found
5. Update document → 500 if fails
6. Send notifications → logs failures but doesn't block
```

---

#### 3. GET /api/documents/versions/list
**Security**: JWT + Input Validation + Authorization  
**Role**: Any authenticated user  
**Query Parameters**: documentId (required), limit (optional), offset (optional)  
**On Success**: 200 + audit log (DOCUMENT_ACCESSED)  
**On Failure**: 401/400/403/500 + audit log

**Security Checks**:
```
1. JWT token validation → 401 if missing
2. Query parameter validation → 400 if invalid
3. Limit bounds checking (max 100) → capped automatically
4. User ownership check → 403 + WARNING log
5. Database query → 500 if fails + ERROR log
```

---

#### 4. POST /api/documents/versions/restore
**Security**: JWT + Input Validation + Authorization  
**Role**: Any authenticated user  
**Required Fields**: versionId, documentId  
**On Success**: 200 + audit log (DOCUMENT_UPDATED)  
**On Failure**: 401/400/403/500 + audit log

**Security Checks**:
```
1. JWT token validation → 401 if missing
2. Input validation (UUID validation) → 400 if invalid
3. Document ownership check → 403 + WARNING log
4. Version ownership check → 403 + WARNING log
5. Auto-backup creation (before restore)
6. Database update → 500 if fails
```

---

#### 5. POST /api/documents/versions/checkpoint
**Security**: JWT + Input Validation + Authorization  
**Role**: Any authenticated user  
**Required Fields**: documentId, content, checkpointLabel  
**On Success**: 200 + audit log (DOCUMENT_UPDATED)  
**On Failure**: 401/400/403/500 + audit log

**Security Checks**:
```
1. JWT token validation → 401 if missing
2. Input validation (Zod schema) → 400 if invalid
3. Label validation (max 100 chars) → 400 if too long
4. Document ownership check → 403 + WARNING log
5. Checkpoint creation → 500 if fails
6. Document metadata update
```

---

### Admin Endpoints

#### 6a. GET /api/admin/cleanup-users
**Security**: JWT + Admin Role Verification + Audit Logging  
**Role**: Admin only  
**Response**: Preview of users to delete  
**On Success**: 200 + audit log (DOCUMENT_ACCESSED)  
**On Failure**: 401/403/500 + audit log (CRITICAL)

**Security Checks**:
```
1. JWT token validation → 401 if missing/invalid
2. Admin role verification → 403 + CRITICAL log
3. Supabase configuration check → 500
4. User enumeration from auth.users
5. Access logging with counts (INFO severity)
```

**Response Format**:
```json
{
  "preview": true,
  "usersToDelete": [...],
  "usersToKeep": [...],
  "totalUsers": 42,
  "hint": "POST to this endpoint to execute cleanup"
}
```

---

#### 6b. POST /api/admin/cleanup-users
**Security**: JWT + Admin Role Verification + Audit Logging (CRITICAL)  
**Role**: Admin only  
**Purpose**: Delete non-essential test users  
**On Success**: 200 + audit log (CRITICAL severity)  
**On Failure**: 401/403/500 + audit log (CRITICAL severity)

**Security Checks**:
```
1. JWT token validation → 401 if missing
2. Admin role verification → 403 + CRITICAL log
3. Protected users whitelist (7 users always kept)
4. Database cleanup with transaction rollback on error
5. Completion logging with counts
6. Error logging at CRITICAL severity
```

**Actions Performed**:
- Delete from advisor_student_messages
- Delete from messages
- Delete from notifications
- Delete from activity_logs
- Delete from documents
- Delete from advisors
- Delete from critics
- Delete from profiles
- Delete from auth.users (admin API)

---

## 🔍 HTTP Status Codes

| Code | Meaning | Logged As | Example |
|------|---------|-----------|---------|
| 200 | Success | INFO or CRITICAL | Document saved successfully |
| 400 | Bad Input | WARNING | Missing required field |
| 401 | Unauthorized | WARNING | Missing JWT token |
| 403 | Forbidden | CRITICAL | User not owner, or non-admin |
| 500 | Server Error | ERROR | Database query failed |

---

## 📊 Audit Action Reference

### Logged Actions

| Action | Severity | Trigger | Example |
|--------|----------|---------|---------|
| AUTH_FAILED | WARNING | No/invalid JWT | Missing auth token |
| SECURITY_VALIDATION_FAILED | WARNING | Bad input | Invalid UUID format |
| SECURITY_RLS_VIOLATION | CRITICAL | Unauthorized access | User accessing other's doc |
| DOCUMENT_ACCESSED | INFO | Read operation | Listed document versions |
| DOCUMENT_CREATED | INFO | Create operation | Created new document |
| DOCUMENT_UPDATED | INFO | Update operation | Saved document changes |
| API_CALL | INFO/CRITICAL | Admin action | Cleanup initiated |
| API_ERROR | ERROR | System failure | Database error |

---

## 🛡️ Security Features

### JWT Validation
- ✅ Extracts user ID from token
- ✅ Validates token signature
- ✅ Returns 401 if missing/invalid
- ✅ Logs all auth failures

### Input Validation
- ✅ Zod schema validation
- ✅ UUID format validation
- ✅ String length limits
- ✅ Number range bounds
- ✅ Type checking

### Authorization
- ✅ User ownership verification
- ✅ Admin role checks
- ✅ RLS violation detection
- ✅ Privilege escalation prevention

### Audit Logging
- ✅ All operations logged
- ✅ Severity levels
- ✅ User ID tracked
- ✅ IP address captured
- ✅ Request details stored

### Error Handling
- ✅ Proper HTTP status codes
- ✅ All errors logged
- ✅ No information leakage
- ✅ Graceful failures

---

## 🧪 Testing Checklist

### Per Endpoint
```bash
# Test 1: Missing JWT token → 401
curl -X POST http://localhost:3000/api/documents/save \
  -H "Content-Type: application/json" \
  -d '{...}'

# Test 2: Invalid JWT token → 401
curl -X POST http://localhost:3000/api/documents/save \
  -H "Authorization: Bearer invalid_token" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Test 3: Missing required field → 400
curl -X POST http://localhost:3000/api/documents/save \
  -H "Authorization: Bearer $VALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}'

# Test 4: User not owner → 403
curl -X POST http://localhost:3000/api/documents/save \
  -H "Authorization: Bearer $OTHER_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"documentId": "OTHER_USER_DOC", ...}'

# Test 5: Valid request → 200
curl -X POST http://localhost:3000/api/documents/save \
  -H "Authorization: Bearer $VALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"documentId": "USER_DOC", ...}'
```

---

## 📋 Deployment Checklist

Before deploying to production:

- [ ] All 6 endpoints tested with valid tokens
- [ ] All 6 endpoints tested with invalid tokens
- [ ] Input validation tested with bad data
- [ ] Authorization tested with wrong users
- [ ] Error handling tested for failures
- [ ] Audit logs verified in console
- [ ] Build successful with no errors
- [ ] No breaking changes to API contracts
- [ ] Rollback plan documented
- [ ] Team trained on security

---

## 🔗 Related Documentation

- SECURITY_START_HERE.md - Overview
- SECURITY_INTEGRATION_GUIDE.md - How to integrate
- SECURITY_QUICK_REFERENCE_PHASE2.md - Code templates
- SECURITY_MASTER_CHECKLIST.md - Full progress tracking
- SECURITY_PHASE3_INTEGRATION_PROGRESS.md - Phase 3 status
- SECURITY_PHASE3_FINAL_SUMMARY.md - Detailed summary

---

**Last Updated**: December 21, 2025  
**Status**: 60% Complete (6 of 10 endpoints)  
**Build**: ✅ Successful
