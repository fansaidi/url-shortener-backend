const sqlite = require('sqlite3').verbose();
const path = require('path')

// Set database source path
const dbName = process.env.DATABASE_NAME || 'url-shortener.db'
const dbSource = path.join(__dirname,'../', dbName);
// Create a database if not exists
const database = new sqlite.Database(dbSource, (err) => {
    if (err) {
        console.error(err.message);
        throw err;
    }
    console.log('Connected to the database.');
    // Call functions to init the table
    createShortenedUrlsTable();
    createUsersTable();
});

// TODO: Separate migaration folder
// Create a table for shortened urls
const createShortenedUrlsTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS shortenedUrls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        originalUrl TEXT,
        urlCode TEXT,
        shortUrl TEXT,
        clicks INTEGER DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP )`;

    return database.run(query, (err) => {
        if (err) {
            console.log('Error creating ShortenedUrls table!');
            throw err;
        }
        else {
            console.log('ShotenedUrls table created :)');
        }
    });
}

// Create a table for users
const createUsersTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT,
        password TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP )`;

    return database.run(query, (err) => {
        if (err) {
            console.log('Error creating users table!');
            throw err;
        }
        else {
            console.log('Users table created :)');
        }
    });
}

module.exports = database;