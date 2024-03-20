const mongoose = require('mongoose');

const popularSchema = new mongoose.Schema({
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

const popular = mongoose.model('popular', popularSchema);

module.exports = popular;
