import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import otpTemplate from '../templates/OTP.js';

const result = dotenv.config();

if (result.error) {
  console.log(result.error);
} else {
  console.log('Environment variables loaded successfully');
}

const NODEMAILER_USER = process.env.NODEMAILER_USER;
const NODEMAILER_PASS = process.env.NODEMAILER_PASS;

console.log('NODEMAILER_USER', NODEMAILER_USER);
console.log('NODEMAILER_PASS', NODEMAILER_PASS ? '***' : 'NOT SET');

// Simplified configuration - let service handle the details
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: NODEMAILER_USER,
    pass: NODEMAILER_PASS,
  },
  // Add timeout settings to prevent hanging
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('Mailer connection error:', error.message);
  } else {
    console.log('Mailer is ready to send emails');
  }
});

const Mailer = async ({ name, otp, email }) => {
  if (!NODEMAILER_USER || !NODEMAILER_PASS) {
    console.error('Missing email configuration: NODEMAILER_USER or NODEMAILER_PASS not set');
    throw new Error('Email service not configured properly');
  }

  if (!email || !otp || !name) {
    console.error('Missing required parameters for email:', { name, otp: !!otp, email });
    throw new Error('Missing required email parameters');
  }

  const mailOptions = {
    from: `"QuickHub" <${NODEMAILER_USER}>`,
    to: email,
    subject: 'Verify your QuickHub account',
    html: otpTemplate({ name, otp }),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully :-', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending mail:', error.message);
    console.error('Error code:', error.code);
    console.error('Error response:', error.response);
    
    if (error.code === 'EAUTH') {
      throw new Error('Email authentication failed. Please check if you are using an App Password, not your regular Gmail password.');
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      throw new Error('Failed to connect to email server. Check your internet connection or try using port 587.');
    } else if (error.code === 'ESOCKET') {
      throw new Error('Socket error. Gmail SMTP might be blocked by your network/firewall.');
    } else {
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }
};

export default Mailer;