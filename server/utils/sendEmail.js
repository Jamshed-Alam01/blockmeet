const SibApiV3Sdk = require("sib-api-v3-sdk");

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

async function sendOtpEmail(toEmail, otp) {
  const sendSmtpEmail = {
    to: [{ email: toEmail }],
    sender: { email: process.env.EMAIL_USER, name: "BlockMeet" },
    subject: "Your BlockMeet verification code",
    htmlContent: `
      <div style="font-family: sans-serif; max-width: 420px; margin: auto;">
        <h2 style="color: #6C5CE7;">BlockMeet</h2>
        <p>Your verification code is:</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
        <p style="color: #8B8D9B; font-size: 13px;">This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  };

  await apiInstance.sendTransacEmail(sendSmtpEmail);
}

module.exports = sendOtpEmail;