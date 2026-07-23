const nodemailer = require('nodemailer');
const sendOTP = async (email, otp, type = 'verify') => {
  const subject = type === 'verify' ? 'Verify your AurreX account' : 'Reset your AurreX password';
  const html = `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.1)"><div style="background:linear-gradient(135deg,#b45309,#d97706);padding:28px;text-align:center"><h1 style="color:#fff;margin:0;font-size:24px">◆ AurreX</h1></div><div style="padding:32px"><h2 style="color:#1a1a1a">${type==='verify'?'Email Verification':'Password Reset'}</h2><p style="color:#555">Your OTP code (expires in 10 minutes):</p><div style="background:#fef3c7;border:2px solid #d97706;border-radius:12px;padding:24px;text-align:center;margin:20px 0"><div style="font-size:38px;font-weight:900;color:#b45309;letter-spacing:10px">${otp}</div></div><p style="color:#555;font-size:13px">Do not share this with anyone.</p></div></div>`;
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) { console.log("\n📧 [DEV] OTP for " + email + ": " + otp + "\n"); return; }
  const t = nodemailer.createTransport({ service:'gmail', auth:{ user:process.env.EMAIL_USER, pass:process.env.EMAIL_PASS } });
  await t.sendMail({ from:'"AurreX" <' + process.env.EMAIL_USER + '>', to:email, subject, html });
};
module.exports = { sendOTP };