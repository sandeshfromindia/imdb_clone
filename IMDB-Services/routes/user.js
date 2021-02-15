const express = require('express');
const router = express.Router();
const {requireSignin, isAdmin} = require('../controllers/auth');
const {userById, list} = require('../controllers/user');
9
router.get("/user/:userId", requireSignin, (req, res)=>{
    res.json({
        user: req.profile
    });
})
router.get("/users",requireSignin, isAdmin,  list)

router.param("userId", userById);

module.exports = router;
