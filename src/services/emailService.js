import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/firebase';

// Designated Administrator Email as specified by system requirements
export const DEFAULT_ADMIN_EMAIL =
  import.meta.env.VITE_ADMIN_EMAIL?.trim() || 'shirishabillamanti@gamil.com';

/**
 * Dispatches email notifications to both user and administrator.
 * 1. Writes to Cloud Firestore 'mail' collection (Firebase Trigger Email extension standard).
 * 2. Writes audit log to 'notifications' collection in Firestore.
 * 3. Attempts external webhook dispatch (EmailJS / Formspree / FastAPI endpoint) if configured.
 */
class EmailService {
  constructor() {
    this.adminEmail = DEFAULT_ADMIN_EMAIL;
  }

  /**
   * Queue email document into Firestore for delivery
   */
  async queueFirestoreEmail(to, subject, htmlContent, textContent) {
    if (!isFirebaseConfigured || !db) {
      console.info('[SmartEval Email Engine] Local mock queue for:', to, subject);
      return { queued: true, localOnly: true };
    }

    try {
      // 1. Standard Firebase 'Trigger Email' extension format
      const mailRef = collection(db, 'mail');
      await addDoc(mailRef, {
        to: Array.isArray(to) ? to : [to],
        message: {
          subject,
          text: textContent,
          html: htmlContent,
        },
        createdAt: serverTimestamp(),
      });

      // 2. Audit log for administrator dashboard
      const auditRef = collection(db, 'notifications');
      await addDoc(auditRef, {
        recipient: Array.isArray(to) ? to.join(', ') : to,
        subject,
        type: 'auth_notification',
        status: 'dispatched',
        timestamp: serverTimestamp(),
      });

      return { queued: true, error: null };
    } catch (error) {
      console.warn('[SmartEval Email Service] Firestore queue note:', error.message);
      return { queued: false, error: error.message };
    }
  }

  /**
   * Optional Webhook / REST Dispatch (e.g. EmailJS, Resend, or FastAPI backend)
   */
  async dispatchViaWebhook(to, subject, content) {
    const webhookUrl = import.meta.env.VITE_EMAIL_WEBHOOK_URL;
    if (!webhookUrl) return null;

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          subject,
          content,
          sender: 'SmartEval Automated Notification System',
        }),
      });
      return response.ok;
    } catch (err) {
      console.warn('[SmartEval Email Service] Webhook dispatch warning:', err.message);
      return false;
    }
  }

  /**
   * Send notification emails upon new user registration
   * Sends to BOTH:
   * 1. The registered User
   * 2. The Administrator (shirishabillamanti@gamil.com)
   */
  async sendSignupEmails({ userEmail, userName, role, accountStatus }) {
    const timestamp = new Date().toLocaleString();
    const isTeacher = role === 'teacher' || role === 'teacher_admin';
    const roleLabel = isTeacher ? 'Teacher' : 'Student';
    const statusLabel =
      accountStatus === 'pending'
        ? 'Pending Teacher Approval'
        : 'Active & Verified';

    // 1. Email template for USER
    const userSubject = `Welcome to SmartEval — ${roleLabel} Account Created`;
    const userHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
        <h2 style="color: #0f172a; margin-top: 0;">Welcome to SmartEval, ${userName}!</h2>
        <p style="font-size: 14px; line-height: 1.6;">
          Your <strong>SmartEval</strong> account has been successfully registered on the AI-powered subjective answer evaluation platform.
        </p>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 4px 0; font-size: 13px;"><strong>Registered Email:</strong> ${userEmail}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Assigned Role:</strong> ${roleLabel}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Account Status:</strong> <span style="color: ${accountStatus === 'pending' ? '#d97706' : '#16a34a'}; font-weight: bold;">${statusLabel}</span></p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Registration Time:</strong> ${timestamp}</p>
        </div>
        ${
          accountStatus === 'pending'
            ? `<p style="font-size: 13px; color: #b45309; background: #fffbeb; padding: 12px; border-radius: 6px;">
                <strong>Notice:</strong> Your Student account is pending approval by your course teacher. You will gain access to answer sheet submissions and results once approved.
              </p>`
            : `<p style="font-size: 13px; color: #15803d; background: #f0fdf4; padding: 12px; border-radius: 6px;">
                <strong>Active:</strong> Your Teacher account is active. You have full access to evaluate exams, configure rubrics, and approve student examinees.
              </p>`
        }
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">
          SmartEval — Smarter Evaluation. Better Learning.<br />
          If you did not initiate this registration, please notify <a href="mailto:${this.adminEmail}">${this.adminEmail}</a>.
        </p>
      </div>
    `;

    // 2. Email template for ADMINISTRATOR / INSTRUCTOR
    const adminSubject = `[SmartEval Notification] New ${roleLabel} Registration: ${userName}`;
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 2px solid #0f172a; border-radius: 12px; padding: 24px;">
        <div style="background: #0f172a; color: white; padding: 12px 16px; border-radius: 6px; margin: -24px -24px 20px -24px;">
          <h3 style="margin: 0; font-size: 16px;">SmartEval Platform Notification</h3>
        </div>
        <p style="font-size: 14px;">Notification Alert,</p>
        <p style="font-size: 14px; line-height: 1.6;">
          A new user has completed registration on the SmartEval platform. Here are the account details:
        </p>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0;">
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; font-weight: bold;">User Name:</td><td>${userName}</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; font-weight: bold;">User Email:</td><td>${userEmail}</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; font-weight: bold;">Requested Role:</td><td><strong style="color: #2563eb;">${roleLabel}</strong></td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; font-weight: bold;">Account Status:</td><td><strong style="color: ${accountStatus === 'pending' ? '#d97706' : '#16a34a'};">${statusLabel}</strong></td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; font-weight: bold;">Timestamp:</td><td>${timestamp}</td></tr>
        </table>
        ${
          accountStatus === 'pending'
            ? `<div style="background: #fef3c7; border: 1px solid #fde68a; padding: 12px; border-radius: 8px; margin: 16px 0; font-size: 13px;">
                <strong>Action Required:</strong> This Student account is currently <strong>PENDING</strong> teacher authorization. Teachers can approve this student from the Teacher Evaluation Center under the Student Approvals tab.
              </div>`
            : `<p style="font-size: 12px; color: #64748b;">This Teacher account was provisioned with active evaluation privileges.</p>`
        }
        <p style="font-size: 12px; color: #64748b; margin-top: 24px;">
          Notification sent to designated administrator: <strong>${this.adminEmail}</strong>
        </p>
      </div>
    `;

    // Queue both emails
    const [userRes, adminRes] = await Promise.allSettled([
      this.queueFirestoreEmail(userEmail, userSubject, userHtml, `Welcome to SmartEval, ${userName}! Role: ${roleLabel}`),
      this.queueFirestoreEmail(this.adminEmail, adminSubject, adminHtml, `New SmartEval user: ${userName} (${userEmail})`),
      this.dispatchViaWebhook(userEmail, userSubject, userHtml),
      this.dispatchViaWebhook(this.adminEmail, adminSubject, adminHtml),
    ]);

    return {
      success: true,
      userEmail,
      adminEmail: this.adminEmail,
      userNotified: userRes.status === 'fulfilled',
      adminNotified: adminRes.status === 'fulfilled',
    };
  }

  /**
   * Send notification emails upon user login
   * Sends to BOTH:
   * 1. The authenticated User (Security Alert)
   * 2. The Administrator (shirishabillamanti@gamil.com) (Audit log)
   */
  async sendLoginEmails({ userEmail, userName, role }) {
    const timestamp = new Date().toLocaleString();
    const roleLabel = role === 'teacher_admin' ? 'Teacher / Admin' : 'Student';

    // 1. Email to USER
    const userSubject = `Security Alert: New Sign-In to SmartEval`;
    const userHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
        <h3 style="color: #0f172a; margin-top: 0;">New Sign-In Detected</h3>
        <p style="font-size: 14px; line-height: 1.6;">
          Hello ${userName || userEmail},
        </p>
        <p style="font-size: 14px; line-height: 1.6;">
          Your SmartEval account was just accessed with successful credential verification.
        </p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 13px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>Account:</strong> ${userEmail}</p>
          <p style="margin: 4px 0;"><strong>Role:</strong> ${roleLabel}</p>
          <p style="margin: 4px 0;"><strong>Date & Time:</strong> ${timestamp}</p>
        </div>
        <p style="font-size: 12px; color: #64748b;">
          If this was you, no action is needed. If you did not sign in, please reset your password immediately or contact <a href="mailto:${this.adminEmail}">${this.adminEmail}</a>.
        </p>
      </div>
    `;

    // 2. Email to ADMINISTRATOR (shirishabillamanti@gamil.com)
    const adminSubject = `[SmartEval Audit] User Sign-In: ${userEmail}`;
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #cbd5e1; border-radius: 12px; padding: 24px;">
        <h3 style="color: #0f172a; margin-top: 0;">Audit Log: User Sign-In Event</h3>
        <p style="font-size: 14px;">Administrator Security Audit,</p>
        <div style="background: #f1f5f9; padding: 12px; border-radius: 8px; font-size: 13px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>User Email:</strong> ${userEmail}</p>
          <p style="margin: 4px 0;"><strong>Name:</strong> ${userName || 'N/A'}</p>
          <p style="margin: 4px 0;"><strong>Role:</strong> ${roleLabel}</p>
          <p style="margin: 4px 0;"><strong>Authentication Time:</strong> ${timestamp}</p>
          <p style="margin: 4px 0;"><strong>Credential Match:</strong> <span style="color: #16a34a; font-weight: bold;">Verified</span></p>
        </div>
        <p style="font-size: 12px; color: #64748b;">
          Automated SmartEval Authentication Audit &bull; Admin: ${this.adminEmail}
        </p>
      </div>
    `;

    // Queue both emails
    await Promise.allSettled([
      this.queueFirestoreEmail(userEmail, userSubject, userHtml, `New sign-in to SmartEval on ${timestamp}`),
      this.queueFirestoreEmail(this.adminEmail, adminSubject, adminHtml, `SmartEval Sign-In audit: ${userEmail} at ${timestamp}`),
      this.dispatchViaWebhook(userEmail, userSubject, userHtml),
      this.dispatchViaWebhook(this.adminEmail, adminSubject, adminHtml),
    ]);

    return {
      success: true,
      userEmail,
      adminEmail: this.adminEmail,
    };
  }
}

export const emailService = new EmailService();
export default emailService;
