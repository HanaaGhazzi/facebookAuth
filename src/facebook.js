'use strict';
require('dotenv').config()
const superagent = require('superagent');
const users = require('./users');
const axios = require('axios')
// 2. Users are redirected back to your site by GitHub
// POST https://github.com/login/oauth/access_token
const tokenUrl = process.env.tokenUrl;
const userUrl = process.env.userUrl;
// add it in .env2803422856585534
const CLIENT_ID = process.env.CLIENT_ID
// add it in .env
const SECRET_ID = process.env.SECRET_ID;
const API_SERVER = process.env.API_SERVER || 'https://facebook-lab12.herokuapp.com/oauth'

module.exports = async function(req, res, next) {
    // 1. get the code from the query 
    let code = req.query.code; // form code
        console.log('resss --------', res.body)
    console.log('(1) CODE ====== ', code);
    // 2. get token 
    let remoteToken = await exchangeCodeWithToken(code);
    console.log('(2) remoteToken =====> ', remoteToken);
    // 3. get user object by the token
    let remoteUser = await getRemoteUserInfo(remoteToken);
    console.log("(3) remoteUser.login-----> ", remoteUser.first_name);

    let [localUser, localToken] = await getUser(remoteUser); 
    console.log("(4) localUser -----> ", localUser, " localToken ===> ", localToken);
    req.user = localUser;
    req.token = localToken;
    next();
}

async function exchangeCodeWithToken(code) {
    // tokenUrl


    let tokenResponse = await superagent.post(tokenUrl).send({
        code : code, 
        client_id: CLIENT_ID,
        client_secret : SECRET_ID,
        redirect_uri: API_SERVER
    });
    return tokenResponse.body.access_token;
}

async function getRemoteUserInfo(access_token) {
    const { data } = await axios({
      url: userUrl,
      method: 'get',
      params: {
        fields: ['id', 'email', 'first_name', 'last_name'].join(','),
        access_token: access_token,
      },
    });
    console.log(data); // { id, email, first_name, last_name }
    return data;
  };


// async function getRemoteUserInfo(token) {
//     let userResponse = await superagent.get(userUrl)
//         .set('Authorization', `token ${token}`)
//         .set('user-agent', '401d6-app');
//     let user = userResponse.body;
//     return user;
// }

async function getUser(userObj) {
    let userRecord = {
        username: userObj.first_name,
        password: 'ouathpass'
    };
    let user = await users.save(userRecord);
    let token = await users.generateToken(user);
    return [user, token];
}