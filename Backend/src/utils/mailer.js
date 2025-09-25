import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import otpTemplate from '../templates/OTP.js';
const result = dotenv.config();

if (result.error) {
    console.log(result.error);
  } else {
    console.log("Environment variables loaded successfully");
  }

const NODEMAILER_USER = process.env.NODEMAILER_USER;
const NODEMAILER_PASS = process.env.NODEMAILER_PASS;

console.log("NODEMAILER_USER",NODEMAILER_USER);
console.log("NODEMAILER_PASS",NODEMAILER_PASS);

const transporter = nodemailer.createTransport({
    host: 'smpt.google.com',
    port: 465,
    secure: true,
    service: 'gmail',
    auth: {
        user: NODEMAILER_USER,
        pass: NODEMAILER_PASS,
    },
});

const Mailer = async ({name, otp, email}) => {
    
    const mailOptions = {
        from: NODEMAILER_USER,
        to: email,
        subject: 'verify your chat-app account',
        html: otpTemplate({name, otp}),
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent :-",info.messageId);
        
    } catch (error) {  
        console.log("error sending mail",error);
        throw new Error('Error sending mail');
     }

}

module.exports = Mailer;