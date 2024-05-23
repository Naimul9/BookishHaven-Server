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

const uri = "mongodb+srv://naimulakib100:uBOcOty0njNskorh@cluster0.ahphq0t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


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
      // Connect the client to the server	(optional starting in v4.7)
      
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