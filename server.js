const express = require('express')
const app = express()

// delete 
const Post = require('./models/post')

app.use(express.json())

const mongoose = require('mongoose');
require('dotenv').config()
const URL = process.env.mongoDBURL


mongoose.set('strictQuery', true);
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(URL);
}

app.get('/', (req, res) => {
  res.json('welcome')
})

app.get('/posts', async (req, res) => {
  try {
      const posts = await Post.find({ isPublished: true }).maxTimeMS(30000);
        res.json(posts)
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
})



// Add port in terminal with export PORT=port
const port = process.env.PORT || 5000; 
app.listen(port, () => console.log('server started'))