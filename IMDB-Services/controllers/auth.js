const Auth = require('../models/user');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const {errorHandler} = require('../helpers/dbErrorHandler');


exports.signup = (req, res) => {
    console.log('req.body', req.body);
    const user = new Auth(req.body);
    user.save((err, user) => {
        if (err) {
            return res.status(400).json({
                err: errorHandler(err)
            });
        }

        user.salt = undefined;
        user.hashed_password = undefined;
        res.json({
            user
        });
    })
};


exports.signin = (req, res) => {
    // find user base on email
    const {email, password} = req.body;
    Auth.findOne({email}, (err, user) => {
        if (err || !user) {
            return res.status(400).json({
                err: "User with email id not found, please signup"
            })
        }
        //if user is found make sure that password match
        // create authentication method in user model
        if (!user.authenticate(password)) {
            return res.status(401).json({
                error: "Email and password dont match"
            });
        }
        //generate token
        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET);
        //persist the token as t in cookie with expiry date
        res.cookie("t", token, {expire: new Date() + 9999});

        const {_id, name, email, role} = user;

        return res.json({token, user: {_id, name, email, role}});
    })
};


exports.signout = (req, res) => {
    res.clearCookie("t");
    res.json({message: "Signout sucess"});
};


exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    requestProperty: "auth",
    algorithms: ['sha1', 'RS256', 'HS256'],
});


exports.isAuth = (req, res, next) => {
    let user = req.profile && req.auth && req.profile._id == req.auth._id;
    if (!user) {
        return res.status(403).json({
            error: "Access Denied"
        });
    }
    next();
};


exports.isAdmin = (req, res, next) => {
    if (!req.profile || req.profile.role === 0) {
        return res.status(403).json({
            error: "Admin resource!, Access Denied"
        });
    }
    next();
};
