const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});




async function sendOtpEmail(toEmail, otp) {
  await transporter.sendMail({
    from: `"BlockMeet" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your BlockMeet verification code",
    html: `
      <div style="font-family: sans-serif; max-width: 420px; margin: auto;">
        <h2 style="color: #6C5CE7;">BlockMeet</h2>
        <p>Your verification code is:</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
        <p style="color: #8B8D9B; font-size: 13px;">This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  });
}

module.exports = sendOtpEmail;