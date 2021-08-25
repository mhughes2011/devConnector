const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const {body, validationResult} = require('express-validator');

const User = require('../../models/User');

// @route   GET api/users
// @desc    Register user
// @access  Public
router.post('/',
[ 
    //The next three lines are express validator middleware functions to check for validation errors.  Easy way to handle validation.
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please include a valide email').isEmail(),
    body('password', 'Password must be 6 or more characters').isLength({min: 6})
],  
async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const {name, email, password} = req.body;

    try {
        // See if the user exists
        let user = await User.findOne({email: email});
        if(user) {
            return res.status(400).json({ errors: [{msg: 'User already exists'}]});
            //Above return statement allows headers to be resent which I'm resending the status code
        }

        // Get user's gravatar
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        })

        user = new User({
            name,
            email,
            avatar,
            password
        });

        // Encrypt password using bcrypt
        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Return JSON web token


        res.send('User registered')
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;