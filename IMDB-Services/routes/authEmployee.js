const express = require('express');
const router = express.Router();

const {signup, signin, signout, requireSignin} = require('../controllers/authEmployee');

const {employeeSignupValidator} = require('../validator/index');

router.post("/employee/signup", employeeSignupValidator, signup);
router.post("/employee/signin", signin);
router.get("/employee/signout", requireSignin, signout);

module.exports = router;
