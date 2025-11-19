const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const {
  analyzeImageWithGemini,
  analyzeDocumentWithGemini,
} = require('../services/gemini');

const router = express.Router();

// In-memory storage for uploaded files (not persisted to disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// @route   POST /api/utils/analyze-image
// @desc    Analyze an uploaded image with Gemini
router.post(
  '/analyze-image',
  auth,
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Image file is required' });
      }

      const { buffer, mimetype } = req.file;
      const { prompt } = req.body;

      if (!mimetype.startsWith('image/')) {
        return res
          .status(400)
          .json({ message: 'Only image files are supported' });
      }

      const analysis = await analyzeImageWithGemini({
        buffer,
        mimeType: mimetype,
        prompt,
      });

      res.json({ analysis });
    } catch (err) {
      console.error('Analyze image error:', err);
      res.status(500).json({ message: 'Failed to analyze image' });
    }
  },
);

// @route   POST /api/utils/analyze-document
// @desc    Analyze an uploaded document with Gemini
router.post(
  '/analyze-document',
  auth,
  upload.single('document'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Document file is required' });
      }

      const { buffer, mimetype, originalname } = req.file;
      const { prompt } = req.body;

      const supportedMimeTypes = [
        'application/pdf',
        'text/plain',
      ];

      if (!supportedMimeTypes.includes(mimetype)) {
        return res.status(400).json({
          message:
            'Unsupported document type. Please upload a PDF or plain text file.',
        });
      }

      const analysis = await analyzeDocumentWithGemini({
        buffer,
        mimeType: mimetype,
        filename: originalname,
        prompt,
      });

      res.json({ analysis });
    } catch (err) {
      console.error('Analyze document error:', err);
      res.status(500).json({ message: 'Failed to analyze document' });
    }
  },
);

module.exports = router;
