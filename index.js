const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const port =process.env.PORT || 5000


const app = express()

const corsOption ={
    origin : ['http://localhost:5173'],
    credentials: true,
    optionSuccessStatus:200,
}

app.use(cors(corsOption))
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ahphq0t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  async function run() {
    try {
     const booksCollection = client.db('BookishHaven').collection('Books')
      
    //   Get All Data
    app.get('/books', async(req,res)=>{
     const result = await booksCollection.find().toArray()
     res.send(result)
    })


      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
      
    }
  }
  run().catch(console.dir);


app.get('/', (req,res)=>{
    res.send('Hello from Bookish Haven')
})

app.listen(port, ()=>console.log(`Server Running on Port ${port}`))