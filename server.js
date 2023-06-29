const express = require('express')
const app = express()
const cors = require('cors')
const session = require('express-session');
require('dotenv').config();


// const Post = require('./models/post')
app.use(express.json())

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || 'https://3000-emanuelgusta-littleblog-2kwlwg7dg0q.ws-eu101.gitpod.io/',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.sessionsKey,
    resave: false,
    saveUninitialized: true,
  })
);


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

// app.get('/posts', async (req, res) => {
//   try {
//       const posts = await Post.find({ isPublished: true }).maxTimeMS(30000);
//         res.json(posts)
//     } catch (err) {
//       res.status(500).json({ message: err.message })
//     }
// })

const PostRouter = require('./routes/posts')
app.use('/posts', PostRouter)

const AccountsRouter = require('./routes/accounts')
app.use('/accounts', AccountsRouter)

// Add port in terminal with export PORT=port
const port = process.env.PORT || 5000; 
app.listen(port, () => console.log('server started'))