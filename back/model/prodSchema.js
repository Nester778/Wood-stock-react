const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
    Name: String,
    Price: Number,
    Description: String,
    Material: String,
    Coating: String,
    data: [Buffer],
});

const Image = mongoose.model("Image", imageSchema);

module.exports = Image;