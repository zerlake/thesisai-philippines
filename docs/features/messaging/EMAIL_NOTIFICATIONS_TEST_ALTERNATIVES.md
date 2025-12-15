# Email Notifications - Alternative Testing Methods
## Test Without PowerShell

**Date:** December 6, 2025

---

## 🌐 Option 1: Browser Test Page (Easiest!)

### Most User-Friendly Way

Your application already has a built-in test page!

**Step 1: Start Dev Server**
```bash
pnpm dev
```

**Step 2: Open in Browser**
Go to:
```
http://localhost:3000/api/notifications/test
```

**Step 3: Fill Out Form**
- Email: `delivered@resend.dev` (or your email)
- Advisor Name: `Dr. Garcia`
- Student Name: `Maria Santos`
- Action Type: `submission` (dropdown)
- Document Title: `Chapter 1 - Introduction`

**Step 4: Click Send**
- Click "Send Test Email" button
- Wait 2-3 seconds
- See success/error message

**Step 5: Check Results**
- Look for "Email sent successfully" message
- Check Resend dashboard: https://dashboard.resend.com
- Check your inbox

### ✅ **Advantages**
- No commands needed
- Visual interface
- Easy to understand
- Form validation
- Instant feedback

### ❌ **Disadvantages**
- Depends on test page being built

---

## 📮 Option 2: Postman (API Testing Tool)

### Professional Testing Tool

**Step 1: Download Postman**
- Visit: https://www.postman.com/downloads/
- Download for Windows
- Install and open

**Step 2: Create New Request**
- Click "+" to create new request
- Method: `POST`
- URL: `http://localhost:3000/api/notifications/send-student-email`

**Step 3: Add Headers**
- Click "Headers" tab
- Add header:
  - Key: `x-api-key`
  - Value: `$321Ellabanresend`
- Add header:
  - Key: `Content-Type`
  - Value: `application/json`

**Step 4: Add Body**
- Click "Body" tab
- Select "raw"
- Select "JSON" (dropdown)
- Paste this:

```json
{
  "to": "delivered@resend.dev",
  "studentName": "Maria Santos",
  "senderName": "Dr. Garcia",
  "senderRole": "advisor",
  "actionType": "feedback",
  "documentTitle": "Chapter 1 - Introduction",
  "message": "Your advisor has provided feedback on your chapter.",
  "actionUrl": "https://thesisai-philippines.vercel.app/drafts/123",
  "actionButtonText": "View Feedback"
}
```

**Step 5: Send**
- Click blue "Send" button
- See response below

### ✅ **Advantages**
- Visual interface
- Easy to modify requests
- Save requests for later
- Beautiful response formatting
- Professional tool

### ❌ **Disadvantages**
- Need to install software
- Steeper learning curve

---

## 🎨 Option 3: Browser Developer Tools (F12)

### Built Into Every Browser

**Step 1: Open Browser Console**
- Press `F12` in Chrome/Edge
- Go to "Console" tab

**Step 2: Copy This Code**

```javascript
fetch('http://localhost:3000/api/notifications/send-student-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '$321Ellabanresend'
  },
  body: JSON.stringify({
    to: 'delivered@resend.dev',
    studentName: 'Maria Santos',
    senderName: 'Dr. Garcia',
    senderRole: 'advisor',
    actionType: 'feedback',
    documentTitle: 'Chapter 1 - Introduction',
    message: 'Your advisor has provided feedback on your chapter.',
    actionUrl: 'https://thesisai-philippines.vercel.app/drafts/123',
    actionButtonText: 'View Feedback'
  })
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
```

**Step 3: Paste Into Console**
- Right-click in console
- Select "Paste"
- Press Enter

**Step 4: Check Response**
- Look at console output
- Should see `Success: {success: true, ...}`

### ✅ **Advantages**
- No software to install
- Built into every browser
- Good for learning
- Easy debugging

### ❌ **Disadvantages**
- Need to understand JavaScript
- Less visual feedback

---

## 🧪 Option 4: VS Code REST Client Extension

### Lightweight Testing in Editor

**Step 1: Install Extension**
- Open VS Code
- Go to Extensions (Ctrl+Shift+X)
- Search for "REST Client"
- Install (by Huachao Mao)

**Step 2: Create File**
- Create file: `test-email.http` in project root
- Paste this:

```http
POST http://localhost:3000/api/notifications/send-student-email
Content-Type: application/json
x-api-key: $321Ellabanresend

{
  "to": "delivered@resend.dev",
  "studentName": "Maria Santos",
  "senderName": "Dr. Garcia",
  "senderRole": "advisor",
  "actionType": "feedback",
  "documentTitle": "Chapter 1 - Introduction",
  "message": "Your advisor has provided feedback on your chapter.",
  "actionUrl": "https://thesisai-philippines.vercel.app/drafts/123",
  "actionButtonText": "View Feedback"
}
```

**Step 3: Send Request**
- Click "Send Request" link above POST
- See response in right panel

### ✅ **Advantages**
- Fast and lightweight
- Integrated in VS Code
- Easy to save multiple tests
- Good for development

### ❌ **Disadvantages**
- Need VS Code
- Need extension

---

## 📱 Option 5: React Component Test

### Within Your Application

**Step 1: Create Test Component**
Create file: `src/components/email-test.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useStudentNotificationEmail } from '@/hooks/useStudentNotificationEmail';

export function EmailTest() {
  const { sendEmail, isLoading, error } = useStudentNotificationEmail();
  const [response, setResponse] = useState('');

  const handleTest = async () => {
    const result = await sendEmail({
      to: 'delivered@resend.dev',
      studentName: 'Maria Santos',
      senderName: 'Dr. Garcia',
      senderRole: 'advisor',
      actionType: 'feedback',
      documentTitle: 'Chapter 1 - Introduction',
      message: 'Your advisor has provided feedback on your chapter.',
      actionUrl: 'https://thesisai-philippines.vercel.app/drafts/123',
      actionButtonText: 'View Feedback'
    });
    setResponse(JSON.stringify(result, null, 2));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Email Test</h1>
      <button onClick={handleTest} disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send Test Email'}
      </button>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {response && <pre>{response}</pre>}
    </div>
  );
}
```

**Step 2: Add to Page**
Add to your page:
```typescript
import { EmailTest } from '@/components/email-test';

export default function TestPage() {
  return <EmailTest />;
}
```

**Step 3: Test**
- Navigate to the page
- Click button
- See results

### ✅ **Advantages**
- Uses existing hooks
- Integrated in app
- Good for UI testing
- Professional approach

### ❌ **Disadvantages**
- Need to create component
- Need to add to page

---

## 📊 Comparison Table

| Method | Difficulty | Setup Time | Visual | Results |
|--------|-----------|-----------|--------|---------|
| Browser Test Page | ⭐ Easy | 1 min | ✅ Yes | Instant |
| Postman | ⭐⭐ Medium | 10 min | ✅ Yes | Instant |
| Browser Console | ⭐⭐ Medium | 2 min | ⚠️ Text | Instant |
| VS Code REST | ⭐⭐ Medium | 5 min | ✅ Yes | Instant |
| React Component | ⭐⭐⭐ Hard | 10 min | ✅ Yes | Instant |
| PowerShell | ⭐⭐ Medium | 1 min | ⚠️ Text | Instant |

---

## 🎯 Recommended: Browser Test Page

### Why It's Best

1. **Easiest:** No commands or tools needed
2. **Visual:** Nice interface with form
3. **Built-in:** Already created for you
4. **Instant:** See results immediately
5. **No setup:** Just go to URL

### How to Use

**Step 1:**
```bash
pnpm dev
```

**Step 2:**
Open browser to:
```
http://localhost:3000/api/notifications/test
```

**Step 3:**
Fill form and click "Send Test Email"

**Step 4:**
See results on page

---

## 🚀 Quick Start: Use Browser Test Page

### Complete Steps

1. **Make sure dev server is running:**
   ```bash
   pnpm dev
   ```
   Wait for "Ready" message

2. **Open browser:**
   Go to: `http://localhost:3000/api/notifications/test`

3. **You should see:**
   - A nice form
   - Input fields for email, name, etc.
   - A "Send Test Email" button
   - Setup guide

4. **Fill out form:**
   - Email: `delivered@resend.dev`
   - Advisor Name: `Dr. Garcia`
   - Student Name: `Maria Santos`
   - Action Type: `submission`
   - Document Title: `Chapter 1`

5. **Click "Send Test Email"**

6. **Check response:**
   - Success message appears on page
   - OR error message appears
   - See email ID in response

7. **Verify:**
   - Check Resend dashboard
   - Check your inbox (for zerlake@gmail.com test)

---

## 📋 Alternative Methods Summary

### No Setup Required (Just Go!)
- ✅ **Browser Test Page** - http://localhost:3000/api/notifications/test

### Light Setup (5 min)
- ✅ **Browser Console** - F12 → Console → Paste code
- ✅ **VS Code REST Client** - Install extension, create file

### Medium Setup (10 min)
- ✅ **Postman** - Download, install, configure request

### Custom (Your App)
- ✅ **React Component** - Create component, add to page

---

## 🎯 My Recommendation

**Use the Browser Test Page!**

It's:
- Already built
- Easiest to use
- Most visual
- Requires no setup
- Perfect for testing

Just go to:
```
http://localhost:3000/api/notifications/test
```

And click the button!

---

## 🧪 Test Two (Your Email)

After Test 1 works, test with your email:

**In Browser Test Page:**
1. Change email from `delivered@resend.dev` to `zerlake@gmail.com`
2. Click "Send Test Email"
3. Wait 5-10 seconds
4. Check Gmail inbox
5. Verify email formatting

---

## ✅ Which Method to Choose?

### If You Like...
- **Visual interface** → Browser Test Page
- **Professional tools** → Postman
- **Quick and simple** → Browser Console
- **In your editor** → VS Code REST Client
- **Integrated testing** → React Component

---

## 💾 All Options in One Place

**Browser Test Page:**
```
http://localhost:3000/api/notifications/test
```

**Postman:**
- Download from https://www.postman.com/downloads/
- Create POST request to `http://localhost:3000/api/notifications/send-student-email`
- Add headers and body

**Browser Console:**
- Press F12
- Go to Console
- Paste JavaScript fetch code

**VS Code REST Client:**
- Install extension
- Create `test-email.http` file
- Click "Send Request"

**React Component:**
- Create component with hook
- Add to page
- Click button in UI

---

## 🚀 Start Testing Now

**Pick one method above and start!**

**Easiest: Browser Test Page**
```
1. pnpm dev
2. Go to http://localhost:3000/api/notifications/test
3. Fill form and click button
4. Done!
```

Come back and tell me which method you choose and what results you get! 🎉

---

## 📞 Need Help?

Tell me:
1. **Which method do you prefer?**
2. **What result did you get?**
3. **Any errors?**

And I'll help you troubleshoot!
