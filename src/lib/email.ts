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
