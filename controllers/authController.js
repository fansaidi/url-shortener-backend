const userSchema = require('../schema/users');
const { graphql } = require('graphql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = function (req, res) {
    const email = req.body.email;
    const password = req.body.password;

    let query = `query {userExists(email:"${email}"){
        id,
        email,
        password,
      }
    }`;

    graphql(userSchema, query).then(result => {
        if (result.data.userExists != null) {
            let user = result.data.userExists;
            let hash = user.password;

            bcrypt.compare(password, hash, function (err, result) {
                if (result) {
                    const secretKey = process.env.SECRET_KEY || 'secret';
                    let expiresIn = 24 * 60 * 60;
                    let accessToken = jwt.sign({ sub: user.id }, secretKey, {
                        expiresIn: expiresIn
                    });

                    return res.status(200).json({
                        "access_token": accessToken,
                        "expires_in": expiresIn
                    });
                }
                else {
                    return res.status(401).json(result);
                }
            });
        }
        else {
            return res.status(404).json('User not found');
        }
    }).catch((err) => {
        console.log(err);
        return res.status(500).json('Server error');
    });
};

exports.register = function (req, res) {

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
                if (result.data.createUser != null) {
                    const secretKey = process.env.SECRET_KEY || 'secret';
                    let user = result.data.createUser;
                    let expiresIn = 24 * 60 * 60;
                    let accessToken = jwt.sign({ sub: user.id }, secretKey, {
                        expiresIn: expiresIn
                    });
                    res.status(200).json({
                        "user": user,
                        "access_token": accessToken,
                        "expires_in": expiresIn
                    });
                }
                else {
                    return res.status(422).json(result);
                }

            }).catch((err) => {
                console.log(err);
                return res.status(500).json('Server error');
            });
        }
    });
}
