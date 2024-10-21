// src/controllers/movieController.ts
import { Request, Response } from 'express';
import Movie from '../models/Movie';
import Photo, { IPhoto } from '../models/Image';
import Video, { IVideo } from '../models/Video';
import cloudinary from '../config/cloudinaryConfig';
import { Schema } from 'mongoose';
interface UpdateMovieRequest extends Request {
  body: {
    name: string;
    photoUrl?: string;
    photoPublicId?: string;
    trailerUrl?: string;
    trailerPublicId?: string;
    showtimes: [{ date: Date, times: [string] }];
    genere: string;
    language: string;
    landmark: string;
    city: string;
    state: string;
    country: string;
    Photo: any;
    photo: Schema.Types.ObjectId; // Add this line if you are referencing a photo document
    trailer: Schema.Types.ObjectId; // Add this line if you are referencing a trailer document
  };
}

export const addMovie = async (req: Request, res: Response) => {
  try {
    const {
      name,
      photoUrl,
      photoPublicId,
      trailerUrl,
      trailerPublicId,
      genere,
      language,
      landmark,
      city,
      state,
      country,
      showtimes, // Array of showtimes [{ date, times }]
    } = req.body;

    let newPhoto;
    if (photoUrl && photoPublicId) {
      newPhoto = new Photo({
        url: photoUrl,
        publicId: photoPublicId,
      });
      await newPhoto.save();
    }

    let newVideo;
    if (trailerUrl && trailerPublicId) {
      newVideo = new Video({
        url: trailerUrl,
        publicId: trailerPublicId,
      });
      await newVideo.save();
    }

    const newMovie = new Movie({
      name,
      photo: newPhoto ? newPhoto._id : null,
      trailer: newVideo ? newVideo._id : null,
      genere,
      language,
      landmark,
      city,
      state,
      country,
      showtimes, // Save showtimes
    });

    await newMovie.save();
    res.status(201).json(newMovie);
  } catch (error) {
    console.error('Error adding movie:', error);
    res.status(500).json({ error: 'Failed to add movie' });
  }
};

export const getMovieById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const movie = await Movie.findById(id).populate('photo trailer').exec();

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json(movie);
  } catch (error) {
    console.error('Error fetching movie:', error);
    res.status(500).json({ error: 'Failed to fetch movie' });
  }
};
export const updateMovie = async (req: UpdateMovieRequest, res: Response) => {
  const { id } = req.params;
  const {
    name,
    photoUrl,
    photoPublicId,
    trailerUrl,
    trailerPublicId,
    landmark,
    genere,
    language,
    city,
    state,
    country,
    showtimes, // Array of showtimes [{ date, times }]
  } = req.body;

  try {
    const existingMovie = await Movie.findById(id).populate('photo trailer').exec();

    if (!existingMovie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // Handle Photo update or deletion
    if (!photoUrl && existingMovie.photo) {
      await cloudinary.uploader.destroy((existingMovie.photo as any).publicId);
      await Photo.findByIdAndDelete((existingMovie.photo as any)._id);
      existingMovie.photo = null;
    } else if (photoUrl && existingMovie.photo && (existingMovie.photo as any).url !== photoUrl) {
      const updatedPhoto = await Photo.findByIdAndUpdate(
        (existingMovie.photo as any)._id,
        { url: photoUrl, publicId: photoPublicId },
        { new: true }
      );

      if (updatedPhoto) {
        existingMovie.photo = updatedPhoto._id;
      }
    } else if (photoUrl && !existingMovie.photo) {
      const newPhoto = new Photo({ url: photoUrl, publicId: photoPublicId });
      await newPhoto.save();
      existingMovie.photo = newPhoto._id;
    }

    // Handle Video update or deletion
    if (!trailerUrl && existingMovie.trailer) {
      await cloudinary.uploader.destroy((existingMovie.trailer as any).publicId);
      await Video.findByIdAndDelete((existingMovie.trailer as any)._id);
      existingMovie.trailer = null;
    } else if (trailerUrl && existingMovie.trailer && (existingMovie.trailer as any).url !== trailerUrl) {
      const updatedVideo = await Video.findByIdAndUpdate(
        (existingMovie.trailer as any)._id,
        { url: trailerUrl, publicId: trailerPublicId },
        { new: true }
      );

      if (updatedVideo) {
        existingMovie.trailer = updatedVideo._id;
      }
    } else if (trailerUrl && !existingMovie.trailer) {
      const newVideo = new Video({ url: trailerUrl, publicId: trailerPublicId });
      await newVideo.save();
      existingMovie.trailer = newVideo._id;
    }

    // Update other movie details
    existingMovie.name = name;
    existingMovie.landmark = landmark;
    existingMovie.genere = [genere];
    existingMovie.language = language;
    existingMovie.city = city;
    existingMovie.state = state;
    existingMovie.country = country;
    
    // Update showtimes
    if (showtimes && showtimes.length > 0) {
      existingMovie.showtimes = showtimes;
    }

    // Save the updated movie object
    await existingMovie.save();

    res.json({ message: 'Movie updated successfully', movie: existingMovie });
  } catch (error) {
    console.error('Error updating movie:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteMovie = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Find the movie by ID and populate photo and trailer fields
    const movieToDelete = await Movie.findById(id).populate<{ photo: IPhoto, trailer: IVideo }>('photo trailer');

    if (!movieToDelete) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // Delete associated photo and trailer if they exist
    if (movieToDelete.photo) {
      const photoDoc = movieToDelete.photo as unknown as IPhoto & { _id: any };
      await Photo.findByIdAndDelete(photoDoc._id);
    }

    if (movieToDelete.trailer) {
      const trailerDoc = movieToDelete.trailer as unknown as IVideo & { _id: any };
      await Video.findByIdAndDelete(trailerDoc._id);
    }

    await Movie.findByIdAndDelete(id);

    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    console.error('Error deleting movie:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
export const searchMovies = async (req: Request, res: Response) => {
  const { query } = req.query;

  try {
    // Define the search criteria based on name, landmark, country, state
    const searchCriteria = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { landmark: { $regex: query, $options: 'i' } },
        {genere: { $regex: query, $options: 'i' } },
        { language: { $regex: query, $options: 'i' } },
        { country: { $regex: query, $options: 'i' } },
        { state: { $regex: query, $options: 'i' } },
      ],
    };

    // Perform the search
    const movies = await Movie.find(searchCriteria);

    res.json({ movies });
  } catch (error) {
    console.error('Error searching movies:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
// src/controllers/movieController.ts
export const getMovies = async (req: Request, res: Response) => {
  try {
    const movies = await Movie.find().populate('photo').populate('trailer');
    res.json(movies);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
};
