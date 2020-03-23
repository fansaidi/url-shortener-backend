var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController');

// GET all users
router.get('/',userController.user_list);

// Create User
router.post('/create', userController.user_create_post);

// GET one User
router.get('/user/:id', userController.user_detail);

module.exports = router;
