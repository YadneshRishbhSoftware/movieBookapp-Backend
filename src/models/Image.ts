// src/models/Photo.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IPhoto extends Document {
  url: string;
  publicId: string; // Public ID from Cloudinary or other service
  createdAt: Date;
}

const PhotoSchema: Schema = new Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IPhoto>('Photo', PhotoSchema);
