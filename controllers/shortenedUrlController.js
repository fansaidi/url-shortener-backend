var shortenedUrlSchema = require('../schema/shortenedURLs');
const { graphql } = require('graphql');
const dns = require('dns');
const nanoid = require('nanoid');

// Display list of all ShortenedUrls
exports.shortenedUrl_list = function (req, res) {
    // Insert to storage
    let query = `query {shortenedUrls{
            id,
            originalUrl,
            shortUrl,
            clicks,
            createdAt,
          }
        }`;

    graphql(shortenedUrlSchema, query).then(result => {
        return res.json(result);
    });
};

// Handle ShortenedUrl create on POST
exports.shortenedUrl_create_post = function (req, res) {
    let originalUrl;
    // Check original url
    try {
        originalUrl = new URL(req.body.originalUrl);
    } catch (err) {
        return res.status(400).send({ error: 'invalid URL' });
    }

    dns.lookup(originalUrl.hostname, (err) => {
        if (err) {
            return res.status(404).send({ error: 'Address not found' });
        }
    });
    // Generate url code
    let urlCode = nanoid(6);

    let baseUrl = process.env.APP_URL || req.protocol+"://"+req.get('host');

    // Create shortened url
    let shortUrl = baseUrl + "/" + urlCode;

    // Insert to storage
    let query = `mutation {createShortenedUrl(originalUrl: "${originalUrl}",shortUrl: "${shortUrl}",urlCode:"${urlCode}"){
          id,originalUrl,
          urlCode,
          shortUrl
        }
      }`;

    graphql(shortenedUrlSchema, query).then(result => {
        return res.json(result);
    });
};

// Redirect to original URL
exports.shortenedUrl_redirect = function (req, res) {
    let urlCode = req.params.shortId;

    // Check url code exists
    let query = `query {urlExists(urlCode:"${urlCode}"){
          id,
          originalUrl,
          urlCode,
          shortUrl
        }
      }`;

    graphql(shortenedUrlSchema, query).then(result => {
        if (result.data.urlExists != null) {
            let shortenedUrl = result.data.urlExists;
            _addClickCounts(shortenedUrl.id);
            let url = shortenedUrl.originalUrl;
            return res.redirect(url);
        }
        return res.status(404).json('URL not found');
    }).catch((err) => {
        console.log(err);
        return res.status(500).json('Server error');
    });
};

// Click counts increment
const _addClickCounts = function (id) {
    let query = `mutation {addShortenedUrlClicks(id:"${id}")}`;

    graphql(shortenedUrlSchema, query).catch((err) => {
        console.log(err);
    });
}