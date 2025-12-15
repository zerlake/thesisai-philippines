/**
 * Legacy React Email Template Component
 * Now replaced by HTML email templates in src/lib/email-templates.ts
 * Kept for backward compatibility if needed in the future
 */

// import * as React from 'react';
// import {
//   Body,
//   Button,
//   Container,
//   Head,
//   Hr,
//   Html,
//   Img,
//   Link,
//   Preview,
//   Row,
//   Section,
//   Text,
// } from 'react-email';

interface AdvisorNotificationEmailProps {
  advisorName?: string;
  studentName?: string;
  actionType?: 'submission' | 'revision' | 'request' | 'milestone';
  documentTitle?: string;
  message?: string;
  actionUrl?: string;
  actionButtonText?: string;
}

// Deprecated: Use HTML template from src/lib/email-templates.ts instead
export const AdvisorNotificationEmail = () => null;

export default AdvisorNotificationEmail;
