const express = require('express')
const app = express()
const cors = require('cors')
const session = require('express-session');
require('dotenv').config();
const MongoDBStore = require('connect-mongo');



// const Post = require('./models/post')
app.use(express.json())

app.use(
  cors({
    // origin: process.env.ALLOWED_ORIGIN || 'https://3000-emanuelgusta-littleblog-2kwlwg7dg0q.ws-eu101.gitpod.io',
    orgin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
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

app.use(
  session({
    secret: process.env.sessionsKey,
    resave: false,
    saveUninitialized: true,
    store: new MongoDBStore({ mongoUrl: URL }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

const PostRouter = require('./routes/posts')
app.use('/posts', PostRouter)

const AccountsRouter = require('./routes/accounts')
app.use('/accounts', AccountsRouter)

// Add port in terminal with export PORT=port
const port = process.env.PORT || 5000; 
app.listen(port, () => console.log('server started'))