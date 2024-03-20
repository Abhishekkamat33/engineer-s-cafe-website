let count = 0;
let value = document.querySelector("#value"); 
const orderBook = document.querySelector('.order');

function decodeHtml(html) {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

// Decode HTML entities in the productJson
var decodedProductJson = decodeHtml(`<%= productJson %>`);
var decodedPopularJson = decodeHtml(`<%= popularJson %>`)
// Parse the decoded JSON string
var products = JSON.parse(decodedProductJson);
var popular = JSON.parse(decodedPopularJson);
// Reset count to 0 when the page loads
window.onload = function() {
    count = 0;
};

// Event delegation to handle button clicks
document.addEventListener('click', function(event,index) {
  if (event.target && event.target.classList.contains('buy')) {
    if (event.target && event.target.id === 'popularproduct') {
      var populars = popular[event.target.dataset.index];
      console.log(populars)
      const foodItem = document.createElement('div');
foodItem.classList.add('food-item');
foodItem.innerHTML = `
  <img class="food-image" src="${populars.image_url}" alt="${populars.name}">
  <div class="food-name">${populars.name}</div>
  <div class="food-category">${populars.category}</div>
  <div class="sign"><div class="decrease">-</div><span class="quantity">0</span><div class="increase">+</div></div>
  <div class="food-price">${populars.price}</div>.
`;

orderBook.appendChild(foodItem);
      }

        if (event.target && event.target.id === 'product') {
          var product = products[event.target.dataset.index];
console.log(product);

// Assuming there's only one product, no need for forEach loop
const foodItem = document.createElement('div');
foodItem.classList.add('food-item');
foodItem.innerHTML = `
  <img class="food-image" src="${product.image_url}" alt="${product.name}">
  <div class="food-name">${product.name}</div>
  <div class="food-category">${product.category}</div>
  <div class="decrease">-</div><span class="quantity">0</span><div class="increase">+</div>
  <div class="food-price">${product.price}</div>
`;
orderBook.appendChild(foodItem);
}
  count++;
   // Increment the count
   value.style.display = "block";
        value.innerHTML = count;
  }
});
document.addEventListener('click', function(e,index) {
  if (event.target && event.target.classList.contains('cart')) {
     document.querySelector(".cartinfo").style.display="block"
  }});
  