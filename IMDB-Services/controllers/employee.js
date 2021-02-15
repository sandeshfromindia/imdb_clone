const Employee = require('../models/employee');
const {errorHandler} = require('../helpers/dbErrorHandler');


exports.employeeById = (req, res, next, id) =>{
    Employee.findById(id).exec((err, employee)=>{
        if(err || !employee){
            return res.status(404).json({
                error: "Employee Not Found"
            });
        }
        req.profile = employee;
        next();
    })
}

exports.list = (req, res) => {
    let limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
    let sortBy = req.query.sort ? req.query.sort : 'createdAt';
    let sortOrder = req.query.order ? req.query.order : 1;
    let page = 0;
    let filterObj = {};

    if (req.query) {
        if (req.query.page) {
            req.query.page = parseInt(req.query.page);
            page = Number.isInteger(req.query.page) ? req.query.page : 0;
        }
        if (req.query.first_name) {
            filterObj.first_name = { $regex: req.query.first_name, $options: "i" }
        }
        if (req.query.last_name) {
            filterObj.last_name = { $regex: req.query.last_name, $options: "i" }
        }
        if (req.query.employee_id) {
            filterObj.employee_id = { $regex: req.query.employee_id, $options: "i" }
        }
    }
    new Promise((resolve, reject) => {
        Employee.find(filterObj)
            .select(["-salt", "-hashed_password"])
            .limit(limit)
            .skip(limit * page)
            .sort({ sortBy : sortOrder})
            .exec(function (err, employees) {
                if (err) {
                    reject(err);
                } else {
                    resolve(employees);
                }
            })
    }).then((result) => {
        res.status(200).send(result);
    }).catch((err) => {
        return res.status(404).json({
            error: "Employees Not Found"
        });
    })
};
