require('dotenv').config()
const bodyParser = require('body-parser')
const express = require('express')
const apiRouter = require('./routes/api')
const compression = require('compression')
const { connectMongoDb } = require('./config/db')
const app = express()
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use(compression())
swaggerJsdoc = require("swagger-jsdoc"),
swaggerUi = require("swagger-ui-express");

// routes
app.get('/', (req, res) => res.status(200).json({ message: 'Hey coders! 💻' }))
app.use('/api/v1', apiRouter)


// global error handler
app.use((err, req, res, next) => {
  console.log(err)
  res.status(500).json({
    error: err.message || 'Something went wrong'
  })
})
// creating server
app.listen(process.env.APP_PORT, async () => {
  connectMongoDb()
  console.log(`Server is running on port ${process.env.APP_PORT}`)
  console.log(`Server Url ${process.env.APP_URL}`)
})
module.exports = app