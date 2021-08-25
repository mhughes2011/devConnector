const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if no token available
    if(!token) {
        return res.status(401).json({msg: 'No token, authorization denied'});
    }

    // Verify the token
    try{
        const decoded = jwt.verify(token, config.get('jwtSecret'));

        // This is setting the user as the decoded token that was received from the header. It's decoded.user because the token is on object with user in it
        req.user = decoded.user;
        next();
    } catch(err) {
        res.status(401).json({msg: 'Token is not valid'});
    }
}