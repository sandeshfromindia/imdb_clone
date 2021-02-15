const User = require('../models/user');
const {errorHandler} = require('../helpers/dbErrorHandler');


exports.userById = (req, res, next, id) => {
    User.findById(id).exec((err, user) => {
        if (err || !user) {
            return res.status(404).json({
                error: "User Not Found"
            });
        }
        req.profile = user;
        next();
    })
};


exports.list = (req, res) => {
    let limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
    let sortBy = req.query.sort ? req.query.sort : 'createdAt';
    let sortOrder = req.query.order ? req.query.order : 1;
    let page = 0;
    let filterObj = {};
    let sortObj = {};
    sortObj[sortBy] = sortOrder;

    console.log(sortObj);

    if (req.query) {
        if (req.query.page) {
            req.query.page = parseInt(req.query.page);
            page = Number.isInteger(req.query.page) ? req.query.page : 0;
        }
        if (req.query.name) {
            filterObj.name = { $regex: req.query.name, $options: "i" }
        }
        if (req.query.email) {
            filterObj.email = { $regex: req.query.email, $options: "i" }
        }
    }
    new Promise((resolve, reject) => {
        User.find(filterObj)
            .select(["-salt", "-hashed_password"])
            .limit(limit)
            .skip(limit * page)
            .sort(sortObj)
            .exec(function (err, users) {
                if (err) {
                    reject(err);
                } else {
                    resolve(users);
                }
            })
    }).then((result) => {
        res.status(200).send(result);
    }).catch((err) => {
        return res.status(404).json({
            error: "User Not Found"
        });
    })
};
