// Product.js
const mongoose = require("mongoose");

// Connect to MongoDB
try {
    mongoose.connect("mongodb://127.0.0.1:27017/myproject");
    console.log("Connected to MongoDB");
} catch (error) {
    console.error("Error connecting to MongoDB:", error);
}

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    image: {
        type: String, // Assuming you're storing the image file name
        required: true
    },
    image_url: {
        type: String // URL for the image
    }
});

module.exports= mongoose.model("products", productSchema);

