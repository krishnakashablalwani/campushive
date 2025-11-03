import express from 'express';
import multer from 'multer';

import { authenticate } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Use memory storage so we can persist the avatar into the database
const storage = multer.memoryStorage();
function imageFilter(req, file, cb) {
  if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image uploads are allowed'));
  cb(null, true);
}
const upload = multer({ storage, fileFilter: imageFilter, limits: { fileSize: 2 * 1024 * 1024 } });

// Get profile
router.get('/', authenticate, async (req, res) => {
  // auth middleware attaches user; send without password
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
});

// Serve avatar binary from DB
router.get('/avatar/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('avatar');
    if (!user || !user.avatar || !user.avatar.data) return res.status(404).send('Not found');
    res.set('Content-Type', user.avatar.contentType || 'image/png');
    // Cache for short period
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(user.avatar.data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update profile (with optional avatar upload)
router.put('/', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'department', 'dob', 'bloodGroup'];
    const update = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }

    if (update.dob) {
      const parsed = new Date(update.dob);
      if (!isNaN(parsed.getTime())) update.dob = parsed;
      else delete update.dob;
    }

    // If avatar uploaded, persist into DB and set avatarUrl to the serving endpoint
    if (req.file) {
      update.avatar = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
      update.avatarUrl = `/api/profile/avatar/${req.user._id}`;
    }

    const user = await User.findByIdAndUpdate(req.user._id, { $set: update }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
