/*jshint esversion: 8 */
const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const  cors = require('cors');
const app = express();
const port = 3030;

app.use(cors());
app.use(require('body-parser').urlencoded({ extended: false }));

const reviews_data = JSON.parse(fs.readFileSync("reviews.json", 'utf8'));
const dealerships_data = JSON.parse(fs.readFileSync("dealerships.json", 'utf8'));

mongoose.connect("mongodb://mongo_db:27017/",{'dbName':'dealershipsDB'});


const Reviews = require('./review');

const Dealerships = require('./dealership');

try {
  Reviews.deleteMany({}).then(()=>{
    Reviews.insertMany(reviews_data.reviews);
  });
  Dealerships.deleteMany({}).then(()=>{
    Dealerships.insertMany(dealerships_data.dealerships);
  });
  
} catch (error) {
  res.status(500).json({ error: 'Error fetching documents' });
}


// Express route to home
app.get('/', async (req, res) => {
    res.send("Welcome to the Mongoose API");
});

// Express route to fetch all reviews
app.get('/fetchReviews', async (req, res) => {
  try {
    const documents = await Reviews.find();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to fetch reviews by a particular dealer
app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    const documents = await Reviews.find({dealership: req.params.id});
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to fetch all dealerships
app.get('/fetchDealers', async (req, res) => {
    try {
        const dealers = await Dealerships.find(); // Fetch all dealers
        res.json(dealers);  // Send JSON response
      } catch (error) {
        console.error("Error fetching dealers:", error);
        res.status(500).json({ error: 'Error fetching dealers' });
      }
});

// Express route to fetch Dealers by a particular state
app.get('/fetchDealers/:state', async (req, res) => {
    try {
        const stateParam = req.params.state;
        console.log(`Fetching dealers for state: ${stateParam}`);

        // Fetch dealers where "state" matches the given state parameter
        const dealers = await Dealerships.find({ state: stateParam });

        // Check if dealers were found
        if (dealers.length === 0) {
            return res.status(404).json({ error: `No dealers found in state: ${stateParam}` });
        }

        res.json(dealers);  // Send back the list of dealerships
    } catch (error) {
        console.error("Error fetching dealers by state:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// Express route to fetch dealer by a particular ID
app.get('/fetchDealer/:id', async (req, res) => {
    try {
        const dealerId = parseInt(req.params.id); // Convert ID to integer
        console.log(`Fetching dealer with ID: ${dealerId}`);

        // Query MongoDB for a dealer with the given ID
        const dealer = await Dealerships.find({ id: dealerId });

        // Check if dealer was found
        if (!dealer) {
            return res.status(404).json({ error: `No dealer found with ID: ${dealerId}` });
        }

        res.json(dealer); // Send back the dealer details
    } catch (error) {
        console.error("Error fetching dealer by ID:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


//Express route to insert review
app.post('/insert_review', express.raw({ type: '*/*' }), async (req, res) => {
  data = JSON.parse(req.body);
  const documents = await Reviews.find().sort( { id: -1 } );
  let new_id = documents[0].id+1;

  const review = new Reviews({
		"id": new_id,
		"name": data.name,
		"dealership": data.dealership,
		"review": data.review,
		"purchase": data.purchase,
		"purchase_date": data.purchase_date,
		"car_make": data.car_make,
		"car_model": data.car_model,
		"car_year": data.car_year,
	});

  try {
    const savedReview = await review.save();
    res.json(savedReview);
  } catch (error) {
		console.log(error);
    res.status(500).json({ error: 'Error inserting review' });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
