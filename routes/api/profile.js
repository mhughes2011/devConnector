const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const {body, validationResult} = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   GET api/profile/me
// @desc    Get current user's profile via token
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        // Populate allows you to bring in additional information associated with a different model.  In this case it's the user mode and we're bringing in name and avatar.
        const profile = await Profile.findOne({user: req.user.id}).populate('user', ['name', 'avatar']);

        if(!profile) {
            return res.status(400).json({msg: 'There is no profile for this user'});
        }

        res.json(profile)

    }catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/profile
// @desc    Create or update a user's profile
// @access  Private
router.post('/', [auth, [
    body('status', 'Status is required').not().isEmpty(),
    body('skills', 'Skills are required').not().isEmpty()
]],
async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body;

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if(company) profileFields.company = company;
    if(website) profileFields.website = website;
    if(location) profileFields.location = location;
    if(bio) profileFields.bio = bio;
    if(status) profileFields.status = status;
    if(githubusername) profileFields.githubusername = githubusername;
    if(skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    // Build Social Object.  Must intialize this to an empty object in order to add each individual object property.
    profileFields.social = {};
    if(youtube) profileFields.social.youtube = youtube;
    if(twitter) profileFields.social.twitter = twitter;
    if(facebook) profileFields.social.facebook = facebook;
    if(linkedin) profileFields.social.linkedin = linkedin;
    if(instagram) profileFields.social.instagram = instagram;


    try{
        let profile = await Profile.findOne({user: req.user.id});

        if(profile) {
            // If a profile is found, this will update it
            profile = await Profile.findOneAndUpdate(
                {user: req.user.id},
                {$set: profileFields}, 
                {new: true}
            );

            return res.json(profile);
        }

        // If no profile is found, this will create it
        profile = new Profile(profileFields);

        await profile.save();
        res.json(profile);

    }catch(err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }

});

// @route   GET api/profile
// @desc    Get all profiles
// @access  Public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

});

// @route   GET api/profile/user/:user_id
// @desc    Get profile for specific user id
// @access  Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.params.user_id}).populate('user', ['name', 'avatar']);

        if(!profile) return res.status(400).json({msg: 'Profile not found'});
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if(err.kind == 'ObjectId') {
            return res.status(400).json({msg: 'Profile not found'});
        }
        res.status(500).send('Server Error');
    }

});

// @route   DELETE api/profile
// @desc    Delete profile, user & posts
// @access  Private
router.delete('/', auth, async (req, res) => {
    try {
        // @todo - remove user's posts
        // Remove profile
        await Profile.findOneAndRemove({user: req.user.id});
        
        // Remove user
        await User.findOneAndRemove({_id: req.user.id});

        res.json({msg: 'User and Profile deleted'});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/profile/experience
// @desc    Add profile experience
// @access  Private
router.put('/experience', [auth, [
    body('title', 'Title is required').not().isEmpty(),
    body('company', 'Company is required').not().isEmpty(),
    body('from', 'Starting Date is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body;

    const newExp = {
        title: title,
        company: company,
        location: location,
        from: from,
        to: to,
        current: current,
        description: description
    }

    try {
        // Get the profile you want to update via the user id from the token
        const profile = await Profile.findOne({user: req.user.id});
        // Experience is an array and unshift adds the newExp object to the front of the array
        profile.experience.unshift(newExp);
        // Save it to MongoDB
        await profile.save();
        // Send the profile object with the updated experience information back to the front end via the response
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }

});

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete an experience from profile
// @access  Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id});

        // Get the remove index for the specific experience.  This goes through all of the experiences in the array and finds the one that matches the exp_id that was sent over through the request.
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

        // Splice is used to remove the removeIndex variable and only 1 of them
        profile.experience.splice(removeIndex, 1);
        
        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
})

module.exports = router;