const express = require('express')
const path = require('path')
const bodyParser = require("body-parser")
const passport = require('passport')
const mongoose = require('mongoose')
const cors = require('cors');
const config = require('./config/database')

mongoose.connect(config.database, {
    useNewUrlParser: true
}).then(() => console.log('MongooseDb connected !!')).catch(err => console.log(err))

const app = express()

const users = require('./routes/users')

//set static folder
app.use(express.static(path.join(__dirname, 'public')))

// passport middleware
app.use(passport.initialize());
app.use(passport.session())

require('./config/passport')(passport)

//port
const port = process.env.PORT || 8080

//cors
app.use(cors());

//test router
app.get('', (req, res) => res.send('Ok'))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}))

// parse application/json
app.use(bodyParser.json())

app.use('/users', users)

app.listen(port, () => console.log('Server is listening on port ' + port))