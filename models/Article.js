const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    photo: {
        type: String,
        required: true
    },
    submissionDate: { 
        type: Date, 
        required: true 
    },
    description: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    onFront: {
        type: Boolean,
        required: true
    }
});

const Article = mongoose.model('Article', articleSchema)

module.exports = Article;