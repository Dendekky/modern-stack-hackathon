import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface TicketCreatedEmailData {
  to: string;
  customerName: string;
  ticketId: string;
  ticketTitle: string;
  ticketDescription: string;
}

export interface TicketStatusEmailData {
  to: string;
  customerName: string;
  ticketId: string;
  ticketTitle: string;
  status: string;
  agentName?: string;
}

export interface WelcomeEmailData {
  to: string;
  name: string;
  role: 'customer' | 'agent';
}

export interface SignInEmailData {
  to: string;
  name: string;
  loginTime: string;
}

export async function sendTicketCreatedEmail(data: TicketCreatedEmailData) {
  try {
    const { error } = await resend.emails.send({
      from: 'Support <support@yourdomain.com>',
      to: [data.to],
      subject: `Ticket Created: ${data.ticketTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Support Ticket Created</h2>
          
          <p>Hello ${data.customerName},</p>
          
          <p>Your support ticket has been successfully created and our team will respond as soon as possible.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Ticket Details</h3>
            <p><strong>Ticket ID:</strong> ${data.ticketId}</p>
            <p><strong>Subject:</strong> ${data.ticketTitle}</p>
            <p><strong>Description:</strong> ${data.ticketDescription}</p>
          </div>
          
          <p>You can track the progress of your ticket in your customer portal.</p>
          
          <p>Best regards,<br>Support Team</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending ticket created email:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to send ticket created email:', error);
    throw error;
  }
}

export async function sendTicketStatusEmail(data: TicketStatusEmailData) {
  try {
    const statusMessages = {
      in_progress: 'is now being worked on',
      resolved: 'has been resolved',
      closed: 'has been closed',
    };

    const statusMessage = statusMessages[data.status as keyof typeof statusMessages] || `status has been updated to ${data.status}`;

    const { error } = await resend.emails.send({
      from: 'Support <support@yourdomain.com>',
      to: [data.to],
      subject: `Ticket Update: ${data.ticketTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Support Ticket Update</h2>
          
          <p>Hello ${data.customerName},</p>
          
          <p>Your support ticket <strong>${data.ticketTitle}</strong> ${statusMessage}.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Ticket Details</h3>
            <p><strong>Ticket ID:</strong> ${data.ticketId}</p>
            <p><strong>Status:</strong> <span style="background-color: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px;">${data.status.replace('_', ' ').toUpperCase()}</span></p>
            ${data.agentName ? `<p><strong>Assigned Agent:</strong> ${data.agentName}</p>` : ''}
          </div>
          
          <p>You can view more details in your customer portal.</p>
          
          <p>Best regards,<br>Support Team</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending ticket status email:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to send ticket status email:', error);
    throw error;
  }
}

export async function sendWelcomeEmail(data: WelcomeEmailData) {
  try {
    const roleText = data.role === 'agent' ? 'Support Agent' : 'Customer';
    const welcomeMessage = data.role === 'agent' 
      ? 'Welcome to our support team! You can now start helping customers and managing tickets.'
      : 'Welcome! You can now create support tickets and track their progress.';

    const { error } = await resend.emails.send({
      from: 'Support <support@yourdomain.com>',
      to: [data.to],
      subject: `Welcome to Support Platform - ${roleText}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to Support Platform!</h2>
          
          <p>Hello ${data.name},</p>
          
          <p>Thank you for joining our support platform as a ${roleText.toLowerCase()}.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Getting Started</h3>
            <p>${welcomeMessage}</p>
            ${data.role === 'agent' ? `
              <p><strong>Agent Features:</strong></p>
              <ul>
                <li>View and manage all customer tickets</li>
                <li>Update ticket status and assignments</li>
                <li>Access AI-powered suggestions</li>
                <li>Use knowledge base for quick responses</li>
              </ul>
            ` : `
              <p><strong>Customer Features:</strong></p>
              <ul>
                <li>Create and track support tickets</li>
                <li>Receive real-time updates</li>
                <li>Access your ticket history</li>
                <li>Get help from our AI assistant</li>
              </ul>
            `}
          </div>
          
          <p>If you have any questions, don't hesitate to reach out to our team.</p>
          
          <p>Best regards,<br>Support Team</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
}

export async function sendSignInNotificationEmail(data: SignInEmailData) {
  try {
    const { error } = await resend.emails.send({
      from: 'Support <support@yourdomain.com>',
      to: [data.to],
      subject: 'Sign-in Notification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Sign-in Notification</h2>
          
          <p>Hello ${data.name},</p>
          
          <p>You have successfully signed in to your support platform account.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Sign-in Details</h3>
            <p><strong>Time:</strong> ${data.loginTime}</p>
            <p><strong>Account:</strong> ${data.to}</p>
          </div>
          
          <p>If this wasn't you, please contact our support team immediately.</p>
          
          <p>Best regards,<br>Support Team</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending signin notification email:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to send signin notification email:', error);
    throw error;
  }
}
