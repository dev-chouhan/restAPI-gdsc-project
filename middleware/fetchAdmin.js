// Fetch events for current user.

const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWD_SECRET = process.env.AdminSecretKey;

const fetchAdmin = (req, res, next)=>{
    // Get the user from the jwt token and add id to req object.
    const token = req.header("auth-token"); // created a header with name auth-token
    if(!token){
        res.status(401).send({error: "Please autheticate using a valid token 11111"});
    }
    // It can be possible if token is real or not;
    try {
        const data = jwt.verify(token, JWD_SECRET);
        req.admin = data.admin;
        next();
    } catch (error) {
        res.status(401).send({error: "Please autheticate using a valid token"});
    }
}

module.exports = fetchAdmin;