# Email Notification System

This document describes the email notification system implemented for order management.

## Overview

The system automatically sends email notifications to customers for the following events:

- **Order Creation**: Sends an invoice with order details
- **Order Status Update**: Notifies customer when order status changes
- **Location Update**: Sends delivery location updates with Google Maps link

## Setup

### 1. Install Dependencies

Already installed:

```bash
yarn add nodemailer
yarn add -D @types/nodemailer
```

### 2. Environment Configuration

Add the following variables to your `.env` file:

```env
# Email Configuration
EMAIL_ENABLED="true"                      # Set to "false" to disable emails
EMAIL_HOST="smtp.gmail.com"               # SMTP server host
EMAIL_PORT="587"                          # SMTP server port
EMAIL_SECURE="false"                      # Use TLS (false for port 587, true for 465)
EMAIL_USER="your-email@gmail.com"         # Your email address
EMAIL_PASSWORD="your-app-password"        # App password (not regular password!)
EMAIL_FROM="ISDN Backend <noreply@isdn.com>"  # From address shown to recipients
```

### 3. Gmail Setup (if using Gmail)

To use Gmail as your email provider:

1. Enable 2-Factor Authentication on your Google Account
2. Generate an App Password:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the generated 16-character password
   - Use this as `EMAIL_PASSWORD` (not your regular Gmail password)

### 4. Other Email Providers

For other SMTP providers (SendGrid, Mailgun, AWS SES, etc.):

- Update `EMAIL_HOST` with their SMTP server
- Update `EMAIL_PORT` (usually 587 for TLS or 465 for SSL)
- Set `EMAIL_SECURE="true"` if using port 465
- Use their provided credentials

## Usage

### Enable/Disable Emails

Set `EMAIL_ENABLED` in your `.env` file:

- `EMAIL_ENABLED="true"` - Emails will be sent
- `EMAIL_ENABLED="false"` - Emails will be skipped (useful for testing)

### Email Triggers

#### 1. Order Creation

Automatically sent when a new order is created via `POST /api/orders`

**Email includes:**

- Order number and date
- Full invoice with product details
- Itemized pricing and total amount
- Branch information
- Special notes (if any)

#### 2. Order Status Update

Automatically sent when order status is updated via `PUT /api/orders/:id/status`

**Email includes:**

- Order number
- Previous and new status
- Status-specific message
- Expected delivery date (if provided)
- Driver information (if assigned)
- Total amount

**Status messages:**

- **Pending**: Order is pending confirmation
- **Confirmed**: Order confirmed, processing soon
- **Processing**: Order is being processed
- **Ready**: Order ready for dispatch
- **Dispatched**: Order is on the way
- **Delivered**: Order delivered successfully
- **Cancelled**: Order has been cancelled

#### 3. Location Update

Automatically sent when delivery location is updated via `PUT /api/orders/:id/location`

**Email includes:**

- Order number and status
- Driver information (if assigned)
- Updated GPS coordinates
- Google Maps link for real-time tracking

## Email Service API

The email service is located at `src/utils/email.ts` and provides the following methods:

### sendOrderCreatedEmail

```typescript
await emailService.sendOrderCreatedEmail(
  customerEmail: string,
  customerName: string,
  order: any,
  items: any[]
);
```

### sendOrderStatusUpdateEmail

```typescript
await emailService.sendOrderStatusUpdateEmail(
  customerEmail: string,
  customerName: string,
  order: any,
  oldStatus: string,
  newStatus: string
);
```

### sendLocationUpdateEmail

```typescript
await emailService.sendLocationUpdateEmail(
  customerEmail: string,
  customerName: string,
  order: any,
  latitude: number,
  longitude: number
);
```

## Error Handling

- Email failures do NOT break the order creation/update flow
- Errors are logged to console but do not throw exceptions
- This ensures orders can be processed even if email service is unavailable

## Testing

### Test Email Delivery

1. Set `EMAIL_ENABLED="true"` in `.env`
2. Configure valid SMTP credentials
3. Create a test order:
   ```bash
   POST /api/orders
   ```
4. Check the customer's inbox for the order confirmation email

### Disable Emails for Testing

Set `EMAIL_ENABLED="false"` in `.env` to skip email sending during development/testing.

## Email Templates

All emails are HTML-formatted with:

- Professional styling
- Responsive design
- Company branding
- Clear call-to-actions
- Footer with year and company info

Templates are defined in `src/utils/email.ts` and can be customized as needed.

## Security Notes

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Use App Passwords** - Don't use regular email passwords
3. **Rotate credentials regularly** - Change passwords periodically
4. **Limit permissions** - Use service accounts with minimal permissions
5. **Monitor usage** - Watch for unusual email sending patterns

## Troubleshooting

### Emails not sending

1. Check `EMAIL_ENABLED="true"` in `.env`
2. Verify SMTP credentials are correct
3. Check console logs for error messages
4. Ensure email provider allows SMTP access
5. Check spam folder for test emails

### Gmail "Less secure app" error

- Gmail no longer supports "Less secure apps"
- You MUST use App Passwords (see Gmail Setup above)
- Enable 2FA first, then generate App Password

### Connection timeout

- Check `EMAIL_HOST` and `EMAIL_PORT` are correct
- Verify firewall/network allows SMTP connections
- Try different ports (587, 465, or 25)

### Authentication failed

- Double-check `EMAIL_USER` and `EMAIL_PASSWORD`
- For Gmail, ensure using App Password, not regular password
- Verify account credentials are active

## Future Enhancements

Potential improvements:

- Email templates from external files
- Multilingual email support
- Email queuing system for bulk operations
- Rich email analytics and tracking
- Email preferences per customer
- Scheduled digest emails
