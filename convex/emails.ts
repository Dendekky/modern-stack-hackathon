import { action } from "./_generated/server";
import { v } from "convex/values";

// Server-side email sending action using Resend
export const sendTicketCreatedEmail = action({
  args: {
    to: v.string(),
    customerName: v.string(),
    ticketId: v.string(),
    ticketTitle: v.string(),
    ticketDescription: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Use Resend to send the actual email
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      const { data, error } = await resend.emails.send({
        from: 'Support <support@notif.dendekky.com>',
        to: [args.to],
        subject: `Ticket Created: ${args.ticketTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Support Ticket Created</h2>
            
            <p>Hello ${args.customerName},</p>
            
            <p>Your support ticket has been successfully created and our team will respond as soon as possible.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #374151;">Ticket Details</h3>
              <p><strong>Ticket ID:</strong> ${args.ticketId}</p>
              <p><strong>Subject:</strong> ${args.ticketTitle}</p>
              <p><strong>Description:</strong> ${args.ticketDescription}</p>
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

      console.log("Ticket created email sent successfully:", {
        to: args.to,
        emailId: data?.id,
        ticketId: args.ticketId,
      });

      return { success: true, emailId: data?.id };
    } catch (error) {
      console.error('Failed to send ticket created email:', error);
      // Don't throw - we don't want ticket creation to fail because of email issues
      return { success: false, error: error.message };
    }
  },
});

export const sendTicketStatusEmail = action({
  args: {
    to: v.string(),
    customerName: v.string(),
    ticketId: v.string(),
    ticketTitle: v.string(),
    status: v.string(),
    agentName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // Use Resend to send the actual email
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      const statusMessages = {
        in_progress: 'is now being worked on',
        resolved: 'has been resolved',
        closed: 'has been closed',
      };

      const statusMessage = statusMessages[args.status as keyof typeof statusMessages] || `status has been updated to ${args.status}`;

      const { data, error } = await resend.emails.send({
        from: 'Support <support@notif.dendekky.com>',
        to: [args.to],
        subject: `Ticket Update: ${args.ticketTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Support Ticket Update</h2>
            
            <p>Hello ${args.customerName},</p>
            
            <p>Your support ticket <strong>${args.ticketTitle}</strong> ${statusMessage}.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #374151;">Ticket Details</h3>
              <p><strong>Ticket ID:</strong> ${args.ticketId}</p>
              <p><strong>Status:</strong> <span style="background-color: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px;">${args.status.replace('_', ' ').toUpperCase()}</span></p>
              ${args.agentName ? `<p><strong>Assigned Agent:</strong> ${args.agentName}</p>` : ''}
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

      console.log("Ticket status email sent successfully:", {
        to: args.to,
        emailId: data?.id,
        ticketId: args.ticketId,
        status: args.status,
      });

      return { success: true, emailId: data?.id };
    } catch (error) {
      console.error('Failed to send ticket status email:', error);
      // Don't throw - we don't want status updates to fail because of email issues
      return { success: false, error: error.message };
    }
  },
});

// Send welcome email for new users
export const sendWelcomeEmail = action({
  args: {
    to: v.string(),
    name: v.string(),
    role: v.union(v.literal("customer"), v.literal("agent")),
  },
  handler: async (ctx, args) => {
    try {
      // Use Resend to send the actual email
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      const roleText = args.role === 'agent' ? 'Support Agent' : 'Customer';
      const welcomeMessage = args.role === 'agent' 
        ? 'Welcome to our support team! You can now start helping customers and managing tickets.'
        : 'Welcome! You can now create support tickets and track their progress.';

      const { data, error } = await resend.emails.send({
        from: 'Support <support@notif.dendekky.com>',
        to: [args.to],
        subject: `Welcome to Support Platform - ${roleText}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Welcome to Support Platform!</h2>
            
            <p>Hello ${args.name},</p>
            
            <p>Thank you for joining our support platform as a ${roleText.toLowerCase()}.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #374151;">Getting Started</h3>
              <p>${welcomeMessage}</p>
              ${args.role === 'agent' ? `
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

      console.log("Welcome email sent successfully:", {
        to: args.to,
        emailId: data?.id,
        role: args.role,
      });

      return { success: true, emailId: data?.id };
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't throw - we don't want signup to fail because of email issues
      return { success: false, error: error.message };
    }
  },
});

// Send signin notification email
export const sendSignInNotificationEmail = action({
  args: {
    to: v.string(),
    name: v.string(),
    loginTime: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Use Resend to send the actual email
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      const { data, error } = await resend.emails.send({
        from: 'Support <support@notif.dendekky.com>',
        to: [args.to],
        subject: 'Sign-in Notification',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Sign-in Notification</h2>
            
            <p>Hello ${args.name},</p>
            
            <p>You have successfully signed in to your support platform account.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #374151;">Sign-in Details</h3>
              <p><strong>Time:</strong> ${args.loginTime}</p>
              <p><strong>Account:</strong> ${args.to}</p>
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

      console.log("Signin notification email sent successfully:", {
        to: args.to,
        emailId: data?.id,
        loginTime: args.loginTime,
      });

      return { success: true, emailId: data?.id };
    } catch (error) {
      console.error('Failed to send signin notification email:', error);
      // Don't throw - we don't want signin to fail because of email issues
      return { success: false, error: error.message };
    }
  },
});
