import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  isAdmin: any;
  email:any;
  username: string;
  password: string;
  refreshToken:string;
  resetPasswordToken?: string;      // Optional, as it may not always exist
  resetPasswordExpires?: number;
  otp:any;
  otpExpiry: any;
  isVerified:boolean;
  role: 'user' | 'admin';
}

const UserSchema: Schema = new Schema({
  email:{type:String , required :true, unique :true },
  username: { type: String, required: true,  },
  password: { type: String, required: true },
  refreshToken: { type: String }, 
  otp: { type: String },
    otpExpiry:{ type: Date},
    isVerified: {
        type: Boolean,
        default: false
    },
  role: { type: String, enum: ['user', 'admin'], required: true },
  resetPasswordToken: { type: String },  // No required since it's optional
  resetPasswordExpires: { type: Number } // Optional, expiration stored as a timestamp
});

export default mongoose.model<IUser>('User', UserSchema);
