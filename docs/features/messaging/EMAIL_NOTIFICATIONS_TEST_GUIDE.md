# Email Notifications - Testing Guide
## How to Run Email Tests

**Date:** December 6, 2025  
**Status:** Ready to Test

---

## 📋 Prerequisites

Before running tests, ensure:
- ✅ `pnpm dev` is running in Terminal A
- ✅ `.env.local` has all 4 environment variables:
  - `RESEND_API_KEY`
  - `RESEND_FROM_EMAIL`
  - `INTERNAL_API_KEY`
  - `NEXT_PUBLIC_INTERNAL_API_KEY`
- ✅ You have your `INTERNAL_API_KEY` value ready

---

## 🧪 Test 1: Resend Test Email (delivered@resend.dev)

### Why This Test?
- ✅ Resend test email always succeeds
- ✅ No real email sent
- ✅ Fastest way to verify setup
- ✅ No waiting for inbox delivery

### Step 1: Get Your INTERNAL_API_KEY

1. Open `.env.local` in your editor
2. Find this line:
   ```
   INTERNAL_API_KEY=your-key-here
   ```
3. Copy everything after the `=` sign
4. Keep it ready for the next step

### Step 2: Open PowerShell Terminal

```bash
# Navigate to project
cd c:\Users\Projects\thesis-ai-fresh
```

### Step 3: Run Test Command (Curl Version)

Replace `YOUR_KEY_HERE` with your actual INTERNAL_API_KEY value:

```powershell
curl -X POST http://localhost:3000/api/notifications/send-student-email `
  -H "Content-Type: application/json" `
  -H "x-api-key: YOUR_KEY_HERE" `
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

### Step 4: Run Test Command (PowerShell Version - If curl doesn't work)

```powershell
# Set your API key
$key = "YOUR_KEY_HERE"

# Run the test
Invoke-WebRequest -Uri "http://localhost:3000/api/notifications/send-student-email" `
  -Method POST `
  -Headers @{"x-api-key" = $key; "Content-Type" = "application/json"} `
  -Body '{
    "to": "delivered@resend.dev",
    "studentName": "Maria Santos",
    "senderName": "Dr. Garcia",
    "senderRole": "advisor",
    "actionType": "feedback",
    "documentTitle": "Chapter 1 - Introduction",
    "message": "Your advisor has provided feedback on your chapter.",
    "actionUrl": "https://thesisai-philippines.vercel.app/drafts/123",
    "actionButtonText": "View Feedback"
  }' -ErrorAction Stop | Select-Object -ExpandProperty Content
```

### Step 5: Check Results

**Expected Success Response:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "data": {
    "id": "email-abc123xyz"
  }
}
```

**Check These Places:**

1. **Terminal Output** - You should see the JSON above
2. **Dev Server Logs** (Terminal A) - Look for "Email sent successfully"
3. **Resend Dashboard** (https://dashboard.resend.com):
   - Click "Emails" tab
   - Find email to `delivered@resend.dev`
   - Status should show "Delivered"

### ✅ Test 1 Success Checklist

- [ ] Terminal shows `"success": true`
- [ ] Dev server shows "Email sent"
- [ ] Resend dashboard shows email "Delivered"
- [ ] No error messages in terminal

---

## 🧪 Test 2: Your Email (zerlake@gmail.com)

### Why This Test?
- ✅ Real email sent to your inbox
- ✅ Verify email formatting and styling
- ✅ Verify links work
- ✅ See actual email appearance

### Step 1: Run Test Command (Curl Version)

Replace `YOUR_KEY_HERE` with your INTERNAL_API_KEY:

```powershell
curl -X POST http://localhost:3000/api/notifications/send-student-email `
  -H "Content-Type: application/json" `
  -H "x-api-key: YOUR_KEY_HERE" `
  -d '{
    "to": "zerlake@gmail.com",
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

### Step 2: Check Terminal Response

Should see:
```json
{
  "success": true,
  "message": "Email sent successfully",
  "data": {
    "id": "email-xyz789"
  }
}
```

### Step 3: Check Resend Dashboard

1. Go to https://dashboard.resend.com
2. Click "Emails" tab
3. Find email to `zerlake@gmail.com`
4. Status should show "Delivered"

### Step 4: Check Your Gmail Inbox

1. Go to https://gmail.com
2. Login to your account
3. **IMPORTANT:** Wait 5-10 seconds
4. Check inbox (look for newest email)
5. **ALSO CHECK:** Spam/Promotions folder

### Step 5: Verify Email Content

When email arrives, check:

**Email Header:**
- ✅ From: `noreply@thesisai-philippines.com`
- ✅ Subject: `💬 Feedback from Dr. Garcia`

**Email Body:**
- ✅ Greeting: "Hi Maria Santos,"
- ✅ Title: "💬 Feedback from Your Advisor: Dr. Garcia"
- ✅ Sender role badge: Shows "Advisor" with emoji
- ✅ Message: "Your advisor has provided feedback on your chapter."
- ✅ Document card: Shows "Chapter 1 - Introduction"
- ✅ Button: "View Feedback" is clickable
- ✅ Button link: Works and goes to correct URL

**Email Styling:**
- ✅ Green header gradient at top
- ✅ Proper spacing and alignment
- ✅ Professional appearance
- ✅ Mobile responsive

### ✅ Test 2 Success Checklist

- [ ] Terminal shows `"success": true`
- [ ] Resend dashboard shows email "Delivered"
- [ ] Email received in Gmail inbox
- [ ] Email header is correct
- [ ] Email subject is correct
- [ ] Email formatting looks good
- [ ] "View Feedback" button works
- [ ] Links are clickable

---

## 🔧 Troubleshooting

### Issue 1: "Cannot connect to server"

**Error Message:**
```
curl: (7) Failed to connect to localhost port 3000
```

**Solution:**
1. Make sure `pnpm dev` is running in another terminal
2. Wait 5 seconds for server to start
3. Try again

### Issue 2: "Unauthorized" Response

**Error Message:**
```json
{"error": "Unauthorized"}
```

**Solution:**
1. Check your `x-api-key` header value
2. Make sure it matches `INTERNAL_API_KEY` in `.env.local`
3. Make sure `.env.local` has correct format (no spaces)
4. Restart dev server: Stop `pnpm dev` and run again
5. Try test again

### Issue 3: "API key is missing"

**Error Message:**
```
Failed to send notification email: API key is missing
```

**Solution:**
1. Check `.env.local` has `RESEND_API_KEY=re_...`
2. Make sure it starts with `re_`
3. Make sure there are no extra spaces
4. Restart dev server
5. Try test again

### Issue 4: "Missing required field: to"

**Error Message:**
```json
{"error": "Missing required field: to"}
```

**Solution:**
1. Check your curl command has `"to": "delivered@resend.dev"`
2. Make sure all required fields are included
3. Check JSON formatting is correct
4. Try test again

### Issue 5: Email not arriving in Gmail

**Symptoms:**
- Resend shows "Delivered"
- Email not in inbox
- Not in spam folder

**Solutions:**
1. Wait 10-15 seconds (Gmail takes time)
2. Refresh Gmail page (F5)
3. Check spam/promotions folder
4. Check unread emails filter
5. Search for "noreply@thesisai" in Gmail search
6. Check if email went to different Gmail account
7. Try test again with different email

### Issue 6: Email in Spam Folder

**Why:**
- New domain reputation
- Email authentication setup

**Solution:**
1. Email still works fine
2. Mark as "Not Spam" in Gmail
3. Add to contacts
4. This improves over time as more people receive emails

---

## 📊 Test Matrix

| Test | Endpoint | To | Expected Status | Where to Check |
|------|----------|----|-----------------|----|
| Test 1 | send-student-email | delivered@resend.dev | Delivered | Terminal + Resend |
| Test 2 | send-student-email | zerlake@gmail.com | Delivered | Terminal + Resend + Gmail |

---

## 📝 Test Results Template

Use this to record your test results:

### Test 1 Results
```
Date: ________________
Time: ________________

Terminal Response:
[Paste JSON response here]

Dev Server Logs:
[Note any log messages]

Resend Dashboard Status:
[Success/Failed/Pending]

Email ID:
[If success, note the ID]
```

### Test 2 Results
```
Date: ________________
Time: ________________

Terminal Response:
[Paste JSON response here]

Resend Dashboard Status:
[Success/Failed/Pending]

Gmail Inbox:
[ ] Email received
[ ] Email in inbox
[ ] Email in spam
[ ] Email not received

Email Details:
From: ________________
Subject: ________________
Arrived at: ________________
Links working: [ ] Yes [ ] No
Formatting looks good: [ ] Yes [ ] No
```

---

## 🔍 Advanced Testing

### Test All Three Email Types

#### Test 3: Advisor Email

```powershell
curl -X POST http://localhost:3000/api/notifications/send-email `
  -H "Content-Type: application/json" `
  -H "x-api-key: YOUR_KEY_HERE" `
  -d '{
    "to": "delivered@resend.dev",
    "advisorName": "Dr. Garcia",
    "studentName": "Maria Santos",
    "actionType": "submission",
    "documentTitle": "Chapter 1",
    "message": "Maria Santos has submitted Chapter 1 for your review.",
    "actionUrl": "https://thesisai-philippines.vercel.app/advisor",
    "actionButtonText": "Review Document"
  }'
```

#### Test 4: Critic Email

```powershell
curl -X POST http://localhost:3000/api/notifications/send-critic-email `
  -H "Content-Type: application/json" `
  -H "x-api-key: YOUR_KEY_HERE" `
  -d '{
    "to": "delivered@resend.dev",
    "advisorName": "Dr. Critic",
    "studentName": "Maria Santos",
    "actionType": "submission",
    "documentTitle": "Chapter 1",
    "message": "Maria Santos has submitted Chapter 1 for your critical review.",
    "actionUrl": "https://thesisai-philippines.vercel.app/critic",
    "actionButtonText": "Review Document"
  }'
```

### Test All Action Types

**For Student Email:**
- `"actionType": "feedback"` - Feedback received
- `"actionType": "revision-request"` - Revision requested
- `"actionType": "milestone-feedback"` - Milestone feedback
- `"actionType": "general-message"` - General message

**For Advisor/Critic Email:**
- `"actionType": "submission"` - Document submitted
- `"actionType": "revision"` - Document revised
- `"actionType": "request"` - Help requested
- `"actionType": "milestone"` - Milestone achieved

---

## ✅ Complete Testing Checklist

### Pre-Test Setup
- [ ] `pnpm dev` running
- [ ] `.env.local` has all 4 environment variables
- [ ] RESEND_API_KEY starts with `re_`
- [ ] INTERNAL_API_KEY is 32+ characters
- [ ] Both keys are not empty

### Test 1 (Resend Test Email)
- [ ] Terminal shows success response
- [ ] Dev server shows "Email sent"
- [ ] Resend dashboard shows email "Delivered"

### Test 2 (Your Email)
- [ ] Terminal shows success response
- [ ] Resend dashboard shows email "Delivered"
- [ ] Gmail inbox receives email
- [ ] Email from correct sender
- [ ] Email has correct subject
- [ ] Email styling looks good
- [ ] Links are clickable

### Email Content Verification
- [ ] Greeting personalized with student name
- [ ] Sender name displayed correctly
- [ ] Action type icon shows correctly
- [ ] Document/topic title shown
- [ ] Call-to-action button visible
- [ ] Footer with links present
- [ ] Email responsive on mobile

### Additional Tests (Optional)
- [ ] Test with your own email address
- [ ] Test advisor notification email
- [ ] Test critic notification email
- [ ] Test different action types

---

## 🚀 Next Steps After Successful Tests

Once both tests pass:

1. **Record Results:** Save test results for documentation
2. **Integration Ready:** System is ready to integrate into application
3. **See Integration Guide:** Read `EMAIL_NOTIFICATIONS_INTEGRATION_PATTERNS.md`
4. **Add to Endpoints:** Integrate into document submission, feedback, etc.
5. **Production Ready:** Monitor and deploy

---

## 📞 Getting Help

### If Tests Pass
- ✅ Move to integration phase
- ✅ See `EMAIL_NOTIFICATIONS_INTEGRATION_PATTERNS.md`
- ✅ Add notification calls to your endpoints

### If Tests Fail
- ❌ Check troubleshooting section above
- ❌ Verify all environment variables
- ❌ Check Resend API key validity
- ❌ Review error messages carefully
- ❌ Try again from the beginning

---

## 📖 Related Documentation

- `EMAIL_NOTIFICATIONS_START_HERE.md` - Quick start guide
- `EMAIL_NOTIFICATIONS_QUICK_REFERENCE_3WAY.md` - Function reference
- `EMAIL_NOTIFICATIONS_INTEGRATION_PATTERNS.md` - Integration code
- `EMAIL_NOTIFICATIONS_IMPLEMENTATION_GUIDE.md` - Technical details

---

## 💾 Saving Test Results

After running tests, save your results:

```markdown
# Test Results - [DATE]

## Test 1: Resend Test Email
- Status: [PASS/FAIL]
- Response: [JSON response]
- Resend Status: [Delivered/Failed]

## Test 2: Your Email (zerlake@gmail.com)
- Status: [PASS/FAIL]
- Response: [JSON response]
- Resend Status: [Delivered/Failed]
- Gmail Status: [Received/Spam/Not Received]

## Notes
[Any observations or issues]
```

---

## 🎯 Quick Command Reference

### Health Check (No API Key Needed)
```powershell
curl -X GET http://localhost:3000/api/notifications/send-student-email
```

### Student Email Test
```powershell
curl -X POST http://localhost:3000/api/notifications/send-student-email `
  -H "Content-Type: application/json" `
  -H "x-api-key: YOUR_KEY" `
  -d '[JSON BODY]'
```

### Advisor Email Test
```powershell
curl -X POST http://localhost:3000/api/notifications/send-email `
  -H "Content-Type: application/json" `
  -H "x-api-key: YOUR_KEY" `
  -d '[JSON BODY]'
```

### Critic Email Test
```powershell
curl -X POST http://localhost:3000/api/notifications/send-critic-email `
  -H "Content-Type: application/json" `
  -H "x-api-key: YOUR_KEY" `
  -d '[JSON BODY]'
```

---

## 🎓 Understanding Results

### Success Response
```json
{
  "success": true,
  "message": "Email sent successfully",
  "data": {
    "id": "email-id-string"
  }
}
```
**Means:** Email was accepted by Resend and will be delivered

### Failure Response
```json
{
  "success": false,
  "error": "error message"
}
```
**Means:** Something went wrong, check error message

### Resend "Delivered"
**Means:** Email was delivered to email provider (Gmail, Outlook, etc.)

### Resend "Failed"
**Means:** Email delivery failed, check Resend dashboard for details

### Email in Inbox
**Means:** Everything works perfectly!

### Email in Spam
**Means:** System works, but email authentication may be needed (not critical)

---

## ⏱️ Timeline

- **T+0s:** Run curl command
- **T+1s:** Check terminal for response
- **T+2s:** Check dev server logs
- **T+5s:** Check Resend dashboard
- **T+10s:** Check Gmail inbox

---

**Ready to test? Follow Test 1 steps above!**

Good luck! 🚀
