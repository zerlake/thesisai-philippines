# Email Notifications - No Response Fix
## Troubleshooting "No Response at All"

**Issue:** Curl command returns nothing (hangs or timeout)

---

## 🔍 Step 1: Check if Dev Server is Running

### Check 1A: Is pnpm dev actually running?

Open your terminal where you ran `pnpm dev` and look for:

```
  ▲ Next.js 16.x.x
  - Local: http://localhost:3000
  ✓ Ready in 1.2s
```

**If you see this:** Dev server is running ✅

**If you see errors or nothing:** Dev server is NOT running ❌

### Check 1B: Restart Dev Server

If not running, start it:

```bash
cd c:\Users\Projects\thesis-ai-fresh
pnpm dev
```

Wait for it to fully start (should see "Ready in X seconds").

---

## 🔍 Step 2: Test if Server is Reachable

Run this simple health check (no API key needed):

```powershell
curl -X GET http://localhost:3000/api/notifications/send-student-email
```

### Expected Response
```json
{
  "status": "healthy",
  "message": "Student email notification API is ready",
  "timestamp": "2025-12-06T..."
}
```

**If you get this:** Server is running, endpoint exists ✅

**If you get nothing:** Server is not responding ❌

**If you get error:** Different issue ❌

---

## 🔍 Step 3: Check Dev Server is Actually Listening

Run this to see if ANY endpoint responds:

```powershell
curl -X GET http://localhost:3000
```

Should return HTML (the Next.js home page).

**If it works:** Server is running ✅

**If it doesn't:** Server not listening ❌

---

## 🔧 Solution 1: Restart Dev Server

**Complete restart:**

```bash
# 1. Stop current dev server
# Press Ctrl+C in the terminal running "pnpm dev"

# 2. Wait 3 seconds

# 3. Restart
pnpm dev

# 4. Wait for "Ready in X seconds"

# 5. Then try your test command again
```

---

## 🔧 Solution 2: Check Port 3000 is Not Blocked

The dev server runs on port 3000. If another process is using it:

**PowerShell:**
```powershell
# Check what's using port 3000
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

# If something is using it, kill it
Stop-Process -Id [process-id] -Force
```

Then restart `pnpm dev`.

---

## 🔧 Solution 3: Check for Build Errors

When you run `pnpm dev`, watch for errors like:

```
error TS2307: Cannot find module 'react-email'
error: Failed to compile
```

**If you see errors:**
1. Stop dev server (Ctrl+C)
2. Run: `pnpm install`
3. Run: `pnpm dev` again

---

## 🔧 Solution 4: Check Environment Variables

Make sure `.env.local` has all required variables:

```env
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@thesisai-philippines.com
INTERNAL_API_KEY=your-key-here
NEXT_PUBLIC_INTERNAL_API_KEY=your-key-here
```

**If missing any:**
1. Add them to `.env.local`
2. Stop dev server (Ctrl+C)
3. Start dev server: `pnpm dev`

---

## 📊 Diagnostic Checklist

Run these commands in order and report results:

### Test 1: Is Server Running?
```powershell
curl -X GET http://localhost:3000
```
Expected: HTML content  
Actual: _________________

### Test 2: Is API Endpoint Responding?
```powershell
curl -X GET http://localhost:3000/api/notifications/send-student-email
```
Expected: `{"status":"healthy",...}`  
Actual: _________________

### Test 3: Check Dev Server Logs
Look in terminal running `pnpm dev` for:
- Errors?
- Warnings?
- "Ready" message?

Log shows: _________________

---

## 🆘 If Still No Response

### Step A: Check Network Connectivity

```powershell
# Test basic connectivity
Test-NetConnection -ComputerName localhost -Port 3000
```

Should show `TcpTestSucceeded : True`

### Step B: Try a Different Port

If port 3000 is blocked, try 3001:

```bash
# Stop current dev server (Ctrl+C)
# Start on different port
pnpm dev --port 3001

# Then test with:
curl -X GET http://localhost:3001
```

### Step C: Check Firewall

Windows Firewall might block localhost:

1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Make sure Node.js is allowed
4. Restart dev server

---

## ✅ Verification Steps

Once you think it's fixed:

### Step 1: Confirm Dev Server Running
```bash
# You should see in terminal:
# ▲ Next.js 16.x.x
# ✓ Ready in X.Xs
```

### Step 2: Test Health Check
```powershell
curl -X GET http://localhost:3000/api/notifications/send-student-email
```
Should get JSON response with `"status":"healthy"`

### Step 3: Run Full Test
```powershell
curl -X POST http://localhost:3000/api/notifications/send-student-email `
  -H "Content-Type: application/json" `
  -H "x-api-key: $321Ellabanresend" `
  -d '{
    "to": "delivered@resend.dev",
    "studentName": "Maria Santos",
    "senderName": "Dr. Garcia",
    "senderRole": "advisor",
    "actionType": "feedback",
    "documentTitle": "Chapter 1 - Introduction",
    "message": "Your advisor has provided feedback on your chapter.",
    "actionUrl": "https://thesisai-philippines.vercel.app/drafts/123",
    "actionButtonText": "View Feedback"
  }'
```

Should get success response

---

## 📋 Complete Troubleshooting Sequence

Follow this exact order:

1. **Is pnpm dev running?**
   - Check terminal for "Ready in X seconds"
   - If not: Run `pnpm dev`

2. **Does basic localhost work?**
   - Run: `curl -X GET http://localhost:3000`
   - If not: Firewall issue

3. **Does API endpoint respond?**
   - Run: `curl -X GET http://localhost:3000/api/notifications/send-student-email`
   - If not: Check `.env.local` and restart

4. **Run test command**
   - Run full test command
   - Should get JSON response

5. **Report results**
   - Copy all responses
   - Tell me what you see

---

## 🎯 Most Common Cause

**99% of "no response" issues:**
- Dev server NOT actually running
- Or dev server crashed with an error

**Solution:**
1. Check terminal running `pnpm dev`
2. If it shows an error: Fix the error
3. If it's not running: Start it
4. Wait for "Ready" message
5. Try test again

---

## 🔍 What to Report Back

Run the diagnostic tests above and tell me:

1. **Is pnpm dev running?** (Yes/No)
2. **Test 1 result:** (What did curl return?)
3. **Test 2 result:** (What did curl return?)
4. **Dev server errors?** (Any red text in logs?)
5. **Any error messages?** (Copy them)

---

## 📞 Quick Fixes Summary

| Issue | Command to Fix |
|-------|----------------|
| Dev server not running | `pnpm dev` |
| Dev server crashed | `Ctrl+C` then `pnpm dev` |
| Port in use | `Stop-Process -Id [id] -Force` |
| Missing packages | `pnpm install` |
| Missing env vars | Add to `.env.local` then restart |
| Firewall blocked | Allow Node.js in Windows Firewall |

---

## ✅ Expected Success Flow

```
1. Run: pnpm dev
   ↓
2. See: "✓ Ready in 1.2s"
   ↓
3. Run: curl health check
   ↓
4. See: {"status":"healthy",...}
   ↓
5. Run: full test command
   ↓
6. See: {"success":true,...}
   ↓
Success! ✅
```

---

## 🚀 Next Action

**Do this RIGHT NOW:**

1. Open terminal running `pnpm dev`
2. Look for "Ready" message
3. If you don't see it, you see an error, or it's not running:
   - Press Ctrl+C
   - Run: `pnpm dev`
   - Wait for "Ready"
4. Then try your test command again
5. Come back and tell me what you see

---

This should fix it! Let me know what happens. 🎯
