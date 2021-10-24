const jwt  = require("jsonwebtoken");
const User =  require("../models/userSchema")
const Autheticate = async (req,res,next) => {

    try {

        const token =  req.cookies.jwtoken
        const verifyToken =  jwt.verify(token , process.env.SECRET_KEY);

        const rootUser = await User.findOne({ _id: verifyToken._id, "tokens.token": token});
        // res.send(verifyToken)

        if ( !rootUser) { throw new Error('User not Found')}

        req.token = token;
        req.rootUser = rootUser;
        req.userID =  rootUser._id;
        next();
        
    } catch (error) {
        res.status(401).send("Unuthorized:No token provided")
        console.log(error)
    }
}

module.exports = Autheticate;
