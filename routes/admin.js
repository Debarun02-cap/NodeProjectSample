//External MOdule
const express = require('express');

//Local Module
const adminController = require('../controller/admin');
const upload = require('../utils/uploadUtil');
const isAuth = require('../middleware/is-auth');

const ar = express();

ar.use(isAuth('admin'));

ar.get('/home', adminController.adminHome);
ar.get('/complaintDetails/:complaintId', adminController.getComplaintDetails);
ar.get('/updateStatus/:complaintId', adminController.getupdateStatus);
ar.post('/statusUpdate/:complaintId', upload.single('photo'), adminController.postUpdateStatus);
ar.get('/profile', adminController.getProfile);
ar.post('/profile/update', adminController.postUpdateProfile);

module.exports = ar;