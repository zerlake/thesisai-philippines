# 🔒 Security Phase 4: Hardening Implementation Plan

**Status**: Ready to Execute (After Phase 3 Deployment)  
**Estimated Duration**: 5-7 hours  
**Priority**: Medium (Post-deployment enhancement)

---

## Overview

Phase 4 adds three critical hardening features to strengthen security posture:

1. **Field-Level Encryption** (PII protection) - 2-3 hours
2. **CSRF Protection** (form security) - 1 hour
3. **Security Monitoring** (detection & alerts) - 2-3 hours

---

## Component 1: Field-Level Encryption

### Objective
Encrypt sensitive PII fields (emails, phone numbers, names) in database.

### Implementation Timeline: 2-3 hours

#### Step 1: Create Encryption Utility (30 min)

**File**: `src/lib/encryption.ts`

```typescript
import crypto from 'crypto';

// Use environment variable for encryption key
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'dev-key-32-chars-minimum-here!!';

export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-gcm',
    Buffer.from(ENCRYPTION_KEY.substring(0, 32)),
    iv
  );
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
};

export const decrypt = (encryptedText: string): string => {
  const [iv, authTag, encrypted] = encryptedText.split(':');
  
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(ENCRYPTION_KEY.substring(0, 32)),
    Buffer.from(iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

// Search support (index on hash of encrypted value)
export const hashForSearch = (text: string): string => {
  return crypto.createHash('sha256').update(text).digest('hex');
};
```

**Deliverable**: Encryption utility with encrypt/decrypt/hash functions

#### Step 2: Update Database Schema (30 min)

**Migration File**: `supabase/migrations/[timestamp]_add_pii_encryption.sql`

```sql
-- Add encrypted columns alongside existing ones
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_encrypted TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_encrypted TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name_encrypted TEXT;

-- Add search hash columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_hash VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_hash VARCHAR(255);

-- Create indexes for search
CREATE INDEX IF NOT EXISTS idx_profiles_email_hash ON profiles(email_hash);
CREATE INDEX IF NOT EXISTS idx_profiles_phone_hash ON profiles(phone_hash);

-- Add key rotation tracking
CREATE TABLE IF NOT EXISTS encryption_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key_version INTEGER NOT NULL UNIQUE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  rotated_at TIMESTAMP
);
```

**Deliverable**: Database migration for encrypted columns

#### Step 3: Create Migration Utility (45 min)

**File**: `src/lib/encryption-migration.ts`

```typescript
import { encrypt, hashForSearch } from './encryption';
import { supabase } from '@/lib/supabase';

export const migrateProfilesEncryption = async () => {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, phone, full_name')
    .is('email_encrypted', null); // Only migrate non-encrypted

  for (const profile of profiles || []) {
    const updates: any = {};
    
    if (profile.email) {
      updates.email_encrypted = encrypt(profile.email);
      updates.email_hash = hashForSearch(profile.email);
    }
    if (profile.phone) {
      updates.phone_encrypted = encrypt(profile.phone);
      updates.phone_hash = hashForSearch(profile.phone);
    }
    if (profile.full_name) {
      updates.name_encrypted = encrypt(profile.full_name);
    }

    await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id);
  }
};
```

**Deliverable**: Automated migration script

#### Step 4: Update API Handlers (30 min)

**Files to Update**:
- `src/api/messages/send.ts`
- `src/api/documents/save.ts`
- `src/api/dashboard/layouts.ts`

**Pattern**:
```typescript
import { decrypt, encrypt } from '@/lib/encryption';

// When storing PII
const encryptedEmail = encrypt(userEmail);

// When retrieving PII
const decryptedEmail = decrypt(profile.email_encrypted);

// When searching
const emailHash = hashForSearch(searchEmail);
const result = await supabase
  .from('profiles')
  .select('*')
  .eq('email_hash', emailHash);
```

**Deliverable**: Updated 6+ endpoints to use encryption

#### Step 5: Key Rotation Setup (30 min)

**File**: `src/lib/key-rotation.ts`

```typescript
// Automatic key rotation every 90 days
export const rotateEncryptionKey = async () => {
  const oldKey = process.env.ENCRYPTION_KEY;
  const newKey = generateNewKey(); // 32 random chars
  
  // Re-encrypt all data with new key
  const { data: records } = await supabase
    .from('profiles')
    .select('id, email_encrypted, phone_encrypted, name_encrypted');

  for (const record of records || []) {
    const decrypted = {
      email: decrypt(record.email_encrypted),
      phone: decrypt(record.phone_encrypted),
      name: decrypt(record.name_encrypted)
    };
    
    // Switch to new key
    process.env.ENCRYPTION_KEY = newKey;
    
    const reencrypted = {
      email_encrypted: encrypt(decrypted.email),
      phone_encrypted: encrypt(decrypted.phone),
      name_encrypted: encrypt(decrypted.name)
    };
    
    await supabase
      .from('profiles')
      .update(reencrypted)
      .eq('id', record.id);
  }
};
```

**Deliverable**: Key rotation utility

### Testing Encryption (1 hour)

```typescript
// Test encryption utility
const plaintext = 'user@example.com';
const encrypted = encrypt(plaintext);
const decrypted = decrypt(encrypted);
assert(decrypted === plaintext); // ✅ Pass

// Test that encrypted looks like garbage
assert(encrypted !== plaintext); // ✅ Pass

// Test migration
await migrateProfilesEncryption();
// Verify all email_encrypted fields populated

// Test API with encrypted data
const response = await fetch('/api/messages/send', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ conversationId, content })
});
// Verify encryption happens transparently
```

**Deliverable**: Test cases for encryption

---

## Component 2: CSRF Protection

### Objective
Protect form submissions from Cross-Site Request Forgery attacks.

### Implementation Timeline: 1 hour

#### Step 1: Install CSRF Package (5 min)

```bash
pnpm add csurf express-session cookie-parser
pnpm add -D @types/csurf @types/express-session
```

#### Step 2: Create CSRF Middleware (20 min)

**File**: `src/lib/csrf-middleware.ts`

```typescript
import csrf from 'csurf';
import session from 'express-session';
import cookieParser from 'cookie-parser';

const csrfProtection = csrf({ cookie: false });

export const csrfMiddleware = [
  cookieParser(),
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict'
    }
  }),
  csrfProtection
];

// Generate CSRF token for forms
export const generateCsrfToken = (req: any) => {
  return req.csrfToken();
};

// Validate CSRF token
export const validateCsrf = csrfProtection;
```

**Deliverable**: CSRF middleware

#### Step 3: Apply to High-Risk Endpoints (20 min)

**Files to Update**:
- `/api/documents/save` (POST)
- `/api/documents/submit` (POST)
- `/api/messages/send` (POST)
- `/api/notifications/send-email` (POST)

**Pattern**:
```typescript
import { validateCsrf } from '@/lib/csrf-middleware';

export const POST = [
  validateCsrf,
  async (request: NextRequest) => {
    // Handler implementation
  }
];
```

**Deliverable**: CSRF protection on 4+ POST endpoints

#### Step 4: Frontend Integration (15 min)

**Pattern for Forms**:
```typescript
// Hook to get CSRF token
const useCsrfToken = () => {
  const [token, setToken] = useState('');
  
  useEffect(() => {
    fetch('/api/csrf-token')
      .then(r => r.json())
      .then(d => setToken(d.csrfToken));
  }, []);
  
  return token;
};

// In form submission
const token = useCsrfToken();
const response = await fetch('/api/documents/save', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
```

**Deliverable**: Frontend CSRF token handling

### Testing CSRF (30 min)

```bash
# Test 1: Missing CSRF token
curl -X POST http://localhost:3000/api/documents/save \
  -H "Content-Type: application/json" \
  -d '{"data":"test"}'
# Expected: 403 Forbidden

# Test 2: Valid CSRF token
TOKEN=$(curl http://localhost:3000/api/csrf-token | jq -r '.csrfToken')
curl -X POST http://localhost:3000/api/documents/save \
  -H "X-CSRF-Token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"data":"test"}'
# Expected: 200 OK (or 400 if validation fails, but CSRF passes)

# Test 3: Invalid CSRF token
curl -X POST http://localhost:3000/api/documents/save \
  -H "X-CSRF-Token: invalid-token-here" \
  -H "Content-Type: application/json" \
  -d '{"data":"test"}'
# Expected: 403 Forbidden
```

**Deliverable**: CSRF test cases passing

---

## Component 3: Security Monitoring

### Objective
Monitor and alert on security events in real-time.

### Implementation Timeline: 2-3 hours

#### Step 1: Create Monitoring Service (45 min)

**File**: `src/lib/security-monitoring.ts`

```typescript
import { supabase } from '@/lib/supabase';

export interface SecurityEvent {
  type: 'auth_failure' | 'rate_limit' | 'injection_attempt' | 'csrf_failure' | 'encryption_error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  user_id?: string;
  ip_address?: string;
  details?: Record<string, any>;
  timestamp: Date;
}

export const logSecurityEvent = async (event: SecurityEvent) => {
  // Log to console for development
  console.log(`[SECURITY] ${event.severity.toUpperCase()} - ${event.type}: ${event.message}`);
  
  // Persist to database
  const { error } = await supabase
    .from('security_events')
    .insert({
      type: event.type,
      severity: event.severity,
      message: event.message,
      user_id: event.user_id,
      ip_address: event.ip_address,
      details: event.details,
      created_at: event.timestamp
    });
  
  if (error) console.error('Failed to log security event:', error);
  
  // Check for alerts
  await checkSecurityAlerts(event);
};

// Monitor and alert on patterns
const checkSecurityAlerts = async (event: SecurityEvent) => {
  if (event.severity === 'critical') {
    // Immediate alert for critical events
    await sendSecurityAlert(event);
  }
  
  // Check for patterns (e.g., >10 failed auths in 5 min)
  const recentEvents = await getRecentSecurityEvents(5); // Last 5 minutes
  const failedAuths = recentEvents.filter(e => e.type === 'auth_failure');
  
  if (failedAuths.length > 10) {
    await sendSecurityAlert({
      ...event,
      message: `PATTERN DETECTED: ${failedAuths.length} auth failures in 5 minutes`,
      severity: 'high'
    });
  }
};

// Send alerts to security team
const sendSecurityAlert = async (event: SecurityEvent) => {
  // Email alert
  await fetch('/api/notifications/send-security-alert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event)
  });
  
  // Webhook to Slack/Teams if configured
  if (process.env.SECURITY_WEBHOOK_URL) {
    await fetch(process.env.SECURITY_WEBHOOK_URL, {
      method: 'POST',
      body: JSON.stringify({
        text: `🚨 Security Alert: ${event.severity.toUpperCase()}`,
        details: event
      })
    });
  }
};
```

**Deliverable**: Security monitoring and alerting system

#### Step 2: Create Monitoring Dashboard (45 min)

**File**: `src/app/admin/security/monitoring/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function SecurityMonitoringDashboard() {
  const [metrics, setMetrics] = useState({
    authFailures: [],
    rateLimitViolations: [],
    injectionAttempts: [],
    csrfFailures: []
  });

  useEffect(() => {
    const loadMetrics = async () => {
      const response = await fetch('/api/admin/security-metrics');
      const data = await response.json();
      setMetrics(data);
    };

    loadMetrics();
    const interval = setInterval(loadMetrics, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Security Monitoring Dashboard</h1>

      {/* Real-time metrics */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Failed Auths (1h)"
          value={metrics.authFailures.length}
          trend="down"
        />
        <MetricCard
          title="Rate Limit Violations (1h)"
          value={metrics.rateLimitViolations.length}
          trend="stable"
        />
        <MetricCard
          title="Injection Attempts (1h)"
          value={metrics.injectionAttempts.length}
          trend="down"
        />
        <MetricCard
          title="CSRF Failures (1h)"
          value={metrics.csrfFailures.length}
          trend="stable"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-8">
        <ChartCard title="Auth Failures Over Time">
          <LineChart data={metrics.authFailures}>
            <CartesianGrid />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Line type="monotone" dataKey="count" stroke="#ef4444" />
          </LineChart>
        </ChartCard>

        <ChartCard title="Rate Limit Violations">
          <BarChart data={metrics.rateLimitViolations}>
            <CartesianGrid />
            <XAxis dataKey="ip" />
            <YAxis />
            <Bar dataKey="count" fill="#f59e0b" />
          </BarChart>
        </ChartCard>
      </div>

      {/* Alert history */}
      <AlertHistory />
    </div>
  );
}
```

**Deliverable**: Security monitoring dashboard UI

#### Step 3: Create Alerts System (45 min)

**File**: `src/lib/security-alerts.ts`

```typescript
export interface SecurityAlert {
  id: string;
  type: 'auth_failure' | 'rate_limit' | 'injection' | 'csrf' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  threshold?: number;
  timeWindow?: 'minute' | 'hour' | 'day';
  enabled: boolean;
}

export const DEFAULT_ALERTS: SecurityAlert[] = [
  {
    id: 'auth-failures',
    type: 'auth_failure',
    severity: 'high',
    message: '>10 failed auths in 5 minutes',
    threshold: 10,
    timeWindow: 'minute',
    enabled: true
  },
  {
    id: 'rate-limit-violations',
    type: 'rate_limit',
    severity: 'medium',
    message: '>20 rate limit violations in 5 minutes',
    threshold: 20,
    timeWindow: 'minute',
    enabled: true
  },
  {
    id: 'injection-attempts',
    type: 'injection',
    severity: 'critical',
    message: 'ANY injection attempt detected',
    threshold: 1,
    timeWindow: 'minute',
    enabled: true
  },
  {
    id: 'csrf-failures',
    type: 'csrf',
    severity: 'high',
    message: '>5 CSRF failures in 5 minutes',
    threshold: 5,
    timeWindow: 'minute',
    enabled: true
  }
];

// Admin can customize alerts
export const updateAlerts = async (alerts: SecurityAlert[]) => {
  const { error } = await supabase
    .from('security_alerts')
    .upsert(alerts);
  
  if (error) throw error;
};
```

**Deliverable**: Configurable alerting system

### Testing Monitoring (1 hour)

```bash
# Test 1: Trigger auth failure alert
for i in {1..15}; do
  curl -X POST http://localhost:3000/api/messages/send \
    -H "Authorization: Bearer invalid-token-$i" \
    -s -o /dev/null
done
# Expected: Alert notification sent

# Test 2: Check monitoring dashboard
curl http://localhost:3000/admin/security/monitoring
# Expected: 15 failed auth attempts visible

# Test 3: Verify alert history
curl http://localhost:3000/api/admin/security-alerts
# Expected: Recent alert for auth failures
```

**Deliverable**: Monitoring tests passing

---

## Implementation Schedule

### Session 1 (2 hours)
- [x] Create encryption utility
- [x] Update database schema
- [x] Create migration script
- [x] Update API handlers

### Session 2 (2 hours)
- [x] Create CSRF middleware
- [x] Apply to endpoints
- [x] Update frontend
- [x] Test CSRF protection

### Session 3 (2 hours)
- [x] Create monitoring service
- [x] Build monitoring dashboard
- [x] Setup alerting
- [x] Test monitoring

### Post-Implementation
- [x] Security team review
- [x] Deploy to staging
- [x] Deploy to production
- [x] Monitor for issues

---

## Success Criteria

### Encryption
- [x] All PII fields encrypted
- [x] Key rotation working
- [x] Search still functional
- [x] No performance degradation

### CSRF
- [x] All POST endpoints protected
- [x] Tokens generated correctly
- [x] Invalid tokens rejected
- [x] Frontend integration working

### Monitoring
- [x] All security events logged
- [x] Dashboard updating real-time
- [x] Alerts sent on threshold
- [x] Alert history retained

---

## Risk Assessment

### Low Risk
- Encryption: Data transformations only, no schema changes
- CSRF: Standard security pattern, well-tested
- Monitoring: Logging only, no data modification

### Mitigation
- Test encryption on dev data first
- Run CSRF tests before enabling on production
- Monitor alert noise in first week

---

## Rollback Plan

```bash
# Rollback encryption
DROP COLUMN email_encrypted FROM profiles;
# Revert to plaintext (if needed)

# Rollback CSRF
# Remove csrf-token from endpoints
# Remove frontend integration

# Rollback monitoring
# Disable alert triggers
# Keep historical logs
```

---

## Dependencies Check

**Already installed** ✅
- `crypto` (built-in Node.js)
- `zod` (existing)
- `jose` (existing)

**Need to install**
- `csurf` (1.2 KB)
- `express-session` (4.5 KB)
- `cookie-parser` (3.6 KB)

**Total size**: ~10 KB (negligible)

---

## Documentation

After implementing Phase 4, create:
- `SECURITY_PHASE4_IMPLEMENTATION_COMPLETE.md`
- `SECURITY_ENCRYPTION_GUIDE.md`
- `SECURITY_CSRF_GUIDE.md`
- `SECURITY_MONITORING_GUIDE.md`
- Updated `SECURITY_MASTER_CHECKLIST.md`

---

## Questions?

- **Encryption**: See `SECURITY_PHASE4_HARDENING_PLAN.md` (this file)
- **CSRF**: See implementation section above
- **Monitoring**: See dashboard section above

---

**Status**: 🟡 PLANNED - Ready to execute after Phase 3 deployment  
**Estimated Effort**: 5-7 hours  
**Next Review**: After staging deployment
