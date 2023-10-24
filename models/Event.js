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
    dateCreated:{
        type: Date,
        default: Date.now,
    },
    endDate: {
        type: Date,
        requires: true,
    },
    ECoins:{
        type: Number,
        default: 0,
        // If we already defined default for an entity, it means if we don't provide any value then, defalut value will be added.
        // requires: true,
    },
    active:{
        type: Boolean,
        default: true,
        // requires: true,
    }
});

module.exports = mongoose.model('event', NotesSchema);