const AuthEmployee = require('../models/employee');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const {errorHandler} = require('../helpers/dbErrorHandler');


exports.signup = (req, res) => {
    console.log('req.body', req.body);
    const employeeObj = new AuthEmployee(req.body);
    employeeObj.save((err, employee) => {
        if (err) {
            return res.status(400).json({
                err: errorHandler(err)
            });
        }

        employee.salt = undefined;
        employee.hashed_password = undefined;
        res.json({
            employee
        });
    })
};


exports.signin = (req, res) => {
    // find user base on email
    const {email, password} = req.body;
    AuthEmployee.findOne({email}, (err, employee) => {
        if (err || !employee) {
            return res.status(400).json({
                err: "Employee with email id not found, please signup"
            })
        }
        //if user is found make sure that password match
        // create authentication method in user model
        if (!employee.authenticate(password)) {
            return res.status(401).json({
                error: "Email and password dont match"
            });
        }
        //generate token
        const token = jwt.sign({_id: employee._id}, process.env.JWT_SECRET);
        //persist the token as t in cookie with expiry date
        res.cookie("t", token, {expire: new Date() + 9999});

        const {_id, first_name, last_name, email, employee_id, organization_name} = employee;

        return res.json({token, user: {_id, first_name, last_name, email, employee_id, organization_name}});
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
    let employee = req.profile && req.auth && req.profile._id == req.auth._id;
    if (!employee) {
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
