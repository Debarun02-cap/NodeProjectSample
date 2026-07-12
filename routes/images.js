//External Module
const express = require('express');
const Photo = require('../models/photo');

const router = express();

// Route to serve images from MongoDB
router.get('/photo/:photoId', (req, res, next) => {
  const photoId = req.params.photoId;

  Photo.getPhoto(photoId, (err, photo) => {
    if (err || !photo) {
      return res.status(404).send('Photo not found');
    }

    res.contentType(photo.contentType);
    res.send(photo.data);
  });
});

module.exports = router;

