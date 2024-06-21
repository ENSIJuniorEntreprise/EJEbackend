const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    photos: {
        type: [String],
        required: true
    },
    date: { 
        type: Date, 
        required: true 
    },
    subTitles: {
        type: [String],
        required: true
    },
    paragraphs: {
        type: [String],
        required: true
    },
    newest: {
        type: Boolean,
        required: true
    }
});

const Event = mongoose.model('Event', eventSchema)

module.exports = Event;