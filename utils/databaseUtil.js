//External Module
const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

// Connection string comes from the MONGO_URL environment variable (see .env).
const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
  throw new Error('MONGO_URL is not set. Copy .env.example to .env and fill it in.');
}

let _db;

// Initialize MongoDB connection and cache the db instance
const dbConnect = (callback) => {
  MongoClient.connect(MONGO_URL)
    .then((client) => {
      // Explicitly use the FixMyCity database
      _db = client.db('FixMyCity');
      if (callback) callback(_db);
    })
    .catch((err) => {
      console.log('MongoDB connection error:', err);
      throw err;
    });
};

// Get the cached db instance after connection
const getDb = () => {
  if (!_db) {
    throw new Error('No database found! Have you called dbConnect()?');
  }
  return _db;
};

module.exports = {
  dbConnect,
  getDb
};