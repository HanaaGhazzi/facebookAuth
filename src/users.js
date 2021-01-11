'use strict';

let bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

let db = {};

let users = {};

let SECRET = 'tobeornottobe';

/*
hanaa : {
    username: hanaa,
    password: Hanaa1998 XX => we have to encrypt it
},
mohammed: {
    username: mohammed,
    password: mohammed1998 XX => do not save passwords as plain text
}
*/
users.save = async function(record) {
    //username & password
    if (!db[record.username]) {
        // hash our password before saving it!!
        record.password = await bcrypt.hash(record.password, 5);
        // Create a new user
        db[record.username] = record;
        return record;
    }

    return Promise.reject();

}

users.authenticateBasic = async function(user, pass) {
    console.log("user >> >", user)
    if (db[user]) {
        // compare the password text from the form with the encrypted password from DB
        return await bcrypt.compare(pass, db[user].password);
    }
    return Promise.reject();
}

users.generateToken = async function(user) {
    let token = jwt.sign({username: user}, SECRET);
    console.log("generateToken >> token : ", token);
    return token;
}

module.exports = users;