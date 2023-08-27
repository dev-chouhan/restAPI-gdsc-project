const mongoose = require("mongoose");
const {Schema} = mongoose;

const adminSchema = new Schema({
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
    phone: {
        type: Number,
        // minlength: 6,
        // maxlength: 12,
        requires: true,
        unique: true,
    }
});

const Admin = mongoose.model('admin', adminSchema);
module.exports = Admin;