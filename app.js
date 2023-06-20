const express = require('express')
const app = express()
// require('dotenv').config();

app.use(express.json())

// // import mongoose and get key from dotenv
// const mongoose = require('mongoose');
// require('dotenv').config()
// const URL = process.env.mongoDBURL

// // connect to database
// mongoose.set('strictQuery', true);
// main().catch(err => console.log(err));
// async function main() {
//   await mongoose.connect(URL);
// }

app.get('/', (req, res) => {
  res.send('welcome')
})



// Add port in terminal with export PORT=port
const port = process.env.PORT || 5000; 
app.listen(port, () => console.log('server started'))