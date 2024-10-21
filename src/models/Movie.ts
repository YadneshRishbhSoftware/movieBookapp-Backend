// src/models/Movie.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IPhoto } from './Image';
import { IVideo } from './Video';

export interface IShowtime {
  date: Date;
  times: [string]; // Array of time slots in string format (e.g., "10:00 AM")
}

export interface IMovie extends Document {
  name: string;
  photo: IPhoto['_id'];
  trailer: IVideo['_id'];
  genere: [string];
  language: string;
  landmark: string;
  city: string;
  state: string;
  country: string;
  showtimes: IShowtime[];
  createdAt: Date;
}

const ShowtimeSchema: Schema = new Schema({
  date: { type: Date, required: true },
  times: { type: [String], required: true },
});

const MovieSchema: Schema = new Schema({
  name: { type: String, required: true },
  photo: { type: Schema.Types.ObjectId, ref: 'Photo' },
  trailer: { type: Schema.Types.ObjectId, ref: 'Video' },
  genere: { type: [String], required: true },
  language: { type: String, required: true },
  landmark: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  showtimes: { type: [ShowtimeSchema], required: true }, // New field for showtimes
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IMovie>('Movie', MovieSchema);
