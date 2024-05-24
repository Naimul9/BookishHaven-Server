const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;

const app = express();

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:5173'],
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// MongoDB connection URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ahphq0t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with MongoClientOptions to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect to the MongoDB cluster
    await client.connect();

    const booksCollection = client.db('BookishHaven').collection('Books');

    // Get all books or books by category
    app.get('/books', async (req, res) => {
      try {
        const category = req.query.Category;
        const query = category ? { Category: category } : {};
        const result = await booksCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: 'Failed to fetch books', error });
      }
    });

    // add Books
    app.post('/addBook', async(req, res)=>{
        const info =req.body
        console.log(info)
        const result =await booksCollection.insertOne(info)
        res.send(result)
      })

    // Ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log('Pinged your deployment. You successfully connected to MongoDB!');
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
  }
}

run().catch(console.dir);

// Default route
app.get('/', (req, res) => {
  res.send('Hello from Bookish Haven');
});

// Start the server
app.listen(port, () => console.log(`Server running on port ${port}`));
