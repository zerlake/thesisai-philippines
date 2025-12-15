# Email Notifications - Run Test Now
## Complete Command Ready to Execute

**Date:** December 6, 2025  
**Status:** Ready to Test

---

## ✅ Your Setup

You have everything ready:
- ✅ API Key: `$321Ellabanresend`
- ✅ Correct endpoint: `send-student-email`
- ✅ Correct JSON body with all fields
- ✅ Dev server running

---

## 🚀 Step 1: Copy This Complete Command

Copy the entire block below and paste into PowerShell:

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

---

## 🖥️ Step 2: Execute in PowerShell

1. **Clear** current input: Press `Ctrl+C`
2. **Paste** the command above
3. **Press** Enter to execute
4. **Wait** 2-3 seconds for response

---

## 🔍 Step 3: What to Expect

### Success Response
```json
{
  "success": true,
  "message": "Email sent successfully",
  "data": {
    "id": "email-abc123xyz"
  }
}
```

### Error Response (Wrong API Key)
```json
{"error": "Unauthorized"}
```

### Error Response (Missing Fields)
```json
{"error": "Missing required field: to"}
```

---

## 📋 Step 4: Report Results

After running the command, tell me:

1. **Did you get a response?** (Yes/No)
2. **What does it say?** (Copy the entire JSON response)
3. **Any error messages?** (Copy them)
4. **Success or Failed?** (success/failed)

---

## ✨ Example Results to Report

### If Success
```
Response: {"success":true,"message":"Email sent successfully","data":{"id":"email-20251206-abc123"}}
Status: SUCCESS ✅
```

### If Error
```
Response: {"error":"Unauthorized"}
Status: ERROR ❌
Issue: API key doesn't match INTERNAL_API_KEY
```

---

## 🔧 Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| Command not found | Make sure you're in PowerShell, not cmd |
| Connection refused | Make sure `pnpm dev` is running |
| Unauthorized | Check API key matches `.env.local` |
| Server error | Check dev server logs for details |

---

## 📊 After Test 1 Success

Once Test 1 passes, run **Test 2** with your email:

```powershell
curl -X POST http://localhost:3000/api/notifications/send-student-email `
  -H "Content-Type: application/json" `
  -H "x-api-key: $321Ellabanresend" `
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

Then check:
1. **Terminal response** - Should show success
2. **Resend Dashboard** - https://dashboard.resend.com (should show "Delivered")
3. **Gmail Inbox** - Should receive email in 5-10 seconds
4. **Gmail Spam Folder** - If not in inbox, check spam

---

## ✅ Complete Checklist

### Before Running
- [ ] PowerShell is open
- [ ] You're in the project directory
- [ ] `pnpm dev` is running in another terminal
- [ ] You copied the complete command above

### Running the Command
- [ ] Cleared previous input (Ctrl+C)
- [ ] Pasted the complete command
- [ ] Pressed Enter
- [ ] Waited 2-3 seconds

### After Running
- [ ] Got a response (check terminal)
- [ ] Noted the response (success/error)
- [ ] Checked dev server logs
- [ ] Ready to report results

---

## 📞 What to Tell Me

Come back and tell me:

1. **Command Result:** (Copy the JSON)
2. **Success or Error?** (success/failed)
3. **Any issues?** (If you see errors)

Then I'll help with:
- ✅ Test 2 (your email)
- ✅ Troubleshooting (if needed)
- ✅ Integration (if successful)

---

## 🎯 Next After Results

### If Test 1 Passes ✅
1. Run Test 2 with your email
2. Check Gmail inbox
3. Verify email formatting
4. Move to integration phase

### If Test 1 Fails ❌
1. Check error message
2. Verify API key in `.env.local`
3. Verify `.env.local` format
4. Restart `pnpm dev`
5. Try again

---

## 📚 Related Files

- `EMAIL_NOTIFICATIONS_TEST_GUIDE.md` - Detailed testing guide
- `EMAIL_NOTIFICATIONS_INTEGRATION_PATTERNS.md` - Integration code
- `EMAIL_NOTIFICATIONS_QUICK_REFERENCE_3WAY.md` - Function reference

---

## 🚀 Ready?

1. Copy the command above
2. Paste into PowerShell
3. Press Enter
4. Come back with results

Let's go! 🎉
