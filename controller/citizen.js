//Local module
const Complaint = require("../models/complaint");
const Status = require("../models/status");
const Photo = require("../models/photo");
const User = require("../models/user");

exports.userHome = (req, res, next) => {
  Complaint.fetchAll((registeredComplaints) => {
    const ids = registeredComplaints.map(c => c.id);
    Status.getLatestForIds(ids, (statusMap) => {
      res.json({
        registeredComplaints: registeredComplaints,
        statusMap: statusMap,
        isLoggedIn: req.isLoggedIn
      });
    });
  });
}
exports.getRegister = (req, res, next) => {
  res.render('citizen/register', { isLoggedIn: req.isLoggedIn });
}


exports.postRegister = (req, res, next) => {
  if (!req.body) {
    if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1) || req.headers.authorization) {
      return res.status(400).json({ success: false, message: 'Invalid request: Missing form data.' });
    }
    return res.status(400).send('Invalid request: Missing form data. Please ensure the form is submitted correctly.');
  }
  console.log("complaint registered " + req.body.title);

  const getUserId = () => {
    if (req.user && req.user.id) {
      return req.user.id;
    }
    if (req.session && req.session.user) {
      return req.session.user.id;
    }
    return null;
  };

  const sendResponse = (statusCode, msg) => {
    if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1) || req.headers.authorization) {
      return res.status(statusCode).json({ success: statusCode === 200, message: msg });
    }
    if (statusCode === 200) {
      res.render('citizen/registeredSuccess', { isLoggedIn: req.isLoggedIn });
    } else {
      res.status(statusCode).send(msg);
    }
  };

  // Handle photo upload - save to MongoDB
  if (req.file) {
    Photo.savePhoto(req.file.buffer, req.file.mimetype, (err, photoId) => {
      if (err) {
        console.error('Error saving photo:', err);
        return sendResponse(500, 'Error saving photo');
      }

      const complaint = new Complaint(req.body.issuetype, req.body.title, req.body.description, photoId, req.body.locationUrl);
      complaint.userId = getUserId();
      complaint.save();
      sendResponse(200, 'Complaint registered successfully');
    });
  } else {
    // No photo uploaded
    const complaint = new Complaint(req.body.issuetype, req.body.title, req.body.description, '', req.body.locationUrl);
    complaint.userId = getUserId();
    complaint.save();
    sendResponse(200, 'Complaint registered successfully');
  }
}

exports.getComplaintDetails = (req, res, next) => {
  const complaintId = req.params.complaintId;
  Complaint.findById(complaintId, complaint => {
    if (!complaint) {
      console.log("Error");
      if (req.xhr || req.headers.accept?.indexOf('json') > -1 || req.headers.authorization) {
        return res.status(404).json({ success: false, message: "Complaint not found" });
      }
      return res.redirect('/user/home');
    }

    Status.getForComplaint(complaintId, (statusUpdates) => {
      if (req.xhr || req.headers.accept?.indexOf('json') > -1 || req.headers.authorization) {
        return res.json({
          success: true,
          complaint,
          statusUpdates
        });
      }
      res.render('citizen/complaintDetails', {
        complaint: complaint,
        statusUpdates: statusUpdates,
        isLoggedIn: req.isLoggedIn
      });
    });
  });
}

exports.getProfile = (req, res, next) => {
  const userId = req.user.id;
  User.findById(userId, user => {
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const profile = { ...user };
    delete profile.password;
    res.json({ success: true, profile });
  });
};

exports.postUpdateProfile = (req, res, next) => {
  const userId = req.user.id;
  const { firstname, lastname, email, mobile, address, city, state, aadhar, password } = req.body;
  
  const updatedFields = {
    firstname,
    lastname,
    email,
    mobile,
    address,
    city,
    state,
    aadhar
  };
  
  if (password && password.trim().length > 0) {
    updatedFields.password = password;
  }
  
  User.updateProfile(userId, updatedFields, (err, user) => {
    if (err || !user) {
      return res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
    const profile = { ...user };
    delete profile.password;
    res.json({ success: true, message: 'Profile updated successfully', profile });
  });
};
