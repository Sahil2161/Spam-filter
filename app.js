const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mysql = require('mysql');
const passport = require('passport');
const session = require('express-session');
const logger = require('morgan');


const app = express();


// Passport Config
require('./config/passport')(passport);

// Connect to Mysql
var db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'users'
});

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// app settings 
app.disable('etag');
app.use( logger('tiny'));
app.use( express.urlencoded({ extended: true }));

// Express session
app.use( session({ secret: 'secret', resave: true, saveUninitialized: true }));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());


// Routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));


const PORT = process.env.PORT || 3000;
app.listen(PORT, (err) => {
  if(err)
    console.error("Error setting up server")
  else
    console.log("Server listenng on port:",PORT);
});
