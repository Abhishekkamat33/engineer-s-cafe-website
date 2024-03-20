const mongoose= require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017");
document.querySelector('.food-card').innerHTML="product";
// Fetch data from MongoDB
async function fetchData() {
  const database = client.db('myproject'); // Replace with your database name
  const collection = database.collection('product'); // Replace with your collection name

  // Perform your query here
  const cursor = collection.find();
console.log(cursor);
  // Iterate over the results
  await cursor.forEach((document) => {
    console.log(document);
    // Handle or process each document as needed
  });
}
fetchData();




