var express = require('express');
var router = express.Router();
var shortenedUrlController = require('../controllers/shortenedUrlController');

/* GET home page. */
router.get('/', function (req, res, next) {
  return res.json('welcome');
});

// Redirect to original URL
router.get('/:shortId', shortenedUrlController.shortenedUrl_redirect);

module.exports = router;
