//Local Modules
const { getDb } = require('../utils/databaseUtil');

module.exports = class Photo {
  static savePhoto(fileBuffer, contentType, callback) {
    const db = getDb();
    const photoId = Math.random().toString();

    // MongoDB v7 handles Buffer directly, no need for Binary wrapper
    const photoDoc = {
      id: photoId,
      data: fileBuffer, // Buffer is stored directly
      contentType: contentType,
      createdAt: new Date()
    };

    db.collection('photos')
      .insertOne(photoDoc)
      .then(() => {
        console.log('Photo saved to MongoDB with id:', photoId);
        callback(null, photoId);
      })
      .catch(err => {
        console.error('Error saving photo:', err);
        callback(err, null);
      });
  }

  static getPhoto(photoId, callback) {
    const db = getDb();
    db.collection('photos')
      .findOne({ id: photoId })
      .then(photo => {
        if (photo) {
          // Handle both Buffer and Binary types
          const buffer = Buffer.isBuffer(photo.data)
            ? photo.data
            : (photo.data && photo.data.buffer ? photo.data.buffer : photo.data);

          callback(null, {
            data: buffer,
            contentType: photo.contentType || 'image/jpeg'
          });
        } else {
          callback(new Error('Photo not found'), null);
        }
      })
      .catch(err => {
        console.error('Error fetching photo:', err);
        callback(err, null);
      });
  }
}

