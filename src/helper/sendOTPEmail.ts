import nodemailer from 'nodemailer';
export const sendOTPEmail = (email:string, otp:string) => {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,       
      port: Number(process.env.SMTP_PORT) || 587,  
      secure: false,                     
      auth: {
        user: process.env.SMTP_USER,    
        pass: process.env.SMTP_PASS,     
      },
    });
  

    const mailOptions = {
      from: process.env.SMTP_HOST,
      to: email, // Assuming user email is stored in the booking
      subject: 'Email Verification OTP',
      html: `
        <h1>Email Verification OTP</h1>
        <p>Your OTP for email verification is: ${otp}. This OTP will expire in 10 minutes</p>
      `,
    };
  
    return transporter.sendMail(mailOptions);
  };