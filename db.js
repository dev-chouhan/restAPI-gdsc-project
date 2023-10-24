const mongoose = require('mongoose');
const mongoURL = "mongodb://127.0.0.1:27017/EventsHere";

const connectToMongo = () => {
    mongoose.set("strictQuery", false);
    mongoose.connect(mongoURL).then((err)=>{
        console.log("Connected to mongo database Successfully.");
    });
}

module.exports = connectToMongo;