const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    desc: {
        type: String,
    }, 
    authorId: {
        type: String
      },
    contributors: {
        type: Array
    },
    isPublished: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

module.exports = mongoose.model('Post', PostSchema)