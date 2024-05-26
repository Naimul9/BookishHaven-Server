const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

const app = express();

const corsOptions = {
  origin: ['http://localhost:5173','http://localhost:5174',
    'https://assignment-11-def60.web.app'
  ],
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser())

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

// jwt generate
app.post('/jwt', async(req,res)=>{
const user = req.body
const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{expiresIn:'365d'})
res.cookie('token', token,{
    httpOnly: true,
    secure: true,
    secure: process.env.NODE_ENV ==='production',
    sameSite: process.env.NODE_ENV==='production'? 'none' : 'strict',
}).send({success: true})
})

// clear token
app.get('/logout', (req,res)=>{
    res.clearCookie('token',{
        httpOnly:true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', maxAge:0
    })
    .send({success: true})
})


 // Middleware function to verify JWT token
 const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    console.log(token);
    if (!token) return res.status(401).send({ message: 'Unauthorized' });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.status(403).send({ message: 'Forbidden' });
      req.user = decoded;
      next();
    });
  };


// Return a borrowed book
app.post('/return-book/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Find the borrowed book by ID
        const borrowedBook = await borrowsCollection.findOne({ _id: new ObjectId(id) });
        if (!borrowedBook) {
            return res.status(404).send({ message: 'Borrowed book not found' });
        }

        // Find the book by ID to update its quantity
        const book = await booksCollection.findOne({ _id: new ObjectId(borrowedBook.bookId) });
        if (!book) {
            return res.status(404).send({ message: 'Book not found' });
        }

        // Update the quantity of the book
        const updatedQuantity = book.quantity + 1;
        await booksCollection.updateOne(
            { _id: new ObjectId(borrowedBook.bookId) },
            { $set: { quantity: updatedQuantity } }
        );

        // Remove the borrowed book from the borrowsCollection
        await borrowsCollection.deleteOne({ _id: new ObjectId(id) });

        res.send({ message: 'Book returned successfully' });
    } catch (error) {
        console.error('Error returning book:', error);
        res.status(500).send({ message: 'Failed to return the book', error });
    }
});




  // Get borrowed books by user's email
app.get('/borrowed-books/:email', async (req, res) => {
    const email = req.params.email
    const query = {userEmail : email }
    const result = await borrowsCollection.find(query).toArray()
    res.send(result)
});




   // Borrow a book
   app.post('/borrow', async (req, res) => {
    try {
      const { bookId, returnDate, userName, userEmail,   image, 
        name, authorName,rating, Category } = req.body;


  // Check if the user has already borrowed the book
  const alreadyBorrowed = await borrowsCollection.findOne({ bookId: new ObjectId(bookId), userEmail });
  if (alreadyBorrowed) {
      return res.status(400).send({ message: 'You have already borrowed this book' });
  }



      // Find the book by ID
      const book = await booksCollection.findOne({ _id: new ObjectId(bookId) });

      if (!book) {
        return res.status(404).send({ message: 'Book not found' });
      }

      if (book.quantity === 0) {
        return res.status(400).send({ message: 'Book out of stock' });
      }

      // Update the quantity of the book
      const updatedQuantity = book.quantity - 1;
      await booksCollection.updateOne(
        { _id: new ObjectId(bookId) },
        { $set: { quantity: updatedQuantity } }
      );

      // Add the borrow record to borrowsCollection
      const borrowRecord = {
        image, 
        name,
         authorName,
        rating,
        Category,
        userName,
        userEmail,
        bookId,
        returnDate,
        borrowedDate: new Date(),
      };
      const result = await borrowsCollection.insertOne(borrowRecord);

      res.send(result);
    } catch (error) {
      res.status(500).send({ message: 'Failed to borrow the book', error });
    }
  });

  // Get all books with token verification
  app.get('/books', verifyToken, async (req, res) => {
    try {
      const result = await booksCollection.find({}).toArray();
      res.send(result);
    } catch (error) {
      res.status(500).send({ message: 'Failed to fetch books', error });
    }
  });



// Get books by category
app.get('/books/category', async (req, res) => {
    try {
        const category = req.query.Category;
        const query = category ? { Category: category } : {};
        const result = await booksCollection.find(query).toArray();
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: 'Failed to fetch books by category', error });
    }
});

    // add book
    app.post('/addBook',  async (req, res) => {
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
