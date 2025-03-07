
const cookieParser = require("cookie-parser");
class middlewareAuth  {
    async isAuthenticated(req, res, next) {
        try{
            const cookies = req.cookies
            if (!cookies.authToken) {
                return res.status(401).json({ message: 'Unauthorized. Please log in.' });  
            } else {
                console.log('User authenticated:', req.cookies.authToken);
                next(); 
            }
        }
        catch(error){
            console.log(error)
        }
    }

    async logSession (req, res, next) {
        console.log('Session Data:', req.session);
        next();
    }
};

module.exports = new middlewareAuth();

