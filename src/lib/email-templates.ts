/**
 * Email template HTML generation (server-side)
 * This file contains plain HTML email templates to avoid Turbopack/react-email issues
 */

export function generateAdvisorNotificationEmail({
  advisorName = 'Advisor',
  studentName = 'Student',
  actionType = 'submission',
  documentTitle = 'Thesis Document',
  message = 'A student has submitted new content for review.',
  actionUrl = 'https://thesisai-philippines.vercel.app/dashboard',
  actionButtonText = 'Review Now',
}: {
  advisorName?: string;
  studentName?: string;
  actionType?: 'submission' | 'revision' | 'request' | 'milestone';
  documentTitle?: string;
  message?: string;
  actionUrl?: string;
  actionButtonText?: string;
}): string {
  const getTitle = () => {
    switch (actionType) {
      case 'submission':
        return `New Document Submission from ${studentName}`;
      case 'revision':
        return `Revision Ready from ${studentName}`;
      case 'request':
        return `Student Request from ${studentName}`;
      case 'milestone':
        return `Milestone Achievement from ${studentName}`;
      default:
        return `New Activity from ${studentName}`;
    }
  };

  const getIcon = () => {
    switch (actionType) {
      case 'submission':
        return '📄';
      case 'revision':
        return '✏️';
      case 'request':
        return '❓';
      case 'milestone':
        return '🎉';
      default:
        return '📩';
    }
  };

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${getTitle()} - ThesisAI Philippines</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f3f4f6;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        margin-bottom: 64px;
        margin-top: 32px;
        margin-left: 8px;
        margin-right: 8px;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        overflow: hidden;
      }
      .header {
        background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
        padding: 32px 24px;
        text-align: center;
      }
      .header-title {
        color: #ffffff;
        font-size: 24px;
        font-weight: bold;
        margin: 0;
      }
      .content {
        padding: 32px 24px;
      }
      .greeting {
        font-size: 16px;
        font-weight: 500;
        color: #1f2937;
        margin-bottom: 16px;
        margin: 0;
      }
      .title {
        font-size: 20px;
        font-weight: 600;
        color: #1f2937;
        margin: 16px 0;
      }
      .message {
        font-size: 14px;
        color: #4b5563;
        line-height: 1.6;
        margin: 24px 0;
      }
      .document-card {
        background-color: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        padding: 16px;
        margin: 24px 0;
      }
      .document-title {
        font-size: 14px;
        font-weight: 600;
        color: #1f2937;
        margin: 0;
      }
      .button {
        background-color: #3b82f6;
        border-radius: 6px;
        color: #fff;
        font-size: 14px;
        font-weight: 600;
        padding: 12px 32px;
        text-decoration: none;
        text-align: center;
        display: inline-block;
        margin: 24px 0;
      }
      .divider {
        border: none;
        border-top: 1px solid #e5e7eb;
        margin: 24px 0;
      }
      .footer-text {
        font-size: 12px;
        color: #6b7280;
        line-height: 1.6;
        margin: 16px 0;
      }
      .footer-link {
        color: #3b82f6;
        text-decoration: underline;
      }
      .footer-section {
        background-color: #f9fafb;
        padding: 24px;
        border-top: 1px solid #e5e7eb;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="header-title">ThesisAI Philippines</div>
      </div>
      
      <div class="content">
        <p class="greeting">Hi ${advisorName},</p>
        <h2 class="title">${getIcon()} ${getTitle()}</h2>
        <p class="message">${message}</p>
        
        <div class="document-card">
          <p class="document-title">📌 ${documentTitle}</p>
        </div>
        
        <a href="${actionUrl}" class="button">${actionButtonText}</a>
        
        <hr class="divider">
        
        <p class="footer-text">
          You're receiving this email because you are an advisor on ThesisAI Philippines.<br/>
          <a href="${actionUrl}" class="footer-link">View your dashboard</a>
        </p>
      </div>
      
      <div class="footer-section">
        <p class="footer-text">
          © 2025 ThesisAI Philippines. All rights reserved.
        </p>
        <p class="footer-text">
          <a href="https://thesisai-philippines.vercel.app" class="footer-link">Visit Website</a> |
          <a href="https://thesisai-philippines.vercel.app/privacy-policy" class="footer-link">Privacy Policy</a>
        </p>
      </div>
    </div>
  </body>
</html>
  `;
}

export function generateStudentNotificationEmail({
  studentName = 'Student',
  senderName = 'Mentor',
  senderRole = 'advisor',
  actionType = 'feedback',
  documentTitle = 'Thesis Document',
  message = 'You have received feedback on your submission.',
  actionUrl = 'https://thesisai-philippines.vercel.app/dashboard',
  actionButtonText = 'View Feedback',
}: {
  studentName?: string;
  senderName?: string;
  senderRole?: 'advisor' | 'critic';
  actionType?: 'feedback' | 'revision-request' | 'milestone-feedback' | 'general-message';
  documentTitle?: string;
  message?: string;
  actionUrl?: string;
  actionButtonText?: string;
}): string {
  const getTitle = () => {
    switch (actionType) {
      case 'feedback':
        return `Feedback from ${senderRole === 'advisor' ? 'Your Advisor' : 'Your Critic'}: ${senderName}`;
      case 'revision-request':
        return `Revision Requested by ${senderName}`;
      case 'milestone-feedback':
        return `Milestone Feedback from ${senderName}`;
      case 'general-message':
        return `Message from ${senderName}`;
      default:
        return `Update from ${senderName}`;
    }
  };

  const getIcon = () => {
    switch (actionType) {
      case 'feedback':
        return '💬';
      case 'revision-request':
        return '✏️';
      case 'milestone-feedback':
        return '🎯';
      case 'general-message':
        return '📩';
      default:
        return '📬';
    }
  };

  const getRoleLabel = () => {
    return senderRole === 'advisor' ? 'Advisor' : 'Critic';
  };

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${getTitle()} - ThesisAI Philippines</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f3f4f6;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        margin-bottom: 64px;
        margin-top: 32px;
        margin-left: 8px;
        margin-right: 8px;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        overflow: hidden;
      }
      .header {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        padding: 32px 24px;
        text-align: center;
      }
      .header-title {
        color: #ffffff;
        font-size: 24px;
        font-weight: bold;
        margin: 0;
      }
      .content {
        padding: 32px 24px;
      }
      .greeting {
        font-size: 16px;
        font-weight: 500;
        color: #1f2937;
        margin-bottom: 16px;
        margin: 0;
      }
      .title {
        font-size: 20px;
        font-weight: 600;
        color: #1f2937;
        margin: 16px 0;
      }
      .role-tag {
        background-color: #d1fae5;
        border: 1px solid #6ee7b7;
        border-radius: 4px;
        padding: 8px 12px;
        margin: 16px 0;
        display: inline-block;
      }
      .role-tag-text {
        font-size: 12px;
        font-weight: 600;
        color: #065f46;
        margin: 0;
      }
      .message {
        font-size: 14px;
        color: #4b5563;
        line-height: 1.6;
        margin: 24px 0;
      }
      .document-card {
        background-color: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        padding: 16px;
        margin: 24px 0;
      }
      .document-title {
        font-size: 14px;
        font-weight: 600;
        color: #1f2937;
        margin: 0;
      }
      .button {
        background-color: #10b981;
        border-radius: 6px;
        color: #fff;
        font-size: 14px;
        font-weight: 600;
        padding: 12px 32px;
        text-decoration: none;
        text-align: center;
        display: inline-block;
        margin: 24px 0;
      }
      .divider {
        border: none;
        border-top: 1px solid #e5e7eb;
        margin: 24px 0;
      }
      .footer-text {
        font-size: 12px;
        color: #6b7280;
        line-height: 1.6;
        margin: 16px 0;
      }
      .footer-link {
        color: #10b981;
        text-decoration: underline;
      }
      .footer-section {
        background-color: #f9fafb;
        padding: 24px;
        border-top: 1px solid #e5e7eb;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="header-title">ThesisAI Philippines</div>
      </div>
      
      <div class="content">
        <p class="greeting">Hi ${studentName},</p>
        <h2 class="title">${getIcon()} ${getTitle()}</h2>
        
        <div class="role-tag">
          <p class="role-tag-text">${getRoleLabel()} ${senderRole === 'advisor' ? '👨‍🏫' : '👁️'}</p>
        </div>
        
        <p class="message">${message}</p>
        
        <div class="document-card">
          <p class="document-title">📌 ${documentTitle}</p>
        </div>
        
        <a href="${actionUrl}" class="button">${actionButtonText}</a>
        
        <hr class="divider">
        
        <p class="footer-text">
          You're receiving this email because ${senderName} has provided feedback on your thesis work in ThesisAI Philippines.<br/>
          <a href="${actionUrl}" class="footer-link">Access your dashboard</a>
        </p>
      </div>
      
      <div class="footer-section">
        <p class="footer-text">
          © 2025 ThesisAI Philippines. All rights reserved.
        </p>
        <p class="footer-text">
          <a href="https://thesisai-philippines.vercel.app" class="footer-link">Visit Website</a> |
          <a href="https://thesisai-philippines.vercel.app/privacy-policy" class="footer-link">Privacy Policy</a>
        </p>
      </div>
    </div>
  </body>
</html>
  `;
}
