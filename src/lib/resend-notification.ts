import { Resend } from 'resend';
import { generateAdvisorNotificationEmail, generateStudentNotificationEmail } from './email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendNotificationEmailProps {
  to: string;
  advisorName?: string;
  studentName?: string;
  actionType?: 'submission' | 'revision' | 'request' | 'milestone';
  documentTitle?: string;
  message?: string;
  actionUrl?: string;
  actionButtonText?: string;
}

export async function sendNotificationEmail({
  to,
  advisorName = 'Advisor',
  studentName = 'Student',
  actionType = 'submission',
  documentTitle = 'Thesis Document',
  message = 'A student has submitted new content for review.',
  actionUrl = 'https://thesisai-philippines.vercel.app/dashboard',
  actionButtonText = 'Review Now',
}: SendNotificationEmailProps) {
  try {
    const emailHtml = generateAdvisorNotificationEmail({
      advisorName,
      studentName,
      actionType,
      documentTitle,
      message,
      actionUrl,
      actionButtonText,
    });

    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@thesisai-philippines.com',
      to,
      subject: getEmailSubject(actionType, studentName),
      html: emailHtml,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send notification email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
}

function getEmailSubject(
  actionType: 'submission' | 'revision' | 'request' | 'milestone',
  studentName: string
): string {
  switch (actionType) {
    case 'submission':
      return `📄 New Document from ${studentName} - Review Needed`;
    case 'revision':
      return `✏️ Revision Ready from ${studentName}`;
    case 'request':
      return `❓ Help Requested by ${studentName}`;
    case 'milestone':
      return `🎉 ${studentName} Reached a Milestone!`;
    default:
      return `New Activity from ${studentName}`;
  }
}

/**
 * Send a notification email to an advisor about a student submission
 */
export async function notifyAdvisorOfSubmission(
  advisorEmail: string,
  advisorName: string,
  studentName: string,
  documentTitle: string,
  documentId: string
) {
  return sendNotificationEmail({
    to: advisorEmail,
    advisorName,
    studentName,
    actionType: 'submission',
    documentTitle,
    message: `${studentName} has submitted "${documentTitle}" for your review.`,
    actionUrl: `https://thesisai-philippines.vercel.app/advisor/students/${documentId}`,
    actionButtonText: 'Review Document',
  });
}

/**
 * Send a notification email to an advisor about a student revision
 */
export async function notifyAdvisorOfRevision(
  advisorEmail: string,
  advisorName: string,
  studentName: string,
  documentTitle: string,
  documentId: string
) {
  return sendNotificationEmail({
    to: advisorEmail,
    advisorName,
    studentName,
    actionType: 'revision',
    documentTitle,
    message: `${studentName} has submitted a revision to "${documentTitle}" based on your feedback.`,
    actionUrl: `https://thesisai-philippines.vercel.app/advisor/students/${documentId}`,
    actionButtonText: 'View Revision',
  });
}

/**
 * Send a notification email to an advisor about a student request
 */
export async function notifyAdvisorOfRequest(
  advisorEmail: string,
  advisorName: string,
  studentName: string,
  requestType: string,
  studentId: string
) {
  return sendNotificationEmail({
    to: advisorEmail,
    advisorName,
    studentName,
    actionType: 'request',
    documentTitle: requestType,
    message: `${studentName} has requested your help with: ${requestType}`,
    actionUrl: `https://thesisai-philippines.vercel.app/advisor/students/${studentId}`,
    actionButtonText: 'View Request',
  });
}

/**
 * Send a notification email to an advisor about a student milestone
 */
export async function notifyAdvisorOfMilestone(
  advisorEmail: string,
  advisorName: string,
  studentName: string,
  milestoneName: string,
  studentId: string
) {
  return sendNotificationEmail({
    to: advisorEmail,
    advisorName,
    studentName,
    actionType: 'milestone',
    documentTitle: milestoneName,
    message: `🎉 Congratulations! ${studentName} has completed the "${milestoneName}" milestone in their thesis.`,
    actionUrl: `https://thesisai-philippines.vercel.app/advisor/students/${studentId}`,
    actionButtonText: 'View Progress',
  });
}

// ============================================
// STUDENT NOTIFICATION FUNCTIONS
// ============================================

export interface SendStudentNotificationEmailProps {
  to: string;
  studentName?: string;
  senderName?: string;
  senderRole?: 'advisor' | 'critic';
  actionType?: 'feedback' | 'revision-request' | 'milestone-feedback' | 'general-message';
  documentTitle?: string;
  message?: string;
  actionUrl?: string;
  actionButtonText?: string;
}

/**
 * Send a notification email to a student (generic)
 */
export async function sendStudentNotificationEmail({
  to,
  studentName = 'Student',
  senderName = 'Mentor',
  senderRole = 'advisor',
  actionType = 'feedback',
  documentTitle = 'Thesis Document',
  message = 'You have received feedback on your submission.',
  actionUrl = 'https://thesisai-philippines.vercel.app/dashboard',
  actionButtonText = 'View Feedback',
}: SendStudentNotificationEmailProps) {
  try {
    const emailHtml = generateStudentNotificationEmail({
      studentName,
      senderName,
      senderRole,
      actionType,
      documentTitle,
      message,
      actionUrl,
      actionButtonText,
    });

    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@thesisai-philippines.com',
      to,
      subject: getStudentEmailSubject(actionType, senderName),
      html: emailHtml,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send student notification email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
}

function getStudentEmailSubject(
  actionType: 'feedback' | 'revision-request' | 'milestone-feedback' | 'general-message',
  senderName: string
): string {
  switch (actionType) {
    case 'feedback':
      return `💬 Feedback from ${senderName}`;
    case 'revision-request':
      return `✏️ Revision Requested by ${senderName}`;
    case 'milestone-feedback':
      return `🎯 Milestone Feedback from ${senderName}`;
    case 'general-message':
      return `📩 Message from ${senderName}`;
    default:
      return `Update from ${senderName}`;
  }
}

/**
 * Send a notification email to a student about advisor feedback
 */
export async function notifyStudentOfAdvisorFeedback(
  studentEmail: string,
  studentName: string,
  advisorName: string,
  documentTitle: string,
  documentId: string
) {
  return sendStudentNotificationEmail({
    to: studentEmail,
    studentName,
    senderName: advisorName,
    senderRole: 'advisor',
    actionType: 'feedback',
    documentTitle,
    message: `Your advisor ${advisorName} has provided feedback on "${documentTitle}".`,
    actionUrl: `https://thesisai-philippines.vercel.app/drafts/${documentId}`,
    actionButtonText: 'View Feedback',
  });
}

/**
 * Send a notification email to a student about critic feedback
 */
export async function notifyStudentOfCriticFeedback(
  studentEmail: string,
  studentName: string,
  criticName: string,
  documentTitle: string,
  documentId: string
) {
  return sendStudentNotificationEmail({
    to: studentEmail,
    studentName,
    senderName: criticName,
    senderRole: 'critic',
    actionType: 'feedback',
    documentTitle,
    message: `Your critic ${criticName} has provided feedback on "${documentTitle}".`,
    actionUrl: `https://thesisai-philippines.vercel.app/drafts/${documentId}`,
    actionButtonText: 'View Feedback',
  });
}

/**
 * Send a notification email to a student about a revision request
 */
export async function notifyStudentOfRevisionRequest(
  studentEmail: string,
  studentName: string,
  requesterName: string,
  requesterRole: 'advisor' | 'critic',
  documentTitle: string,
  documentId: string
) {
  return sendStudentNotificationEmail({
    to: studentEmail,
    studentName,
    senderName: requesterName,
    senderRole: requesterRole,
    actionType: 'revision-request',
    documentTitle,
    message: `${requesterName} has requested revisions to "${documentTitle}".`,
    actionUrl: `https://thesisai-philippines.vercel.app/drafts/${documentId}`,
    actionButtonText: 'View Revision Request',
  });
}

/**
 * Send a notification email to a student about milestone feedback
 */
export async function notifyStudentOfMilestoneFeedback(
  studentEmail: string,
  studentName: string,
  senderName: string,
  senderRole: 'advisor' | 'critic',
  milestoneName: string,
  feedbackMessage: string
) {
  return sendStudentNotificationEmail({
    to: studentEmail,
    studentName,
    senderName,
    senderRole,
    actionType: 'milestone-feedback',
    documentTitle: milestoneName,
    message: feedbackMessage,
    actionUrl: 'https://thesisai-philippines.vercel.app/dashboard',
    actionButtonText: 'View Dashboard',
  });
}

// ============================================
// ADVISOR-TO-STUDENT NOTIFICATION FUNCTIONS
// ============================================

export interface SendAdvisorToStudentNotificationEmailProps {
  to: string;
  studentName?: string;
  advisorName?: string;
  actionType?: 'feedback' | 'revision-request' | 'milestone-feedback' | 'general-message';
  documentTitle?: string;
  message?: string;
  actionUrl?: string;
  actionButtonText?: string;
}

/**
 * Send a notification email from an advisor to a student (generic)
 */
export async function sendAdvisorToStudentNotificationEmail({
  to,
  studentName = 'Student',
  advisorName = 'Advisor',
  actionType = 'feedback',
  documentTitle = 'Thesis Document',
  message = 'Your advisor has sent you a message.',
  actionUrl = 'https://thesisai-philippines.vercel.app/dashboard',
  actionButtonText = 'View Message',
}: SendAdvisorToStudentNotificationEmailProps) {
  try {
    const emailHtml = generateStudentNotificationEmail({
      studentName,
      senderName: advisorName,
      senderRole: 'advisor',
      actionType,
      documentTitle,
      message,
      actionUrl,
      actionButtonText,
    });

    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@thesisai-philippines.com',
      to,
      subject: getAdvisorToStudentEmailSubject(actionType, advisorName),
      html: emailHtml,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send advisor-to-student notification email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
}

function getAdvisorToStudentEmailSubject(
  actionType: 'feedback' | 'revision-request' | 'milestone-feedback' | 'general-message',
  advisorName: string
): string {
  switch (actionType) {
    case 'feedback':
      return `💬 Feedback from Advisor ${advisorName}`;
    case 'revision-request':
      return `✏️ Revision Requested by ${advisorName}`;
    case 'milestone-feedback':
      return `🎯 Milestone Feedback from ${advisorName}`;
    case 'general-message':
      return `📩 Message from ${advisorName}`;
    default:
      return `Update from ${advisorName}`;
  }
}

/**
 * Send feedback email from advisor to student
 */
export async function notifyStudentOfAdvisorMessage(
  studentEmail: string,
  studentName: string,
  advisorName: string,
  documentTitle: string,
  documentId: string,
  feedbackMessage: string
) {
  return sendAdvisorToStudentNotificationEmail({
    to: studentEmail,
    studentName,
    advisorName,
    actionType: 'feedback',
    documentTitle,
    message: feedbackMessage,
    actionUrl: `https://thesisai-philippines.vercel.app/drafts/${documentId}`,
    actionButtonText: 'View Feedback',
  });
}

/**
 * Send revision request email from advisor to student
 */
export async function notifyStudentOfAdvisorRevisionRequest(
  studentEmail: string,
  studentName: string,
  advisorName: string,
  documentTitle: string,
  documentId: string,
  revisionMessage: string
) {
  return sendAdvisorToStudentNotificationEmail({
    to: studentEmail,
    studentName,
    advisorName,
    actionType: 'revision-request',
    documentTitle,
    message: revisionMessage,
    actionUrl: `https://thesisai-philippines.vercel.app/drafts/${documentId}`,
    actionButtonText: 'View Revision Request',
  });
}

/**
 * Send milestone feedback email from advisor to student
 */
export async function notifyStudentOfAdvisorMilestoneFeedback(
  studentEmail: string,
  studentName: string,
  advisorName: string,
  milestoneName: string,
  feedbackMessage: string
) {
  return sendAdvisorToStudentNotificationEmail({
    to: studentEmail,
    studentName,
    advisorName,
    actionType: 'milestone-feedback',
    documentTitle: milestoneName,
    message: feedbackMessage,
    actionUrl: 'https://thesisai-philippines.vercel.app/dashboard',
    actionButtonText: 'View Dashboard',
  });
}

// ============================================
// CRITIC-TO-STUDENT NOTIFICATION FUNCTIONS
// ============================================

export interface SendCriticToStudentNotificationEmailProps {
  to: string;
  studentName?: string;
  criticName?: string;
  actionType?: 'feedback' | 'revision-request' | 'milestone-feedback' | 'general-message';
  documentTitle?: string;
  message?: string;
  actionUrl?: string;
  actionButtonText?: string;
}

/**
 * Send a notification email from a critic to a student (generic)
 */
export async function sendCriticToStudentNotificationEmail({
  to,
  studentName = 'Student',
  criticName = 'Critic',
  actionType = 'feedback',
  documentTitle = 'Thesis Document',
  message = 'Your critic has sent you a message.',
  actionUrl = 'https://thesisai-philippines.vercel.app/dashboard',
  actionButtonText = 'View Message',
}: SendCriticToStudentNotificationEmailProps) {
  try {
    const emailHtml = generateStudentNotificationEmail({
      studentName,
      senderName: criticName,
      senderRole: 'critic',
      actionType,
      documentTitle,
      message,
      actionUrl,
      actionButtonText,
    });

    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@thesisai-philippines.com',
      to,
      subject: getCriticToStudentEmailSubject(actionType, criticName),
      html: emailHtml,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send critic-to-student notification email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
}

function getCriticToStudentEmailSubject(
  actionType: 'feedback' | 'revision-request' | 'milestone-feedback' | 'general-message',
  criticName: string
): string {
  switch (actionType) {
    case 'feedback':
      return `💬 Critical Feedback from ${criticName}`;
    case 'revision-request':
      return `✏️ Revision Requested by ${criticName}`;
    case 'milestone-feedback':
      return `🎯 Milestone Feedback from ${criticName}`;
    case 'general-message':
      return `📩 Message from Critic ${criticName}`;
    default:
      return `Update from ${criticName}`;
  }
}

/**
 * Send feedback email from critic to student
 */
export async function notifyStudentOfCriticMessage(
  studentEmail: string,
  studentName: string,
  criticName: string,
  documentTitle: string,
  documentId: string,
  feedbackMessage: string
) {
  return sendCriticToStudentNotificationEmail({
    to: studentEmail,
    studentName,
    criticName,
    actionType: 'feedback',
    documentTitle,
    message: feedbackMessage,
    actionUrl: `https://thesisai-philippines.vercel.app/drafts/${documentId}`,
    actionButtonText: 'View Feedback',
  });
}

/**
 * Send revision request email from critic to student
 */
export async function notifyStudentOfCriticRevisionRequest(
  studentEmail: string,
  studentName: string,
  criticName: string,
  documentTitle: string,
  documentId: string,
  revisionMessage: string
) {
  return sendCriticToStudentNotificationEmail({
    to: studentEmail,
    studentName,
    criticName,
    actionType: 'revision-request',
    documentTitle,
    message: revisionMessage,
    actionUrl: `https://thesisai-philippines.vercel.app/drafts/${documentId}`,
    actionButtonText: 'View Revision Request',
  });
}

/**
 * Send milestone feedback email from critic to student
 */
export async function notifyStudentOfCriticMilestoneFeedback(
  studentEmail: string,
  studentName: string,
  criticName: string,
  milestoneName: string,
  feedbackMessage: string
) {
  return sendCriticToStudentNotificationEmail({
    to: studentEmail,
    studentName,
    criticName,
    actionType: 'milestone-feedback',
    documentTitle: milestoneName,
    message: feedbackMessage,
    actionUrl: 'https://thesisai-philippines.vercel.app/dashboard',
    actionButtonText: 'View Dashboard',
  });
}

// ============================================
// ORIGINAL ADVISOR-TO-STUDENT NOTIFICATION FUNCTIONS (DEPRECATED)
// ============================================

export interface SendCriticNotificationEmailProps {
  to: string;
  criticName?: string;
  studentName?: string;
  actionType?: 'submission' | 'revision' | 'request' | 'milestone';
  documentTitle?: string;
  message?: string;
  actionUrl?: string;
  actionButtonText?: string;
}

/**
 * Send a notification email to a critic about a student submission
 * Uses the same template as advisor notifications but with "Critic" label
 */
export async function notifyCriticOfSubmission(
  criticEmail: string,
  criticName: string,
  studentName: string,
  documentTitle: string,
  documentId: string
) {
  return sendNotificationEmail({
    to: criticEmail,
    advisorName: criticName,
    studentName,
    actionType: 'submission',
    documentTitle,
    message: `${studentName} has submitted "${documentTitle}" for your critical review.`,
    actionUrl: `https://thesisai-philippines.vercel.app/critic/students/${documentId}`,
    actionButtonText: 'Review Document',
  });
}

/**
 * Send a notification email to a critic about a student revision
 */
export async function notifyCriticOfRevision(
  criticEmail: string,
  criticName: string,
  studentName: string,
  documentTitle: string,
  documentId: string
) {
  return sendNotificationEmail({
    to: criticEmail,
    advisorName: criticName,
    studentName,
    actionType: 'revision',
    documentTitle,
    message: `${studentName} has submitted a revision to "${documentTitle}" based on your feedback.`,
    actionUrl: `https://thesisai-philippines.vercel.app/critic/students/${documentId}`,
    actionButtonText: 'View Revision',
  });
}

/**
 * Send a notification email to a critic about a student request
 */
export async function notifyCriticOfRequest(
  criticEmail: string,
  criticName: string,
  studentName: string,
  requestType: string,
  studentId: string
) {
  return sendNotificationEmail({
    to: criticEmail,
    advisorName: criticName,
    studentName,
    actionType: 'request',
    documentTitle: requestType,
    message: `${studentName} has requested your critical review: ${requestType}`,
    actionUrl: `https://thesisai-philippines.vercel.app/critic/students/${studentId}`,
    actionButtonText: 'View Request',
  });
}

/**
 * Send a notification email to a critic about a student milestone
 */
export async function notifyCriticOfMilestone(
  criticEmail: string,
  criticName: string,
  studentName: string,
  milestoneName: string,
  studentId: string
) {
  return sendNotificationEmail({
    to: criticEmail,
    advisorName: criticName,
    studentName,
    actionType: 'milestone',
    documentTitle: milestoneName,
    message: `🎉 ${studentName} has completed the "${milestoneName}" milestone in their thesis.`,
    actionUrl: `https://thesisai-philippines.vercel.app/critic/students/${studentId}`,
    actionButtonText: 'View Progress',
  });
}
