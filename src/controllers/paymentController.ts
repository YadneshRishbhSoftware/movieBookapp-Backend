// controllers/paymentController.ts
import { Request, Response } from 'express';
import Booking from '../models/Booking';
import Movie from '../models/Movie';
import crypto from 'crypto';
import { sendConfirmationEmail } from '../helper/sendPasswordResetEmail';

export const initiatePayment = async (req: Request, res: Response) => {
  try {
    const { userId, movieId, seats, amount ,email,phone} = req.body;

    // Validate movie existence
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // Create a new booking with status 'pending'
    const booking = new Booking({
      user: userId,
      movie: movieId,
      seats,
      status: 'pending',
    });
    const successURL = process.env.BASE_URL;
    const failureURL = process.env.BASE_URL;
console.log(successURL,"dewrewrwetr")
    // Generate hash for PayU request
    const createHash = "ferfkjnrekjnfjerkngkjrneg"
    
    // PayU payment request payload
    const payURequestPayload = {
      key: process.env.PAYU_KEY,
      txnid: (booking._id as string).toString(),
      amount: amount.toString(),
      productinfo: 'Movie Booking',
      firstname: 'Yadnesh', // Replace with actual user data
      email: email, // Replace with actual user data
      phone: phone, // Replace with actual user data
      surl: successURL,
      furl: failureURL,
      hash: createHash, // Generate hash using PayU's algorithm
    };

    // Generate hash for PayU request
    const hashString = `${payURequestPayload.key}|${payURequestPayload.txnid}|${payURequestPayload.amount}|${payURequestPayload.productinfo}|${payURequestPayload.firstname}|${payURequestPayload.email}|||||||||||${process.env.PAYU_SALT}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    payURequestPayload.hash = hash; 

    // Redirect to PayU payment page
    res.json({ payURequestPayload });
  } catch (error) {
    console.error('Error initiating payment:', error);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
};



export const paymentSuccess = async (req: Request, res: Response) => {
  try {
    const { txnid, status } = req.body;
    

    const booking = await Booking.findById(txnid).populate('movie').populate('user');
    if (!booking) {
    
      return res.status(404).json({ error: 'Booking not found' });
    }
    // console.log('Booking found:', booking);

    if (status) {
      booking.confirmationCompleted = true;
      await booking.save();
    

      try {
        await sendConfirmationEmail(booking);
    
      } catch (emailError) {
        console.error('Error sending email:', emailError);
      }
    } else {
      booking.status = 'failed';
      await booking.save();
    
    }

    res.json({ message: 'Payment status updated', booking });
  } catch (error) {
    console.error('Error in paymentSuccess:', error);
    res.status(500).json({ error: 'Failed to handle payment success' });
  }
};

export const paymentFailure = async (req: Request, res: Response) => {
  try {
    const { txnid } = req.body;

    // Find the booking and update status
    const booking = await Booking.findById(txnid);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    booking.status = 'failed';
    await booking.save();

    res.json({ message: 'Payment failed', booking });
  } catch (error) {
    console.error('Error handling payment failure:', error);
    res.status(500).json({ error: 'Failed to handle payment failure' });
  }
};