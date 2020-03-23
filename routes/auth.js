var express = require('express');
var router = express.Router();
var authController = require('../controllers/authController');

// Login route
router.post('/login', authController.login);

// Register route
router.post('/register', authController.register);

module.exports = router;
