import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import movieRoutes from './routes/movieRoutes';
import photoUploadRoutes from './routes/photoUploadRoutes';
import trailerUploadRoutes from './routes/trailerUploadRoutes';
import bodyParser from 'body-parser';
import errorHandler from './config/errorHandler';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import paymentRoutes from './routes/paymentRoutes';


dotenv.config();

const PORT = process.env.PORT || 4000;

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Movie Ticket Booking API',
      version: '1.0.0',
      description: 'API documentation for the Movie Ticket Booking App',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Adjust the path according to where your route files are located
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
const app = express();

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/upload', photoUploadRoutes);
app.use('/api/trailers', trailerUploadRoutes);
app.use('/api/payment', paymentRoutes); // Use payment routes

// Swagger route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Error-handling middleware
app.use(errorHandler);

// Database connection
mongoose.connect(process.env.MONGO_URI!, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as mongoose.ConnectOptions)
  .then(() => console.log(`Worker ${process.pid}: MongoDB connected`))
  .catch(err => console.error(`Worker ${process.pid}: MongoDB connection error:`, err));

// Start the server in each worker
app.listen(PORT, () => console.log(`Worker ${process.pid} ⚡️ Server running on port ${PORT}`));
