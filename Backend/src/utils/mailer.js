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
console.log('NODEMAILER_PASS', NODEMAILER_PASS);

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  service: 'gmail',
  auth: {
    user: NODEMAILER_USER,
    pass: NODEMAILER_PASS,
  },
});

const Mailer = async ({ name, otp, email }) => {
  // Validate required environment variables
  if (!NODEMAILER_USER || !NODEMAILER_PASS) {
    console.error('Missing email configuration: NODEMAILER_USER or NODEMAILER_PASS not set');
    throw new Error('Email service not configured properly');
  }

  // Validate input parameters
  if (!email || !otp || !name) {
    console.error('Missing required parameters for email:', { name, otp: !!otp, email });
    throw new Error('Missing required email parameters');
  }

  const mailOptions = {
    from: NODEMAILER_USER,
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
    
    // Provide more specific error messages
    if (error.code === 'EAUTH') {
      throw new Error('Email authentication failed. Check your credentials.');
    } else if (error.code === 'ECONNECTION') {
      throw new Error('Failed to connect to email server. Check your internet connection.');
    } else {
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }
};

export default Mailer;
