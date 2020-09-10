const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },

    password: {
        type: String,
        trim: true,
        required: true,
        minlength: 7,
    },

    email:{
        type: String,
        lowercase: true,
        required: true,
        trim: true,

        //Validate email with validator module
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Email is invalid");
            }
        }
    },
    
    favourites: {
        type: Array, //Array of ID of favourite movies
    },

    tokens: [{
        token: {
            type: String,
            required: true,
        } 
     }],
})
//Find user by credentials, if exists and its correct log user
userSchema.statics.findByCredentials = async (username, password) => {
    const user = await User.findOne({username});
    
    if(!user){
        throw new Error("Unable to find user with this username");
    }

    //Check HASHED PW
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch);

    if(!isMatch){
       throw new Error("Unable to login, please check your password and username combination is correct");
    }

    return user;
}

//Hash password before saving it
userSchema.pre("save", async function(next){
    const user = this;

    if(user.isModified("password")){
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
})

userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    // delete userObject.password;
    // delete userObject.tokens;
    
    return userObject;
}

//Generate Authentication Token when logging in
userSchema.methods.generateAuthToken = async function (){
    const user = this;
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET);

    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
}

const User = new mongoose.model("User", userSchema);

module.exports = User;
