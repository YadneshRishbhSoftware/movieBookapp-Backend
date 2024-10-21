// src/routes/photoUploadRoutes.ts
import { Router, Request, Response } from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinaryConfig';

const router = Router();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads/photos',
    format: async (req: Request, file: Express.Multer.File): Promise<string> => 'jpg',
    public_id: (req: Request, file: Express.Multer.File): string => `photo_${Date.now()}`
  } as any, // Cast to any to bypass type issues
});

const upload = multer({ storage: storage });

router.post('/photo', upload.single('photo'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({ url: (req.file as any).path, publicId: (req.file as any).filename });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router;
