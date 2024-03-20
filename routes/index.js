const express = require('express');
const app = express();
const router = express.Router();
const usermodel = require("./users");
const productmodel = require("./products");
const popularmodel = require("./popular");
const ordermodel = require("./order");
const bcrypt = require("bcrypt");
const passport = require("passport");
const localStrategy = require("passport-local");
const multer = require("./multer")
const session = require('express-session');
const bodyParser = require('body-parser');



const upload = require('./multer');

passport.use(new localStrategy(usermodel.authenticate()));
app.use(bodyParser.json());
// Mounting error handling middleware
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
app.use(isadmin);
// Initialize session middleware
app.use(session({
    secret: 'your_secret_key', // Change this to a secure key
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true }
}));

// Middleware to parse JSON bodies
app.use(express.json());



router.get('/', function (req, res) {
    res.render("index")
})
router.get('/register', function (req, res) {
    res.render("register")
})
router.get('/login', function (req, res) {
    // Check if there's an error query parameter
    const error = req.query.error;
    res.render('login', { error });
});

router.post('/register', async function (req, res) {
    const { username, email, password, dob, gender } = req.body;

    try {
        // Check if the email is already registered
        const existingUser = await usermodel.findOne({ email: email });

        if (existingUser) {
            return res.status(400).send("Email already registered");
        }
        if (typeof username !== 'string' || username.trim() === '' || /\d/.test(username)) {
            res.status(500).send("Username must be a non-empty string without numbers");
        }
        // Check if all required fields are provided
        if (!password || !email || !dob || !gender) {
            return res.status(400).send("Missing fields");
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user object
        const newUser = new usermodel({
            username: username,
            password: hashedPassword,
            email: email,
            dob: dob,
            gender: gender,
            admin: ""
        });

        // Save the new user to the database
        await newUser.save();

        // Redirect the user to the login page after successful registration
        res.redirect('/profile');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error registering user");
    }
});


router.post('/login', async function (req, res) {
    const { email, password } = req.body;

    try {
        const user = await usermodel.findOne({ email: email });
        if (!user) {
            res.redirect('/login?error=userNotFound'); // User not found
        } else {
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                res.redirect('/login?error=incorrectPassword or username'); // Incorrect password
            } else {
                res.render('profile'); // Successful login
            }
        }


    } catch (error) {
        console.error(error);
        res.status(500).send("Error during login");
    }
});

router.get('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.render('index');
    });
});




router.get('/profile', async function (req, res) {
    try {
        const product = await productmodel.find({}).exec();
        const popular = await popularmodel.find({}).exec();
        res.render('profile', { product, popular });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
})



router.get('/product', async function (req, res) {
    try {
        const product = await productmodel.find({}).exec();
        const popular = await popularmodel.find({}).exec();
        res.render('product', { product, popular });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});
router.get('/payment', async function (req, res) {
    try {
        const product = await productmodel.find({}).exec();
        const popular = await popularmodel.find({}).exec();
        res.render('payment', { product, popular });
    } catch (error) {
        console.error(error);
        res.staus(500).send('Internal Server Error');
    }
})
function isLoggedIn(req, res, next) {
    console.log(req.isAuthenticated())
    // Check if user is authenticated (assuming you're using Passport.js for authentication)
    if (req.isAuthenticated()) {
        // If user is authenticated, proceed to the next middleware or route handler
        return next();
    } else {
        res.redirect('/login');
    }
}
// Define the isadmin middleware

async function isadmin(req, res, next) {
    try {
        const adminUsername = req.params.username; // Assuming username is passed in the URL
        const adminUser = await usermodel.findOne({ username: adminUsername });
        // Assuming req.user contains the user information
        if (adminUser.admin === "admin") {
            // If the user is an admin, proceed to the next middleware
            next();
        } else {
            // If the user is not an admin, send a 403 Forbidden response
            res.status(403).send('You are not authorized to access this resource.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

// Route to render the admin panel (protected by isadmin middleware)
router.get('/admin/:username', isadmin, async function (req, res) {
    try {
        // Fetch user data from the database
        const users = await usermodel.find({});
        const orders = await ordermodel.find({});
        const products = await productmodel.find({}).exec();
        const populars = await popularmodel.find({}).exec();

        // Render the admin panel view and pass the user data to it
        res.render('admin', { users, products, populars, orders });
    } catch (error) {
        // Handle any errors that occur during route execution
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Assuming you have necessary imports and middleware set up
router.post('/admin/product', upload.single('image'), async (req, res) => {
    try {
        const { name, description, price, category } = req.body;

        console.log("Request body:", req.body);
        console.log("Request file:", req.file);

        // Check if a file was uploaded
        if (!req.file) {
            console.log("No image uploaded");
            return res.status(400).send('No image uploaded');
        }

        // Check if all required fields are provided
        if (!name || !description || !price || !category) {
            console.log("Missing fields");
            return res.status(400).send('Missing fields');
        }

        // Check if price is a valid number
        if (isNaN(parseFloat(price)) || !isFinite(price)) {
            console.log("Invalid price");
            return res.status(400).send('Invalid price');
        }

        // Check if a food item with the provided name already exists
        const existingFood = await productmodel.findOne({ name: name });
        if (existingFood) {
            console.log("Food item with this name already exists");
            return res.status(400).send('Food item with this name already exists');
        }

        console.log("Creating new food item instance");

        // Create a new food item instance and save it
        const newFoodItem = await productmodel.create({
            name: name,
            description: description,
            price: price,
            category: category,
            image: req.file.filename
        });
        const users = await usermodel.find({});
        const orders = await ordermodel.find({});
        const products = await productmodel.find({}).exec();
        const populars = await popularmodel.find({}).exec();
        res.render('admin', { users, products, populars, orders });

        console.log("Food item saved successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send(`Internal Server Error: ${error.message}`);
    }
});

// Route handler for adding other products
router.post('/admin/popular', upload.single('image'), async (req, res) => {
    try {
        const { name, description, price, category } = req.body;

        console.log("Request body:", req.body);
        console.log("Request file:", req.file);

        // Check if a file was uploaded
        if (!req.file) {
            console.log("No image uploaded");
            return res.status(400).send('No image uploaded');
        }

        // Check if all required fields are provided
        if (!name || !description || !price || !category) {
            console.log("Missing fields");
            return res.status(400).send('Missing fields');
        }

        // Check if price is a valid number
        if (isNaN(parseFloat(price)) || !isFinite(price)) {
            console.log("Invalid price");
            return res.status(400).send('Invalid price');
        }

        // Check if a popular item with the provided name already exists
        const existingPopularItem = await popularmodel.findOne({ name: name });
        if (existingPopularItem) {
            console.log("Popular item with this name already exists");
            return res.status(400).send('Popular item with this name already exists');
        }

        console.log("Creating new popular item instance");

        // Create a new popular item instance and save it
        const newPopularItem = await popularmodel.create({
            name: name,
            description: description,
            price: price,
            category: category,
            image: req.file.filename
        });
        const users = await usermodel.find({});
        const products = await productmodel.find({}).exec();
        const populars = await popularmodel.find({}).exec();
        res.render('admin', { users, products, populars });

    } catch (error) {
        console.error(error);
        res.status(500).send(`Internal Server Error: ${error.message}`);
    }
});
router.delete('/admin/:_id', async (req, res) => {
    try {
        const productId = req.params._id; // Corrected parameter name to match route definition
        const result = await productmodel.findByIdAndDelete(productId);
        const popularresult = await popularmodel.findByIdAndDelete(productId);
        if (!result || !popularresult) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route for editing a product
// Route for updating regular products
router.put('/admin/:_id', upload.single('image'), async (req, res) => {
    try {
        const productId = req.params._id;
        const { name, description, price, category } = req.body;

        // Check if the request contains a file (image)
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        // Check if all required fields are provided
        if (!name || !description || !price || !category) {
            return res.status(400).json({ error: 'Missing fields' });
        }

        // Check if price is a valid number
        if (isNaN(parseFloat(price)) || !isFinite(price)) {
            return res.status(400).json({ error: 'Invalid price' });
        }

        // Update product in the database
        const updatedProduct = {
            name: name,
            description: description,
            price: price,
            category: category,
            image: req.file.filename // Assuming the image file is uploaded
        };

        const result = await productmodel.findByIdAndUpdate(productId, updatedProduct, { new: true });

        if (!result) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const users = await usermodel.find({});
        const products = await productmodel.find({}).exec();
        const populars = await popularmodel.find({}).exec();

        // Render the admin panel view and pass the user data to it
        res.render('admin', { users, products, populars });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route for updating popular products
router.put('/admin/popular/:_id', upload.single('image'), async (req, res) => {
    try {
        const popularId = req.params._id;
        const { name, description, price, category } = req.body;

        // Check if the request contains a file (image)
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        // Check if all required fields are provided
        if (!name || !description || !price || !category) {
            return res.status(400).json({ error: 'Missing fields' });
        }

        // Check if price is a valid number
        if (isNaN(parseFloat(price)) || !isFinite(price)) {
            return res.status(400).json({ error: 'Invalid price' });
        }

        // Update popular product in the database
        const updatedPopular = {
            name: name,
            description: description,
            price: price,
            category: category,
            image: req.file.filename // Assuming the image file is uploaded
        };

        const popularResult = await popularmodel.findByIdAndUpdate(popularId, updatedPopular, { new: true });

        if (!popularResult) {
            return res.status(404).json({ error: 'Popular product not found' });
        }

        const users = await usermodel.find({});
        const products = await productmodel.find({}).exec();
        const populars = await popularmodel.find({}).exec();

        // Render the admin panel view and pass the user data to it
        res.render('admin', { users, products, populars });
    } catch (error) {
        console.error('Error updating popular product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});




router.get("/order", async function (req, res) {
    try {
        // Fetch user data from the database
        const users = await usermodel.find({});

        // Retrieve the productArray from the query parameters
        const productArray = req.query.productArray ? JSON.parse(req.query.productArray) : [];

        // Find popular products and regular products based on productArray
        const orderpopular = await popularmodel.find({ _id: { $in: productArray } });
        const orderproduct = await productmodel.find({ _id: { $in: productArray } });

        // Render the order view and pass the user data, products, and populars
        res.render('order', {
            users,
            orderpopular,
            orderproduct // Pass the productArray retrieved from the query parameters
        });
    } catch (error) {
        // Handle any errors that occur during route execution
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
});
let orders = [];

// Route to handle cancel request
router.post('/cancel-order', (req, res) => {
    const productId = req.body.productId;

    // Find and remove the product from the orders array
    orders = orders.filter(item => item._id !== productId);

    res.status(200).json({ message: 'Product canceled successfully.' });
});

router.post('/add-to-session', (req, res) => {
    // Retrieve the product ID from the request body
    const productId = req.body.productId;

    // Check if the session exists
    if (req.session) {
        // Initialize an empty array for product IDs if it doesn't exist
        req.session.productArray = req.session.productArray || [];
        // Add the product ID to the session
        req.session.productArray.push(productId);
        console.log('Product added to session:', productId, 'Session:', req.session.productArray);

        // Send a success response
        res.status(200).json({ message: 'Product added to session successfully' });
    } else {
        // Send an error response if the session doesn't exist
        res.status(500).json({ message: 'Failed to add product to session' });
    }
});

router.post('/checkout', async (req, res) => {
    try {
        // Retrieve products with quantities and total price from the request body
        const { productsWithQuantities, totalPrice, customerName, customerEmail, customerAddress } = req.body;
        console.log('Request Body:', req.body);

        // Extract product IDs and quantities from productsWithQuantities array
        const productsData = productsWithQuantities.map(item => ({
            product: item.productId,
            quantity: item.quantity
        }));

        // Array to store products from both models
        const allProducts = [];

        // Fetch products from productmodel
        const productsFromProductModel = await Promise.all(productsData.map(async item => {
            try {
                const product = await productmodel.findById(item.product);
                if (!product) {
                    console.error(`Product with ID ${item.product} not found in productmodel.`);
                    return null;
                }
                return {
                    ...product.toObject(),
                    quantity: item.quantity
                };
            } catch (error) {
                console.error(`Error fetching product with ID ${item.product} from productmodel:`, error);
                return null;
            }
        }));

        // Fetch products from popularmodel
        const productsFromPopularModel = await Promise.all(productsData.map(async item => {
            try {
                const product = await popularmodel.findById(item.product);
                if (!product) {
                    console.error(`Product with ID ${item.product} not found in popularmodel.`);
                    return null;
                }
                return {
                    ...product.toObject(),
                    quantity: item.quantity
                };
            } catch (error) {
                console.error(`Error fetching product with ID ${item.product} from popularmodel:`, error);
                return null;
            }
        }));

        // Combine products from both models
        allProducts.push(...productsFromProductModel.filter(product => product !== null));
        allProducts.push(...productsFromPopularModel.filter(product => product !== null));

        // Create a new order document
        const newOrder = new ordermodel({
            products: allProducts,
            totalPrice: totalPrice,
            customerName: customerName,
            customerEmail: customerEmail,
            customerAddress: customerAddress
        });

        // Save the order to the database
        await newOrder.save();

        // Send a response indicating successful order creation
        res.status(201).json({ message: 'Order placed successfully', orderId: newOrder._id });
    } catch (error) {
        // If an error occurs, send an error response
        console.error('Error placing order:', error);
        res.status(500).json({ error: 'Failed to place order' });
    }
});


router.get('/checkout', (req, res) => {
    // Retrieve the productArray from the query parameters
    const productArray = req.query.productArray ? JSON.parse(req.query.productArray) : [];
    console.log('Product array:', productArray);

    // Render the checkout page or perform any necessary logic
    res.render("payment")
});



module.exports = router;