const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const LinkSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "users"
    },
    url: {
        type: String,
        required: true
    }
});

module.exports = Link = mongoose.model("links", LinkSchema);
