const mongoose = require('mongoose');

// Define the schema for the order
const orderSchema = new mongoose.Schema({
    products: [
        {
            name: String,
            price: Number,
            category: String,
            quantity: Number,
            description: String,
            image_url: String
            // Add other fields as needed
        }
    ],
    totalPrice: {
        type: Number,
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    customerEmail: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create a model from the schema
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

