const graphql = require('graphql');
const db = require('../config/database');

// Define graphql object type
const UserType = new graphql.GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: graphql.GraphQLID },
    email: { type: graphql.GraphQLString },
    password: { type: graphql.GraphQLString },
  }),
});

// Create a graphql query type
const queryType = new graphql.GraphQLObjectType({
  name: 'Query',
  fields: {
    users: {
      type: graphql.GraphQLList(UserType),
      resolve: () => {
        return new Promise((resolve, reject) => {
          let sql = `SELECT * FROM users`;
          db.all(sql, [], (err, rows) => {
            if (err) {
              reject([]);
            }
            resolve(rows);
          });
        });
      }
    },
    user: {
      type: UserType,
      args: {
        id: { type: new graphql.GraphQLNonNull(graphql.GraphQLID) },
      },
      resolve: (root, { id }) => {
        return new Promise((resolve, reject) => {
          let sql = `SELECT * FROM users WHERE id = (?)`;
          db.all(sql, [id], (err, rows) => {
            if (err) {
              reject(null);
            }
            resolve(rows[0]);
          });
        });
      }
    },
    userExists: {
      type: UserType,
      args: {
        id: {
          type: graphql.GraphQLID,
          defaultValue: null,
        },
        email: {
          type: graphql.GraphQLString,
          defaultValue: null,
        },
      },
      resolve: (root, { id, email }) => {
        return new Promise((resolve, reject) => {
          let sql = `SELECT * FROM users WHERE id = (?) OR email = (?)`;
          db.all(sql, [id, email], (err, rows) => {
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
const mutationType = new graphql.GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createUser: {
      type: UserType,
      args: {
        email: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLString)
        },
        password: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLString)
        },
      },
      resolve: (root, { email, password }) => {
        return new Promise((resolve, reject) => {
          let selectQuery = `SELECT * FROM users WHERE email = (?)`;
          db.all(selectQuery, [email], (err, rows) => {
            if (err) {
              reject(null);
            }

            if (rows[0] != null) {
              reject('Email is not available');
            }
            else {
              let insertQuery = `INSERT INTO users (email, password) VALUES (?,?)`;
              db.run(insertQuery, [email, password], (err) => {
                if (err) {
                  reject(null);
                }
                db.get("SELECT last_insert_rowid() as id", (err, row) => {
                  resolve({
                    id: row["id"],
                    email: email,
                  });
                });
              });
            }
          });
        });
      }
    },
    updateUser: {
      type: graphql.GraphQLString,
      args: {
        id: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLID)
        },
        email: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLString)
        },
      },
      resolve: (root, { id, email }) => {
        return new Promise((resolve, reject) => {
          let sql = `UPDATE users SET email = (?) WHERE id = (?)`;
          db.run(sql, [email, id], (err) => {
            if (err) {
              reject(err);
            }
            resolve(`User #${id} updated`);

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
          db.run('DELETE from users WHERE id =(?);', [id], (err) => {
            if (err) {
              reject(err);
            }
            resolve(`User #${id} deleted`);
          });
        })
      }
    }
  }
});

const schema = new graphql.GraphQLSchema({
  query: queryType,
  mutation: mutationType,
});

module.exports = schema;
