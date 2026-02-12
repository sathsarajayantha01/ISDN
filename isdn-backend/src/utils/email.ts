import nodemailer, { Transporter } from "nodemailer";
import { Order, OrderItem } from "../types";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter: Transporter | null = null;
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = process.env.EMAIL_ENABLED === "true";

    if (this.isEnabled) {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: parseInt(process.env.EMAIL_PORT || "587"),
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    if (!this.isEnabled) {
      console.log("Email is disabled. Skipping email send.");
      return;
    }

    if (!this.transporter) {
      console.error("Email transporter not initialized");
      return;
    }

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || "ISDN Backend <noreply@isdn.com>",
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      console.log(`Email sent to ${options.to}`);
    } catch (error) {
      console.error("Error sending email:", error);
      // Don't throw error to prevent email failures from breaking order flow
    }
  }

  async sendOrderCreatedEmail(
    customerEmail: string,
    customerName: string,
    order: any,
    items: any[],
  ): Promise<void> {
    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product?.name || "Product"}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Rs. ${Number(item.unitPrice).toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Rs. ${Number(item.subtotal).toFixed(2)}</td>
        </tr>
      `,
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .invoice-table { width: 100%; border-collapse: collapse; margin: 20px 0; background-color: white; }
          .invoice-table th { background-color: #4CAF50; color: white; padding: 12px; text-align: left; }
          .total-row { font-weight: bold; background-color: #f0f0f0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
          </div>
          <div class="content">
            <h2>Hello ${customerName},</h2>
            <p>Thank you for your order! Your order has been successfully created and is being processed.</p>
            
            <h3>Order Details:</h3>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Branch:</strong> ${order.branch?.name || "N/A"}</p>
            
            <h3>Invoice:</h3>
            <table class="invoice-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th style="text-align: center;">Quantity</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr class="total-row">
                  <td colspan="3" style="padding: 15px; text-align: right;">Total Amount:</td>
                  <td style="padding: 15px; text-align: right;">Rs. ${Number(order.totalAmount).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            
            ${order.specialNotes ? `<p><strong>Special Notes:</strong> ${order.specialNotes}</p>` : ""}
            
            <p>We will keep you updated on the status of your order.</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} ISDN Backend. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: customerEmail,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html,
    });
  }

  async sendOrderStatusUpdateEmail(
    customerEmail: string,
    customerName: string,
    order: any,
    oldStatus: string,
    newStatus: string,
  ): Promise<void> {
    const statusMessages: { [key: string]: string } = {
      Pending: "Your order is pending confirmation.",
      Confirmed: "Your order has been confirmed and will be processed soon.",
      Processing: "Your order is currently being processed.",
      Ready: "Your order is ready for dispatch.",
      Dispatched: "Your order has been dispatched and is on its way!",
      Delivered: "Your order has been delivered successfully.",
      Cancelled: "Your order has been cancelled.",
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .status-badge { display: inline-block; padding: 8px 16px; border-radius: 4px; font-weight: bold; margin: 10px 0; }
          .status-${newStatus.toLowerCase()} { background-color: #4CAF50; color: white; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Status Update</h1>
          </div>
          <div class="content">
            <h2>Hello ${customerName},</h2>
            <p>Your order status has been updated.</p>
            
            <h3>Order Details:</h3>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
            <p><strong>Previous Status:</strong> ${oldStatus}</p>
            <p><strong>Current Status:</strong> <span class="status-badge status-${newStatus.toLowerCase()}">${newStatus}</span></p>
            
            ${order.deliveryDate ? `<p><strong>Expected Delivery:</strong> ${new Date(order.deliveryDate).toLocaleDateString()}</p>` : ""}
            
            ${
              order.driver
                ? `
              <h3>Driver Information:</h3>
              <p><strong>Name:</strong> ${order.driver.name}</p>
              <p><strong>Contact:</strong> ${order.driver.contactNumber || "N/A"}</p>
              <p><strong>License:</strong> ${order.driver.licenseNumber || "N/A"}</p>
            `
                : ""
            }
            
            <p>${statusMessages[newStatus] || "Your order status has been updated."}</p>
            
            <p><strong>Total Amount:</strong> Rs. ${Number(order.totalAmount).toFixed(2)}</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} ISDN Backend. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: customerEmail,
      subject: `Order Status Update - ${order.orderNumber} (${newStatus})`,
      html,
    });
  }

  async sendLocationUpdateEmail(
    customerEmail: string,
    customerName: string,
    order: any,
    latitude: number,
    longitude: number,
  ): Promise<void> {
    const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .map-link { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📍 Delivery Location Update</h1>
          </div>
          <div class="content">
            <h2>Hello ${customerName},</h2>
            <p>Your delivery location has been updated for your order.</p>
            
            <h3>Order Details:</h3>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            
            ${
              order.driver
                ? `
              <h3>Driver Information:</h3>
              <p><strong>Name:</strong> ${order.driver.name}</p>
              <p><strong>Contact:</strong> ${order.driver.contactNumber || "N/A"}</p>
            `
                : ""
            }
            
            <h3>Updated Location:</h3>
            <p><strong>Latitude:</strong> ${latitude}</p>
            <p><strong>Longitude:</strong> ${longitude}</p>
            
            <p>
              <a href="${googleMapsLink}" class="map-link" target="_blank">View on Google Maps</a>
            </p>
            
            <p>Track your delivery in real-time using the link above.</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} ISDN Backend. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: customerEmail,
      subject: `Delivery Location Update - ${order.orderNumber}`,
      html,
    });
  }
}

export default new EmailService();
