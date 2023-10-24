const express = require("express");
const router = express.Router();
const User = require("../models/User"); //? To target user schema 
const Event = require("../models/Event"); //? To target user schema 
const { body, validationResult } = require('express-validator'); //? to take valid input in name/email/password
const bcrypt = require('bcryptjs'); //? to encrypt the password
const jwt = require('jsonwebtoken'); //? for creating a token for each id
// require("dotenv").config();
// const JWD_SECRET = process.env.UserSecretKey;
const JWD_SECRET = "DevIsGoof";

var fetchUser = require("../middleware/fetchUser");

//* Route 1 : Create a user using POST "/api/auth/createuser". No login requires
router.post("/createuser", [
    body('name', 'Enter a valid Name!').isLength({ min: 3 }),
    body('email', 'Enter a valid Email!').isEmail(),
    body('password', 'Enter a valid Password!').isLength({ min: 5 }),
], async (req, res) => {
    // console.log(req.body);
    // If there are errors, return bad request and the error
    let success = false;
    const errors = validationResult(req); // errors will be a array
    if (!errors.isEmpty()) {
        return res.status(400).json({success, errors: errors.array() });
    }
    // Check whether the user with this email exists already.
    try {
        let user = await User.findOne({ email: req.body.email }); // js will wait for promise to return.
        if (user) {
            return res.status(400).json({success, error: "Sorry, user with this email is already registered." });
        }
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
            UCoins: 0,
            eventsID: [],
        });

        const data = {
            user:{
                id: user.id
            }
        }

        const authToken = jwt.sign(data, JWD_SECRET);
        success = true;
        res.json({success, authToken});
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error occured");
    }

});

//* Route 2 : Authenticate a user using POST "/api/auth/login". No login requires
router.post("/login", [
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'Password can not be blank').exists(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const {email, password} = req.body;
    try {
        // We will check either user email will be presented or not and if it is correct or not.
        let user = await User.findOne({email});
        let success = false;
        if(!user){
            return res.status(400).json({success, error: "Please try to login in with correct credencials."});
        }
        const comparepassword = await bcrypt.compare(password, user.password); // returns either true or false;
        if(!comparepassword){
            return res.status(400).json({success, error: "Please try to login with correct credencials."});
        }
        const data = {
            user:{
                id: user.id,
            }
        };
        const authToken = jwt.sign(data, JWD_SECRET);
        success = true;
        res.json({success, authToken});
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error occured");
    }
});

//* Route 3 : Get loggedIN user details using POST "/api/auth/getuser", Login Required

router.post("/getuser", fetchUser, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password"); // get everything from user.id except password.
        if(user){
            res.send(user);
        } else {
            res.status(404).send("User doesnot exist");
        }

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error occured");
    }
});

//* Route 4 : Update User details using PUT "/api/auth/updateuser", Login required
router.put("/updateuser/:id", fetchUser, async(req, res)=>{
    try{
        const {name, password} = req.body;
        // Create new note object
        const updateMe = {};
        if(name){updateMe.name = name};
        if(password){updateMe.password = password};
    
        // find note to be updated
        // here id params.id defines the header inputed id in '/updateNode/:id'
        let userdetail = await User.findById(req.params.id);
        // if someone else trying to fetch someone's data
        if(!userdetail){return res.status(404).send("Not Found")};
        // // if current user trying to fetch other user data
        // if(userdetail.toString() !== req.user.id){
        //     return res.status(401).send("Not Allowed");
        // }
    
        userdetail = await User.findByIdAndUpdate(req.params.id, {$set: updateMe}, {new:true});
        res.json({userdetail});
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error occured");
    }
})

//* Route 5 : Delete existing User using DELETE, Login Required
router.delete("/deleteuser/:id", fetchUser, async(req, res)=>{
    try{
        // here id params.id defines the header inputed id in '/deleteNote/:id'
        let userdetail = await User.findById(req.params.id);
        // if someone else trying to fetch someone's data
        if(!userdetail){return res.status(404).send("Not Found")};
        // // allow deletion only if user owns this note 
        // if(userdetail.toString() !== req.user.id){
        //     return res.status(401).send("Not Allowed");
        // }
    
        userdetail = await User.findByIdAndDelete(req.params.id);
        res.json({"Success":"User has been deleted", userdetail: userdetail});
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error occured");
    }
})

//* User submitting an event to admin
// here :id will be of event
router.put("/postEvent/:id", fetchUser, async(req, res)=>{

    const tempEventID = req.params.id;
    const updateMe = {};
    updateMe.tempEventID = tempEventID;
    let userdetail = await User.findByIdAndUpdate(req.user.id, {$set: updateMe}, {new:true});
    res.json({userdetail});
})

module.exports = router
