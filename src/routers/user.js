const express = require("express");
const User = require("../models/user.js");
const auth = require("../middleware/auth.js");
const verifySignUp = require("../middleware/verifySignUp.js")

const router = new express.Router();

//Creating a user
router.post("/user/create", verifySignUp, async (req, res) => {
    const user = new User(req.body);
    
    try{
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({user, token})
    }catch(error){
        res.status(400).send({error: error.message});
    }
})

//Log In User
router.post("/user/login", async (req, res) => {
    try{
        const user = await User.findByCredentials(req.body.username, req.body.password);
        const token = await user.generateAuthToken();
        
        res.send({user, token});
    }catch(error){
        res.status(400).send({error: error.message});
    }
})

//Log Out User
router.post("/user/logout", auth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        })

        await req.user.save();

        res.send("Logged out successfully");
    }catch(error){
        res.status(500).send({error: error.message});
    }
})

//Update a single user data by ID
router.patch("/user/update", auth, verifySignUp, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["username", "email", "password"];
    
    //Check if all the updates given are valid for the user
    const validUpdates = updates.every((update) => allowedUpdates.includes(update));

    if(!validUpdates){
        return res.status(400).send({error: "Invalid updates to this user"})
    }

    try{
        const user = await User.findById(req.user._id);
        updates.forEach((update) => user[update] = req.body[update])

        await user.save();
        res.send({updates: user, message: "Updates saved successfully"});

    }catch(error){
        res.status(400).send({error: error.message});
    }
})

//Add item to favourites movies array
router.patch("/user/update/add/:movieID", auth, async (req, res) => {
    try{
        const user = await User.findById(req.user._id);
        const movieToAdd = req.params.movieID;
        
        user.favourites.push(movieToAdd);

        await user.save();
        res.send({updated: user, message: "Movie saved to favourites successfully"});

    }catch(error){
        res.status(400).send({error: error.message});
    }
})

//Delete item from favourites movies array
router.patch("/user/update/remove/:movieID", auth, async (req, res) => {
    try{
        const user = await User.findById(req.user._id);
        const movieToRemove = req.params.movieID;

        user.favourites = user.favourites.filter((title) => {
            return title !== movieToRemove;
        })

        await user.save();
        res.send({updated: user, message: "Movie removed from favourites successfully"});

    }catch(error){
        res.status(400).send({error: error.message});
    }
})


//Delete a single user by ID
router.delete("/user/delete", auth, async (req, res) => {
    try{
        
        await req.user.remove()
        res.send(req.user)
        
    }catch(error){
        res.status(500).send({error: error.message});
    }
})

module.exports = router;
