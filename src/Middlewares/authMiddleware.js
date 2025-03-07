
class authMiddleware  {
    async isAuthenticated(req, res, next) {
        if (req.session && req.session.userId) {
            next(); 
        } else {
            res.status(401).json({ message: 'Unauthorized. Please log in.' });
        }
    }

    async logSession (req, res, next) {
        // console.log('Session Data:', req.session);
        next();
    }
};

module.exports = new authMiddleware();

