// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';
// import otpTemplate from '../templates/OTP.js';

// const result = dotenv.config();

// if (result.error) {
//   console.log(result.error);
// } else {
//   console.log('Environment variables loaded successfully');
// }

// const NODEMAILER_USER = process.env.NODEMAILER_USER;
// const NODEMAILER_PASS = process.env.NODEMAILER_PASS;

// console.log('NODEMAILER_USER', NODEMAILER_USER);
// console.log('NODEMAILER_PASS', NODEMAILER_PASS ? NODEMAILER_PASS : 'NOT SET');

// const transporter = nodemailer.createTransport({
//   host: 'smtp.gmail.com',
//   port: 587,
//   secure: false, // use STARTTLS
//   auth: {
//     user: NODEMAILER_USER,
//     pass: NODEMAILER_PASS,
//   },
//   tls: {
//     rejectUnauthorized: false,
//     minVersion: 'TLSv1.2'
//   },
//   connectionTimeout: 15000,
//   greetingTimeout: 15000,
//   socketTimeout: 15000,
// });

// transporter.verify((error, success) => {
//   if (error) {
//     console.error('Mailer connection error:', error.message);
//   } else {
//     console.log('Mailer is ready to send emails');
//   }
// });

// const Mailer = async ({ name, otp, email }) => {
//   if (!NODEMAILER_USER || !NODEMAILER_PASS) {
//     console.error('Missing email configuration: NODEMAILER_USER or NODEMAILER_PASS not set');
//     throw new Error('Email service not configured properly');
//   }

//   if (!email || !otp || !name) {
//     console.error('Missing required parameters for email:', { name, otp: !!otp, email });
//     throw new Error('Missing required email parameters');
//   }

//   const mailOptions = {
//     from: `"QuickHub" <${NODEMAILER_USER}>`,
//     to: email,
//     subject: 'Verify your QuickHub account',
//     html: otpTemplate({ name, otp }),
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log('Email sent successfully :-', info.messageId);
//     return info;
//   } catch (error) {
//     console.error('Error sending mail:', error.message);
//     console.error('Error code:', error.code);
//     console.error('Error response:', error.response);
    
//     if (error.code === 'EAUTH') {
//       throw new Error('Email authentication failed. Please check if you are using an App Password, not your regular Gmail password.');
//     } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
//       throw new Error('Failed to connect to email server. Check your internet connection or try using port 587.');
//     } else if (error.code === 'ESOCKET') {
//       throw new Error('Socket error. Gmail SMTP might be blocked by your network/firewall.');
//     } else {
//       throw new Error(`Email sending failed: ${error.message}`);
//     }
//   }
// };

// export default Mailer;

import { Resend } from 'resend';
import dotenv from 'dotenv';
import otpTemplate from '../templates/OTP.js';

const result = dotenv.config();

if (result.error) {
  console.log(result.error);
} else {
  console.log('Environment variables loaded successfully');
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
// For testing, use Resend's domain. For production, verify your own domain.
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

// Validate FROM_EMAIL is not a Gmail/Yahoo/etc address
if (FROM_EMAIL.includes('@gmail.com') || FROM_EMAIL.includes('@yahoo.com') || FROM_EMAIL.includes('@hotmail.com')) {
  console.warn('⚠️  WARNING: Cannot use Gmail/Yahoo/Hotmail as FROM address with Resend.');
  console.warn('Using onboarding@resend.dev instead.');
  console.warn('For production, verify your own domain at https://resend.com/domains');
}

const validFromEmail = FROM_EMAIL.includes('@gmail.com') || FROM_EMAIL.includes('@yahoo.com') || FROM_EMAIL.includes('@hotmail.com')
  ? 'onboarding@resend.dev'
  : FROM_EMAIL;

console.log('RESEND_API_KEY:', RESEND_API_KEY ? '***' : 'NOT SET');
console.log('FROM_EMAIL:', validFromEmail);

// Initialize Resend
const resend = new Resend(RESEND_API_KEY);

const Mailer = async ({ name, otp, email }) => {
  if (!RESEND_API_KEY) {
    console.error('Missing email configuration: RESEND_API_KEY not set');
    throw new Error('Email service not configured properly');
  }

  if (!email || !otp || !name) {
    console.error('Missing required parameters for email:', { name, otp: !!otp, email });
    throw new Error('Missing required email parameters');
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `QuickHub <${validFromEmail}>`,
      to: [email],
      subject: 'Verify your QuickHub account',
      html: otpTemplate({ name, otp }),
    });

    if (error) {
      console.error('Resend API error:', error);
      throw new Error(`Email sending failed: ${error.message}`);
    }

    console.log('Email sent successfully:', data.id);
    return data;
  } catch (error) {
    console.error('Error sending mail:', error.message);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

export default Mailer;