const express = require('express');
const router = express.Router();
const {requireSignin, isAdmin } = require('../controllers/authEmployee');
const {employeeById, list} = require('../controllers/employee');

router.get("/employee/:empId", requireSignin, (req, res)=>{
    res.json({
        user: req.profile
    });
})

router.get("/employees", isAdmin, list)
router.param("empId", employeeById);

module.exports = router;
