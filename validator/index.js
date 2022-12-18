exports.userSignupValidator=(req,res,next)=> {
    req.check("name","Name is required").notEmpty();
    req.check("email","Enter a Valid email")
    .matches('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
    req.check("password","Password is required").notEmpty();
    req.check('password')
        .isLength({ min: 6 })
        .withMessage('Password must contain at least 6 characters')
        .matches(/\d/)
        .withMessage('Password must contain a number');
    const errors = req.validationErrors();
    if (errors) {
        const firstError = errors.map(error => error.msg)[0];
        return res.status(400).json({ error: firstError });
    }
    next();
};