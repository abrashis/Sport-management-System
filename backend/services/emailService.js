import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendOTPEmail = async (email, otp) => {
    // Check for placeholder credentials
    if (process.env.EMAIL_USER === 'your-email@gmail.com' || process.env.EMAIL_PASS === 'your-app-password') {
        const warning = `
        ###########################################################
        #  CRITICAL ERROR: EMAIL CREDENTIALS NOT CONFIGURED       #
        #                                                         #
        #  The email was NOT sent because you are using           #
        #  placeholder credentials in backend/.env                #
        #                                                         #
        #  FIX THIS:                                              #
        #  1. Open backend/.env                                   #
        #  2. Set EMAIL_USER to your real Gmail address           #
        #  3. Set EMAIL_PASS to your 16-char App Password         #
        ###########################################################
        `;
        console.error(warning);
        return; // Stop trying to send
    }
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Email Verification OTP - Sports Management System',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
                <h2 style="color: #ed1c24;">Sports Management System</h2>
                <p>Hello,</p>
                <p>Thank you for signing up. Please use the following OTP to verify your email address:</p>
                <div style="font-size: 24px; font-weight: bold; padding: 10px; background: #f4f4f4; text-align: center; letter-spacing: 5px;">
                    ${otp}
                </div>
                <p>This OTP is valid for 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};
