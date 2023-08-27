const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const { body, validationResult } = require("express-validator"); //? to take valid input in name/email/password
var fetchAdmin = require("../middleware/fetchAdmin");

//* Route 1: get all the notes using: PUT "/api/notes/fetchallevents". Login not required
// (Check for active element in event schema, if it's false then event expires, else display event to all users.)
// Read Events for all users
router.put("/fetchallevents", async (req, res) => {
    await Event.find({}).then(docs => {
        docs.forEach(function(doc){
            // updated event expiry time using active element in schema.
            var expireTime = (new Date(doc.endDate).getTime()/1000) - (new Date().getTime()/1000);
            if(expireTime <= 0){
                doc.active = false;
            } else {
                doc.active = true;
            }
        })
        res.json(docs);
    }).catch(error => {
        console.error(error.message);
        res.status(500).send("Internal server error occured");
    })
});

//* Route 2: add a new notes using: POST "/api/notes/postEventToAll". Admin Login required (from admin to all users)
// Create Event for all users.
router.post(
    "/postEventToAll",
    fetchAdmin,
    [
        body("title", "Title must be atleast 3 character").isLength({ min: 3 }),
        body("description", "description must be atleast 5 character").isLength({min: 5}),
        body("endDate", "Event ending date must exist").exists(),
        body("ECoins", "If none coins are added, then default coins will be 0").exists(),
    ],
    async (req, res) => {
        const { title, description, tag , endDate, ECoins} = req.body;
        // If there are errors, return bad request and the error. Here errors will be for title and description validation only.
        const errors = validationResult(req); // errors will be a array
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const event = new Event({
                title,
                description,
                tag,
                endDate,
                ECoins,
            });
            const savedEvent = await event.save();
            res.json(savedEvent);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error occured");
        }
    }
);

//* Route 3: update an existing event using PUT. Admin Login required 
// Update can only be on timer, ECoins. Here :id will be of admin.
router.put(
    "/updateEvent/:id",
    fetchAdmin,
    async(req, res)=>{
    try{
        const {title, description, tag, endDate, ECoins} = req.body;
        // Create new note object
        const newEvent = {};
        if(title){newEvent.title = title};
        if(description){newEvent.description = description};
        if(tag){newEvent.tag = tag};
        if(endDate){newEvent.endDate = endDate};
        if(ECoins){newEvent.ECoins = ECoins};

        // find note to be updated
        // here id params.id defines the header inputed id in '/updateEvent/:id'
        let event = await Event.findById(req.params.id);
        // if someone else trying to fetch someone's data
        if(!event){return res.status(404).send("Not Found")};
        // // if current user trying to fetch other user data
        // if(event.user.toString() !== req.user.id){
        //     return res.status(401).send("Not Allowed");
        // }
        console.log(event);
        
        event = await Event.findByIdAndUpdate(req.params.id, {$set: newEvent}, {new:true});
        res.json({event});
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error occured");
    }
})

//* Route 4: Delete an existing event using DELETE. Admin Login required
router.delete(
    "/deleteEvent/:id", 
    fetchAdmin, 
    async(req, res)=>{
    try{
        // here id params.id defines the header inputed id in '/deleteEvent/:id'
        let event = await Event.findById(req.params.id);
        // if someone else trying to fetch someone's data
        if(!event){return res.status(404).send("Not Found")};
        // // if current user trying to fetch other user data
        // if(event.user.toString() !== req.user.id){
        //     return res.status(401).send("Not Allowed");
        // }
    
        event = await Event.findByIdAndDelete(req.params.id);
        res.json({"Success":"Event has been deleted", event: event});
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error occured");
    }
})

module.exports = router;
