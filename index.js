const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

const app = express();

const corsOptions = {
  origin: ['http://localhost:5173'],
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ahphq0t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {

    const booksCollection = client.db('BookishHaven').collection('Books');
    const borrowsCollection = client.db('BookishHaven').collection('Borrows');


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

    // add book
    app.post('/addBook', async (req, res) => {
      const info = req.body;
      console.log(info);
      const result = await booksCollection.insertOne(info);
      res.send(result);
    });

    // get book by id
    app.get('/books/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await booksCollection.findOne(query);
      res.send(result);
    });

// update book
app.put('/books/:id', async(req,res)=>{
    const id = req.params.id
    const filter ={_id: new ObjectId(id)}
    const options ={upsert:true}
    const updatedBook = req.body
    const book = {
      $set:{
        image:updatedBook.image, 
      name:updatedBook.name, 
      Category: updatedBook.Category,
      rating: updatedBook.rating, 
      authorName: updatedBook.authorName, 
      }
    }
    const result =await booksCollection.updateOne(filter, book, options )
    res.send(result)
  })


   

    await client.db('admin').command({ ping: 1 });
    console.log('Pinged your deployment. You successfully connected to MongoDB!');
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello from Bookish Haven');
});

app.listen(port, () => console.log(`Server running on port ${port}`));
