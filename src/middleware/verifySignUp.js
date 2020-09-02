const User = require("../models/user.js");

const verifySignUp = async (req, res, next) => {
    const duplicateUsername = await User.findOne({username: req.body.username});
    const duplicateEmail = await User.findOne({email: req.body.email});

    if(duplicateUsername){
        return res.status(409).send({error: "Username already exists. Please try with a different one."})
    }else if(duplicateEmail){
        return res.status(409).send({error: "User already exists with this email. Please try with a different one."})
    }

    next();
}

module.exports = verifySignUp;