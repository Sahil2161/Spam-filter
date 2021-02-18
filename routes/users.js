const express = require('express');
const router = express.Router();
const passport = require('passport');
const mysql = require('mysql');
const { forwardAuthenticated } = require('../config/auth');

var db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'users'
});

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Registeration
router.post('/register', (req, res) => {

  // information entered by user in register form
  const { name, email, password, passwordConfirm } = req.body;
  
  // query database if user already present
  db.query('SELECT email FROM accounts where email = ?',[email], (err, results) => {
      if(err) console.log("error in finding user before registeration");

        // checking if user already exists before registering
        if( results.length > 0){
            console.log("Email id already registered:", email);
            return res.send(`<script>alert("Email: ${email} is already in use")</script>`);
        } else 
        
        // if password and password confirm do not match
        if(password !== passwordConfirm){
            return res.send("<script>alert(\"Passwords do not match\")</script>");
        } else {
            console.log("New user registration with information:",[name,email,password]);
            // inserting user data into database
            db.query('INSERT INTO accounts SET ? ',{ name: name, email: email, password: password},(err,results) =>{
                if(err){
                    console.log("Error inserting user info into database with error number ",err.errno);
                } else {
                    console.log("Result of insertion:",results);
                    return res.send("<script>alert(\"Registration completed\")</script>");
                }
            })
        }   
  })
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', { successRedirect: '/dashboard', failureRedirect: '/users/login', failureFlash: false})(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
//   req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login',);
});


module.exports = router;
