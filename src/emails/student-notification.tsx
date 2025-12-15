/**
 * Legacy React Email Template Component
 * Now replaced by HTML email templates in src/lib/email-templates.ts
 * Kept for backward compatibility if needed in the future
 */

interface StudentNotificationEmailProps {
  studentName?: string;
  senderName?: string;
  senderRole?: 'advisor' | 'critic';
  actionType?: 'feedback' | 'revision-request' | 'milestone-feedback' | 'general-message';
  documentTitle?: string;
  message?: string;
  actionUrl?: string;
  actionButtonText?: string;
}

// Deprecated: Use HTML template from src/lib/email-templates.ts instead
export const StudentNotificationEmail = () => null;

export default StudentNotificationEmail;
