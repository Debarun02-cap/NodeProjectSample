//Local Modules
const { getDb } = require('../utils/databaseUtil');

module.exports = class Status {
  constructor(workstatus, title, description, photoUrl, dateTime) {
    this.workstatus = workstatus;
    this.title = title;
    this.description = description;
    this.photoUrl = photoUrl;
    this.dateTime = dateTime;
  }

  // Get all status entries for a single complaintId
  static getForComplaint(complaintId, callback) {
    const db = getDb();
    db.collection('statuses')
      .find({ complaintId: String(complaintId) })
      .toArray()
      .then(statuses => {
        callback(statuses || []);
      })
      .catch(err => {
        console.error('Error fetching statuses for complaint:', err);
        callback([]);
      });
  }

  // For a list of complaintIds, return a map id -> latest status entry
  static getLatestForIds(complaintIds, callback) {
    if (!complaintIds || !complaintIds.length) {
      return callback({});
    }
    const db = getDb();
    const idsAsString = complaintIds.map(id => String(id));

    db.collection('statuses')
      .find({ complaintId: { $in: idsAsString } })
      .toArray()
      .then(allStatuses => {
        const map = {};
        allStatuses.forEach(st => {
          const key = String(st.complaintId);
          // Since we iterate in insertion order, the last one wins (latest)
          map[key] = st;
        });
        callback(map);
      })
      .catch(err => {
        console.error('Error fetching latest statuses for ids:', err);
        callback({});
      });
  }

  // Adds / appends status details for a complaintId into MongoDB
  static addToStatus(complaintId, statusInstance, callback) {
    if (!complaintId) {
      const err = new Error('complaintId is required to save status');
      console.error(err.message);
      if (callback) callback(err);
      return;
    }

    const db = getDb();

    const entry = {
      complaintId: String(complaintId),
      workstatus: statusInstance.workstatus,
      title: statusInstance.title,
      description: statusInstance.description,
      photoUrl: statusInstance.photoUrl,
      dateTime: statusInstance.dateTime,
      userId: statusInstance.userId || null
    };

    db.collection('statuses')
      .insertOne(entry)
      .then(() => {
        console.log('Status saved to MongoDB');
        if (callback) callback(null);
      })
      .catch(err => {
        console.error('Error saving status:', err);
        if (callback) callback(err);
      });
  }
}