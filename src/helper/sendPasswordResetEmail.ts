import nodemailer from 'nodemailer';

export const sendPasswordResetEmail = async (email: string, resetURL: string) => {
  try {
    // 1. Create a transporter for sending emails
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,       
      port: Number(process.env.SMTP_PORT) || 587,  
      secure: false,                     
      auth: {
        user: process.env.SMTP_USER,    
        pass: process.env.SMTP_PASS,     
      },
    });

    // 2. Define email options
    const mailOptions = {
      from: process.env.FROM_EMAIL ,
      to: email,  
      subject: 'Password Reset Request', 
      html: `
        <h1>Password Reset</h1>
        <p>You requested a password reset. Please use the link below to reset your password:</p>
        <a href="${resetURL}">Reset Password</a>
        <p>This link will expire in 10 minutes.</p>
      `,  // Email body in HTML
    };

    // 3. Send the email
    await transporter.sendMail(mailOptions);

    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email could not be sent');
  }
};
export const sendConfirmationEmail = (booking: any) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,       
    port: Number(process.env.SMTP_PORT) || 587,  
    secure: false,                     
    auth: {
      user: process.env.SMTP_USER,    
      pass: process.env.SMTP_PASS,     
    },
  });

console.log(booking.user.email,"transporter")
  const mailOptions = {
    from: process.env.SMTP_HOST,
    to: booking.user.email, // Assuming user email is stored in the booking
    subject: 'Movie Booking Confirmation',
    html: `
      <h1>Booking Confirmation</h1>
      <p>Thank you for booking with us!</p>
      <h2>Booking Details:</h2>
      <ul>
        <li>Movie: ${booking.movie.title}</li>
        <li>Seat(s): ${booking.seats.join(', ')}</li>
        <li>Amount: $${booking.amount}</li>
      </ul>
      <img src="${booking.movie.imageUrl}" alt="${booking.movie.title}" style="max-width: 300px;">
    `,
  };

  return transporter.sendMail(mailOptions);
};