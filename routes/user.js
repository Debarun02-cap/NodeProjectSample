//Local Module
const citizenController = require('../controller/citizen')
const upload = require('../utils/uploadUtil');
const isAuth = require('../middleware/is-auth');

//External MOdule
const express = require('express');

const ur = express();

ur.use(isAuth());

ur.get('/home', citizenController.userHome);
ur.get('/register', citizenController.getRegister);
ur.post('/register', upload.single('photo'), citizenController.postRegister);
ur.get('/complaintDetails/:complaintId', citizenController.getComplaintDetails);
ur.get('/profile', citizenController.getProfile);
ur.post('/profile/update', citizenController.postUpdateProfile);

exports.ur = ur;
