import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendOTPEmail = async (email, otp) => {
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
