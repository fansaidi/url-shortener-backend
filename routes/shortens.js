var express = require('express');
var router = express.Router();
var authenticateJWT = require('../middlewares/authenticateJWT');
var shortenedUrlController = require('../controllers/shortenedUrlController');

// Get the list of shortened Url
router.get('/', shortenedUrlController.shortenedUrl_list);
// Test protected route
router.get('/protected', authenticateJWT, shortenedUrlController.shortenedUrl_list);

// Create shortened Url
router.post('/url', shortenedUrlController.shortenedUrl_create_post);


module.exports = router;
