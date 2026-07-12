//External MOdule
const express = require('express');

//Local Module
const authController = require('../controller/auth')

const router = express();
router.get('/', authController.getIndex);
router.get('/auth/login', authController.getLogin);
router.post('/auth/login', authController.postLogin);
router.get('/auth/signup', authController.getSignup);
router.post('/auth/signup', authController.postSignup);
router.post('/auth/logout', authController.postLogout);

module.exports = router;