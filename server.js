// require env variables
require('dotenv').config({path: __dirname + '/.env'})


// Dependencies
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieSession = require('cookie-session')
const passport = require('passport')
require('./passport/passport')(passport)

// connecting to database
const DB_PASSWORD = process.env.DB_PASSWORD
if(!DB_PASSWORD) {
   console.error("NO DATABASE CREDENTIALS PASSED");
}
const uri = `mongodb+srv://admin:${DB_PASSWORD}@cluster0-uy0c1.mongodb.net/test?retryWrites=true&w=majority`;

mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
        .then(() => {
            console.log("CONNECTED TO DATABASE SUCCESSFULLY")
        })
        .catch(err => {
            console.log("COULDN'T CONNECT TO DATABASE")
        })


// creating and handling routes
const app = express()


// CORS ERROR FOR SERVER REQUEST
app.use(cors())

// BODY PARSER MIDDLEWARE IN USE
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

// PASSPORT 
app.use(
    cookieSession({
        maxAge: 14*24*60*1000,
        keys: [process.env.SECRET]
    })
)
app.use(passport.initialize())
app.use(passport.session())




const api = require('./api/api')
app.use('/', api)


const port = process.env.PORT || 8000
app.listen(port, () => {
    console.log(`PORT STARTED AT ${port}`)
})