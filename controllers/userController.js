var userSchema = require('../schema/users');
const { graphql } = require('graphql');
const bcrypt = require('bcrypt');

// Display list of all Users
exports.user_list = function (req, res) {
    let query = `query {users{id,email}}`;

    graphql(userSchema, query).then(result => {
        return res.json(result);
    });
};

// Display detail page for a specific User
exports.user_detail = function (req, res) {
    let query = `query {user(id:"${req.params.id}"){id,email}}`;

    graphql(userSchema, query).then(result => {
        console.log(result);
        return res.json(result);
    });
};

// Handle User create on POST
exports.user_create_post = function (req, res) {

    const saltRounds = 10;
    const email = req.body.email;
    const password = req.body.password;

    bcrypt.hash(password, saltRounds, function (err, hash) {
        if (err) {
            return res.status(500).send({ error: 'Server error' });
        }
        else {
            // Insert to storage
            let query = `mutation {createUser(email: "${email}",password: "${hash}",){id,email}}`;

            graphql(userSchema, query).then(result => {
                return res.json(result);
            });
        }
    });
};