const express = require('express');
const router = express.Router();
const {body, validationResult} = require('express-validator');

const auth = require('../../middleware/auth');

const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post('/', [auth, [
    body('text', 'Text is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    try {
        const user = await User.findById(req.user.id).select('-password');

        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });

        const post = await newPost.save();

        res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/posts
// @desc    Get all posts
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({date: -1});
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/posts/:id
// @desc    Get a post by the id
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if(!post) {
            return res.status(404).json({msg: 'Post not found'});
        }

        res.json(post);
    } catch (err) {
        console.error(err.message);
        // The below checks to make sure the user submits something in the form of an ObjectId
        if(err.kind === 'ObjectId') {
            return res.status(404).json({msg: 'Post not found'});
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // The below checks to make sure the user submits something in the form of an ObjectId
        if(!post) {
            return res.status(404).json({msg: 'Post not found'});
        }

        // Check to see if user can delete the post.  Add toString() method because the first is an object and the second is a string.  post.user is the owner of the post and req.user is the person logged in
        if(post.user.toString() !== req.user.id) {
            return res.status(401).json({msg: 'User not authorized to delete'})
        }

        await post.remove();

        res.json({msg: 'Post removed'});
    } catch (err) {
        console.error(err.message);
        // The below checks to make sure the user submits something in the form of an ObjectId
        if(err.kind === 'ObjectId') {
            return res.status(404).json({msg: 'Post not found'});
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/posts/like/:id
// @desc    Like a post
// @access  Private
router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // Check if the post has already been liked by logged in user.  Checking to see if the post.likes array has a value equal to the user.id of the logged in user.  If it does it'll return the user.id which has a length greater than zero, and this will be true.
        if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({msg: 'Post already liked'});
        }

        // If the logged in user hasn't already liked the post, add that user's id to the likes array tied to the post
        post.likes.unshift({user: req.user.id});

        // Save the post
        await post.save();

        // Send back the post with the array of likes
        res.json(post.likes);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
})

// @route   PUT api/posts/unlike/:id
// @desc    Unlike a post
// @access  Private
router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // Check if the post has already been liked by logged in user. Checking to see if the post.likes array has a value equal to the user.id of the logged in user.  If it doesn't it'll return zero, and this will be true.
        if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({msg: 'Post has not been liked'});
        }

        //  If the logged in user has already liked the post, remove that user's id from the likes array tied to the post. First, get the remove index. 
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

        post.likes.splice(removeIndex, 1);

        // Save the post
        await post.save();

        // Send back the post with the array of likes
        res.json(post.likes);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
})


module.exports = router;