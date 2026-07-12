//Local Modules (MongoDB helper)
const { getDb } = require('../utils/databaseUtil');

module.exports = class Complaint {
  constructor(issuetype, title, description, photoUrl, locationUrl) {
    this.issuetype = issuetype;
    this.title = title;
    this.description = description;
    this.photoUrl = photoUrl;
    this.locationUrl = locationUrl;
  }

  save() {
    const db = getDb();
    // Keep a string id for routing / linking (separate from Mongo _id)
    this.id = Math.random().toString();
    this.createdAt = new Date();
    return db
      .collection('complaints')
      .insertOne(this)
      .then(() => {
        console.log('Complaint saved to MongoDB');
      })
      .catch(err => {
        console.error('Error saving complaint:', err);
      });
  }

  static fetchAll(callback) {
    const db = getDb();
    db.collection('complaints')
      .find()
      .toArray()
      .then(complaints => {
        callback(complaints);
      })
      .catch(err => {
        console.error('Error fetching complaints:', err);
        callback([]);
      });
  }

  static findById(complaintId, callback) {
    const db = getDb();
    db.collection('complaints')
      .findOne({ id: complaintId })
      .then(complaint => {
        callback(complaint);
      })
      .catch(err => {
        console.error('Error finding complaint by id:', err);
        callback(null);
      });
  }
}