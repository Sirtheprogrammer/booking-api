const nodemailer = require('nodemailer');
const config = require('../config');

class EmailService {
  constructor() {
    if (!config.smtp.user || !config.smtp.pass) {
      throw new Error('SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS environment variables.');
    }

    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: false, // true for 465, false for other ports
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass
      }
    });

    // Verify SMTP connection
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('❌ SMTP connection failed:', error.message);
      } else {
        console.log('✅ SMTP connection verified successfully');
      }
    });

    console.log(`📧 Email service initialized with SMTP host: ${config.smtp.host}, port: ${config.smtp.port}, user: ${config.smtp.user}`);
  }

  async sendOTP(email, otp, name) {
    try {
      const mailOptions = {
        from: config.smtp.from,
        to: email,
        subject: 'Your BM-COACH TZ Account Access Code',
        text: `Hello ${name},\n\nThank you for creating your BM-COACH TZ account. To complete your registration, please enter this access code:\n\n${otp}\n\nThis code will remain active for ${config.otp.expireMinutes} minutes.\n\nIf you did not create an account with BM-COACH TZ, you can safely disregard this message.\n\nRegards,\nBM-COACH TZ Team\nYour Journey, Our Priority`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <div style="text-align: center; padding-bottom: 20px;">
              <h1 style="color: #1a56db; margin: 0; font-size: 24px;">BM-COACH TZ</h1>
            </div>
            
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 30px; margin: 20px 0;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hello ${name},</p>
              
              <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for creating your SmartBus TZ account. To complete your registration, please enter the following access code in the application:
              </p>
              
              <div style="background-color: #ffffff; border: 2px solid #e5e7eb; border-radius: 6px; padding: 20px; text-align: center; margin: 25px 0;">
                <div style="color: #111827; font-size: 32px; font-weight: bold; letter-spacing: 6px; font-family: 'Courier New', monospace;">
                  ${otp}
                </div>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 20px 0 0 0;">
                This code will remain active for ${config.otp.expireMinutes} minutes. For your security, please do not share this code with anyone.
              </p>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #9ca3af; font-size: 13px; line-height: 1.5; margin: 0;">
                If you did not create an account with SmartBus TZ, you can safely disregard this message.
              </p>
              <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 15px 0 0 0;">
                Regards,<br>
                SmartBus TZ Team<br>
                <span style="color: #9ca3af;">Your Journey, Our Priority</span>
              </p>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ OTP sent to ${email}`);
    } catch (error) {
      console.error('❌ Email send error:', {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode
      });
      throw new Error('Failed to send OTP email');
    }
  }

  async sendTicketConfirmation(email, ticketData) {
    try {
      const departureDate = new Date(ticketData.departureTime).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const departureTime = new Date(ticketData.departureTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const mailOptions = {
        from: config.smtp.from,
        to: email,
        subject: `Booking Receipt - ${ticketData.ticketNumber}`,
        text: `Booking Receipt\n\nThank you for choosing SmartBus TZ.\n\nBooking Details:\nTicket Reference: ${ticketData.ticketNumber}\nRoute: ${ticketData.from} to ${ticketData.to}\nSeat Assignment: ${ticketData.seatNumber}\nTravel Date: ${departureDate}\nDeparture Time: ${departureTime}\nAmount Paid: TZS ${ticketData.price.toLocaleString()}\n\nImportant Information:\nPlease arrive at the departure point at least 30 minutes prior to the scheduled departure time. Present this ticket reference at check-in.\n\nFor assistance, contact our customer service team.\n\nRegards,\nSmartBus TZ Team\nYour Journey, Our Priority`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #1a56db;">
              <h1 style="color: #1a56db; margin: 0; font-size: 24px;">SmartBus TZ</h1>
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0 0 0;">Booking Receipt</p>
            </div>
            
            <div style="margin: 30px 0;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                Thank you for choosing SmartBus TZ. Your booking has been processed successfully.
              </p>
            </div>
            
            <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 25px; margin: 20px 0;">
              <h2 style="color: #166534; margin: 0 0 20px 0; font-size: 18px;">Booking Details</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Ticket Reference:</td>
                  <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${ticketData.ticketNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Route:</td>
                  <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${ticketData.from} to ${ticketData.to}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Seat Assignment:</td>
                  <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">Seat ${ticketData.seatNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Travel Date:</td>
                  <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${departureDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Departure Time:</td>
                  <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${departureTime}</td>
                </tr>
                <tr style="border-top: 1px solid #86efac;">
                  <td style="padding: 12px 0 0 0; color: #166534; font-size: 15px; font-weight: 600;">Amount Paid:</td>
                  <td style="padding: 12px 0 0 0; color: #166534; font-size: 15px; font-weight: 600; text-align: right;">TZS ${ticketData.price.toLocaleString()}</td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #92400e; font-size: 14px; line-height: 1.5; margin: 0;">
                <strong>Important:</strong> Please arrive at the departure point at least 30 minutes prior to the scheduled departure time. Present this ticket reference at check-in.
              </p>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0 0 15px 0;">
                For assistance or inquiries, please contact our customer service team.
              </p>
              <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0;">
                Regards,<br>
                SmartBus TZ Team<br>
                <span style="color: #9ca3af;">Your Journey, Our Priority</span>
              </p>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Ticket confirmation sent to ${email}`);
    } catch (error) {
      console.error('❌ Email send error:', {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode
      });
      throw new Error('Failed to send ticket confirmation');
    }
  }
}

module.exports = new EmailService();
