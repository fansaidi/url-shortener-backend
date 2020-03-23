const graphql = require('graphql');
const db = require('../config/database');

// Define graphql object type
const ShortenedUrlType = new graphql.GraphQLObjectType({
  name: "ShortenedUrl",
  fields: () => ({
    id: { type: graphql.GraphQLID },
    originalUrl: { type: graphql.GraphQLString },
    urlCode: { type: graphql.GraphQLString },
    shortUrl: { type: graphql.GraphQLString },
    clicks: { type: graphql.GraphQLInt },
    createdAt: { type: graphql.GraphQLString }
  }),
});

// Create a graphql query type
const ShortenedUrlQueryType = new graphql.GraphQLObjectType({
  name: 'Query',
  fields: {
    shortenedUrls: {
      type: graphql.GraphQLList(ShortenedUrlType),
      resolve: () => {
        return new Promise((resolve, reject) => {
          let sql = `SELECT * FROM shortenedUrls`;
          db.all(sql, [], (err, rows) => {
            if (err) {
              reject([]);
            }
            resolve(rows);
          });
        });
      }
    },
    shortenedUrl: {
      type: ShortenedUrlType,
      args: {
        id: { type: new graphql.GraphQLNonNull(graphql.GraphQLID) },
      },
      resolve: (root, { id }) => {
        return new Promise((resolve, reject) => {
          let sql = `SELECT * FROM shortenedUrls WHERE id = (?)`;
          db.all(sql, [id], (err, rows) => {
            if (err) {
              reject(null);
            }
            resolve(rows[0]);
          });
        });
      }
    },
    urlExists: {
      type: ShortenedUrlType,
      args: {
        id: {
          type: graphql.GraphQLID,
          defaultValue: null,
        },
        originalUrl: {
          type: graphql.GraphQLString,
          defaultValue: null,
        },
        urlCode: {
          type: graphql.GraphQLString,
          defaultValue: null,
        },
        shortUrl: {
          type: graphql.GraphQLString,
          defaultValue: null,
        },
      },
      resolve: (root, { id, originalUrl, urlCode, shortUrl }) => {
        return new Promise((resolve, reject) => {
          let sql = `SELECT * FROM shortenedUrls WHERE id = (?) OR originalUrl = (?) OR urlCode = (?) OR shortUrl = (?)`;
          db.all(sql, [id, originalUrl, urlCode, shortUrl], (err, rows) => {
            if (err) {
              reject(null);
            }
            resolve(rows[0]);
          });
        });
      }
    },
  },
});

// Create a graphql mutation type
const ShortenedUrlMutationType = new graphql.GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createShortenedUrl: {
      type: ShortenedUrlType,
      args: {
        originalUrl: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLString)
        },
        urlCode: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLString)
        },
        shortUrl: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLString)
        },
      },
      resolve: (root, { originalUrl, urlCode, shortUrl }) => {
        return new Promise((resolve, reject) => {
          let selectQuery = `SELECT * FROM shortenedUrls WHERE originalUrl = (?)`;
          db.all(selectQuery, [originalUrl], (err, rows) => {
            if (err) {
              reject(null);
            }

            if (rows[0] != null) {
              reject('URL is not available');
            }
            else {
              let insertQuery = `INSERT INTO shortenedUrls (originalUrl, UrlCode, shortUrl) VALUES (?,?,?)`;
              db.run(insertQuery, [originalUrl, urlCode, shortUrl], (err) => {
                if (err) {
                  reject(null);
                }
                db.get("SELECT last_insert_rowid() as id", (err, row) => {
                  resolve({
                    id: row["id"],
                    originalUrl: originalUrl,
                    urlCode: urlCode,
                    shortUrl: shortUrl,
                    createdAt: row['createdAt']
                  });
                });
              });
            }
          });
        });
      }
    },
    updateShortenedUrl: {
      type: graphql.GraphQLString,
      args: {
        id: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLID)
        },
        originalUrl: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLString)
        },
        urlCode: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLString)
        },
        shortUrl: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLString)
        },
      },
      resolve: (root, { id, originalUrl, urlCode, shortUrl }) => {
        return new Promise((resolve, reject) => {
          let sql = `UPDATE shortenedUrls SET originalUrl = (?), urlCode = (?), shortUrl = (?) WHERE id = (?)`;
          db.run(sql, [originalUrl, urlCode, shortUrl, id], (err) => {
            if (err) {
              reject(err);
            }
            resolve(`Url #${id} updated`);
          });
        })
      }
    },
    addShortenedUrlClicks: {
      type: graphql.GraphQLString,
      args: {
        id: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLID),
        }
      },
      resolve: (root, { id }) => {
        return new Promise((resolve, reject) => {
          db.run('UPDATE shortenedUrls SET clicks=clicks + 1 WHERE id = (?)', [id], (err) => {
            if (err) {
              reject(err);
            }
            resolve(`clicks for Url #${id} updated`);
          });
        })
      }
    },
    deleteShortenedUrl: {
      type: graphql.GraphQLString,
      args: {
        id: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLID)
        }
      },
      resolve: (root, { id }) => {
        return new Promise((resolve, reject) => {
          db.run('DELETE from shortenedUrls WHERE id =(?);', [id], (err) => {
            if (err) {
              reject(err);
            }
            resolve(`Url #${id} deleted`);
          });
        })
      }
    }
  }
});

const schema = new graphql.GraphQLSchema({
  query: ShortenedUrlQueryType,
  mutation: ShortenedUrlMutationType,
});

exports.ShortenedUrlQueryType;
exports.ShortenedUrlMutationType;

module.exports = schema;
