"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
// Create a transporter object using Gmail SMTP
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    secure: false,
    port: 25,
    auth: {
        user: process.env.GMAIL_EMAIL_USER,
        pass: process.env.GMAIL_EMAIL_PASS
    }
});
// Function to send email
const sendEmail = async (to, subject, text) => {
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to,
        subject,
        text
    };
    try {
        await transporter.sendMail(mailOptions);
    }
    catch (error) {
        throw new Error(`Failed to send email: ${error}`);
    }
};
exports.sendEmail = sendEmail;
