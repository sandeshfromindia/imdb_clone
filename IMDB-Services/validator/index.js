exports.userSignupValidator = (req, res, next) => {
    req.check('name', 'Name is required').notEmpty();
    req.check('email', 'Email must be between 3 to 32 characters')
        .matches(/.+\@.+\..+/)
        .withMessage('Email must contains @')
        .isLength({
        min: 3,
        max: 32
    });
    req.check('password', 'Password is required').notEmpty();
    req.check('password')
        .isLength({min:6})
        .withMessage('Password must contain 6 characters')
        .matches(/\d/)
        .withMessage('Password must contains at least 1 number');

    const errors = req.validationErrors();
    if(errors){
        const firstError = errors.map(error => error.msg).join(' | ');
        return res.status(400).json({error: firstError});
    }
    next();
}


exports.employeeSignupValidator = (req, res, next) => {
    req.check('first_name', 'First Name is required').notEmpty();
    req.check('last_name', 'Last Name is required').notEmpty();
    req.check('employee_id', 'Employee ID is required').notEmpty();
    req.check('organization_name', 'Organization Name is required').notEmpty();
    req.check('email', 'Email must be between 3 to 32 characters')
        .matches(/.+\@.+\..+/)
        .withMessage('Email must contains @')
        .isLength({
            min: 3,
            max: 32
        });
    req.check('password', 'Password is required').notEmpty();
    req.check('password')
        .isLength({min:6})
        .withMessage('Password must contain 6 characters')
        .matches(/\d/)
        .withMessage('Password must contains at least 1 number');

    const errors = req.validationErrors();
    //console.log(errors);
    if(errors){
        const firstError = errors.map(error => error.msg).join(' | ');
        return res.status(400).json({error: firstError});
    }
    next();
}
