// src/models/Video.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IVideo extends Document {
  url: string;
  publicId: string; // Public ID from Cloudinary or other service
  createdAt: Date;
}

const VideoSchema: Schema = new Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IVideo>('Video', VideoSchema);
