const mongoose = require("mongoose");
const {Schema} = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        requires: true,
    },
    email: {
        type: String,
        requires: true,
        unique: true,
    },
    password: {
        type: String,
        requires: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    eventsID: [{
        type: String,
        default: [],
    }],
    UCoins: {
        type: Number,
        default: 0,
    },
    tempEventID: {
        type: String,
        default: "unknown",
    }
});

const User = mongoose.model('user', userSchema);
module.exports = User;