const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin"); //? To target admin schema 
const User = require("../models/User"); //? To target user schema 
const Event = require("../models/Event"); //? To target event schema 
const { body, validationResult } = require('express-validator'); //? to take valid input in name/email/password
const bcrypt = require('bcryptjs'); //? to encrypt the password
const jwt = require('jsonwebtoken'); //? for creating a token for each id

var fetchAdmin = require("../middleware/fetchAdmin");
// require("dotenv").config();
// const JWD_SECRET = process.env.AdminSecretKey;
const JWD_SECRET = "DevIsGoof";

//* Route 1 : Create a user using POST "/api/admin/createAdmin". No login requires
router.post("/createAdmin", [
    body('name', 'Enter a valid Name!').isLength({ min: 3 }),
    body('email', 'Enter a valid Email!').isEmail(),
    body('password', 'Enter a valid Password!').isLength({ min: 5 }),
    body('phone', 'Enter a valid Phone Number!').isLength({ min: 8 }),
], async (req, res) => {
    // If there are errors, return bad request and the error
    let success = false;
    const errors = validationResult(req); // errors will be a array
    if (!errors.isEmpty()) {
        return res.status(400).json({success, errors: errors.array() });
    }
    // Check whether the user with this email exists already.
    try {
        let admin = await Admin.findOne({ email: req.body.email }); // js will wait for promise to return.
        let phonevalidation = await Admin.findOne({phone: req.body.phone});
        if (admin || phonevalidation) {
            return res.status(400).json({success, error: "Sorry, user with this email or phone number is already registered." });
        }
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);
        admin = await Admin.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
            phone: req.body.phone,
        });

        const data = {
            admin:{
                id: admin.id
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

//* Route 2 : Authenticate a user using POST "/api/admin/login". No login requires
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
        let admin = await Admin.findOne({email});
        let success = false;
        if(!admin){
            return res.status(400).json({success, error: "Please try to login in with correct credencials."});
        }
        const comparepassword = await bcrypt.compare(password, admin.password); // returns either true or false;
        if(!comparepassword){
            return res.status(400).json({success, error: "Please try to login with correct credencials."});
        }
        const data = {
            admin:{
                id: admin.id,
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

//* Route 3 : Get loggedIN user details using POST "/api/admin/getuser", Admin Login Required

router.post("/getAdmin", fetchAdmin, async (req, res) => {
    console.log(req.admin.id);
    try {
        const admin = await Admin.findById(req.admin.id).select("-password"); // get everything from user.id except password.
        if(admin){
            res.send(admin);
        } else {
            res.status(404).send("Admin doesnot exist");
        }

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error occured");
    }
});

//* Route 4 : Update User details using PUT "/api/admin/updateAdmin", Admin Login required
router.put("/updateAdmin", fetchAdmin, async(req, res)=>{
    try{
        const {name, password, phone} = req.body;
        // Create new note object
        const updateMe = {};
        if(name){updateMe.name = name};
        if(password){updateMe.password = password};
        if(phone){updateMe.phone = phone};
        // // if current user trying to fetch other user data
        // if(userdetail.toString() !== req.user.id){
        //     return res.status(401).send("Not Allowed");
        // }
    
        admindetail = await Admin.findByIdAndUpdate(req.admin.id, {$set: updateMe}, {new:true});
        res.json({admindetail});
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error occured");
    }
})

//* Route 5 : Delete existing User using DELETE "/api/admin/deleteAdmin", Admin Login Required
router.delete("/deleteAdmin", fetchAdmin, async(req, res)=>{
    try{
        var userdetail = await Admin.findByIdAndDelete(req.admin.id);
        res.json({"Success":"Admin has been deleted", userdetail: userdetail});
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error occured");
    }
})


router.put("/updateUserCoinsAndEvents", fetchAdmin, async(req, res)=>{
    await User.find({tempEventID : {$not: {$regex: "unknown"}}}).then(docs => {
        docs.forEach(async(doc)=>{
            var eventid = doc.tempEventID;
            var userid = doc._id;
            var coinvalue = 0;
            // update coins and events
            await Event.findById(eventid).then(async e => {
                // console.log(e);
                coinvalue = e.ECoins;
            }) .catch(err => {
                console.error(err.message);
                res.status(404).send("Event ID is invalid");
            });
            await User.findById(userid).then(async e => {
                // console.log(e);
                var eventSet=new Set();
                e.eventsID.forEach(e=>{
                    eventSet.add(e);
                });
                var eventCount=eventSet.size;
                if(userid) {eventSet.add(eventid)};
                if(eventCount!=eventSet.size){
                    if(coinvalue){e.UCoins += coinvalue};
                }
                e.eventsID=Array.from(eventSet);
                // console.log(e);
                var wer = await User.findByIdAndUpdate(userid, {$set: e}, {new: true});
                res.json({wer});
            }) .catch(err => {
                console.error(err.message);
            });
        });
        res.json(docs);
    });
})


module.exports = router