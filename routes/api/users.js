const express = require('express');
const router = express.Router();
const {body, validationResult} = require('express-validator');

// @route   GET api/users
// @desc    Register user
// @access  Public
router.post('/', 
//The next three lines are express validator middleware functions to check for validation errors.  Easy way to handle validation.
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please include a valide email').isEmail(),
    body('password', 'Password must be 6 or more characters').isLength({min: 6})
, (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    } else {
        res.send('User Route')
    }
});

module.exports = router;