// Local Modules
const { getDb } = require('../utils/databaseUtil');

module.exports = class User {
  constructor(firstname, lastname, email, mobile, address, city, state, aadhar, password, role) {
    this.firstname = firstname;
    this.lastname = lastname;
    this.email = email;
    this.mobile = mobile;
    this.address = address;
    this.city = city;
    this.state = state;
    this.aadhar = aadhar;
    this.password = password; // NOTE: plain text for demo; hash in real apps
    this.role = role;
  }

  save() {
    const db = getDb();
    this.id = Math.random().toString();
    return db
      .collection('users')
      .insertOne(this)
      .then(() => {
        console.log('User saved to MongoDB');
      })
      .catch(err => {
        console.error('Error saving user:', err);
      });
  }

  // Find by email OR mobile + password + role
  static findByCredentials(identifier, password, role, callback) {
    const db = getDb();
    db.collection('users')
      .findOne({
        role,
        password,
        $or: [{ email: identifier }, { mobile: identifier }]
      })
      .then(user => {
        callback(user || null);
      })
      .catch(err => {
        console.error('Error finding user by credentials:', err);
        callback(null);
      });
  }

  static findById(userId, callback) {
    const db = getDb();
    let query = { id: userId };
    
    try {
      if (userId && typeof userId === 'string' && userId.length === 24) {
        const { ObjectId } = require('mongodb');
        query = { $or: [{ id: userId }, { _id: new ObjectId(userId) }] };
      }
    } catch (e) {
      // Ignore
    }

    db.collection('users')
      .findOne(query)
      .then(user => {
        callback(user || null);
      })
      .catch(err => {
        console.error('Error finding user by id:', err);
        callback(null);
      });
  }

  static updateProfile(userId, updatedFields, callback) {
    const db = getDb();
    let query = { id: userId };
    
    try {
      if (userId && typeof userId === 'string' && userId.length === 24) {
        const { ObjectId } = require('mongodb');
        query = { $or: [{ id: userId }, { _id: new ObjectId(userId) }] };
      }
    } catch (e) {
      // Ignore
    }

    db.collection('users')
      .findOneAndUpdate(
        query,
        { $set: updatedFields },
        { returnDocument: 'after' }
      )
      .then(result => {
        const user = result && result.value ? result.value : result;
        callback(null, user);
      })
      .catch(err => {
        console.error('Error updating user profile:', err);
        callback(err, null);
      });
  }

  static fetchAll(callback) {
    const db = getDb();
    db.collection('users')
      .find()
      .toArray()
      .then(users => {
        callback(users);
      })
      .catch(err => {
        console.error('Error fetching users:', err);
        callback([]);
      });
  }

  static deleteById(userId, callback) {
    const db = getDb();
    let query = { id: userId };
    
    try {
      if (userId && typeof userId === 'string' && userId.length === 24) {
        const { ObjectId } = require('mongodb');
        query = { $or: [{ id: userId }, { _id: new ObjectId(userId) }] };
      }
    } catch (e) {
      // Ignore
    }

    db.collection('users')
      .deleteOne(query)
      .then(result => {
        callback(null, result);
      })
      .catch(err => {
        console.error('Error deleting user:', err);
        callback(err, null);
      });
  }
}


