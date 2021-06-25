const express = require('express')
const bodyParser = require("body-parser")
const fileUplode = require("express-fileupload")
const fs = require('fs-extra')
const cors = require("cors")
require('dotenv').config()
const MongoClient = require('mongodb').MongoClient;
const { ObjectId, ObjectID } = require('mongodb')

const app = express()
const port = process.env.PORT || 5000;


app.use(bodyParser.json());
app.use(cors())
app.use(fileUplode())

app.get('/', (req, res) => {
  res.send('Hello World!')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nvcgk.mongodb.net/blogSite?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const allBlogs = client.db("blogSite").collection("allBlogs");
  const admins = client.db("blogSite").collection("admins");

  app.post('/addBlogs', (req, res) => {
    const blogsInfo = req.body;
    const blogFile = req.files.file;
    const title = blogsInfo.title;
    const content = blogsInfo.content;

    console.log(blogFile)
    console.log(title)
    console.log(content)
    const newFile = blogFile.data;
    const enImg = newFile.toString("base64");

    var image = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      img: Buffer.from(enImg, "base64")
    }

    console.log(image)
    allBlogs.insertOne({ title, content, image })
      .then(result => {
        res.send(result.insertOne > 0)
      })


  })

  app.post("/addAdmin", (req, res) => {
    const email = req.body;
    const password = req.body;
    console.log(email, password)
    admins.insertOne({ email, password })
      .then(result => {
        console.log(result)
        res.send(result > 0)
      })
  })

  app.get("/blogs", (req, res) => {
    allBlogs.find({})
      .toArray((err, document) => {
        res.send(document)
      }
      )

  })

  app.get('/singleManPd/:id',(req,res)=>{
    allBlogs.find({_id:ObjectID(req.params.id)})
    .toArray((err,document)=>{
        res.send(document)
    })
  })

  app.delete('/delete/:id',(req,res)=>{
    console.log(req.params.id)
    allBlogs.deleteOne({_id:ObjectId(req.params.id)})
    .then((result)=>{
        console.log(result)
    })
})

  

  app.get("/admins", (req, res) => {
    admins.find({})
      .toArray((err, document) => {
        res.send(document)
      }
      )

  })


});






// "devDependencies": {
//   "nodemon": "^2.0.7"
// }

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})