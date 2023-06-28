const express = require('express')
const app = express()

app.use(express.json())

app.get('/', (req, res) => {
  res.json('welcome')
})



// Add port in terminal with export PORT=port
const port = process.env.PORT || 5000; 
app.listen(port, () => console.log('server started'))