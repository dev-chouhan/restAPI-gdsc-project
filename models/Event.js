const mongoose = require("mongoose");
const {Schema} = mongoose;

const NotesSchema = new Schema({
    title: {
        type: String,
        requires: true,
    },
    description: {
        type: String,
        requires: true,
    },
    tag: {
        type: String,
        default: 'General',
    },
    endDate: {
        type: Date,
        default: Date.now,
        requires: true,
    },
    ECoins:{
        type: Number,
        default: 0,
        requires: true,
    },
    active:{
        type: Boolean,
        default: true,
        requires: true,
    }
});

module.exports = mongoose.model('event', NotesSchema);