// config/passport.js
const LocalStrategy = require('passport-local').Strategy;
const mysql = require('mysql')

var db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'users'
});

// expose this function to our app using module.exports
module.exports = function (passport) {


  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function (id, done) {
    db.query("select * from accounts where id = " + id, function (err, rows) {
      done(err, rows[0]);
    });
  });

  // LOCAL LOGIN
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  options = { usernameField: 'email', passwordField: 'password', passReqToCallback: true };
  passport.use('local', new LocalStrategy(options, (req, email, password, done) => {

    // callback with email and password from our form
    db.query("SELECT * FROM accounts WHERE `email` = '" + email + "'", function (err, rows) {
      // if error occured 
      if (err)
        return done('Database ' + err);

      // if no user found
      if (!rows.length) {
        return done(null, false);
      }

      // if the user is found but the password is wrong
      if (!(rows[0].password == password))
        return done(null, false,); // create the loginMessage and save it to session as flashdata

      // all is well, return successful user
      return done(null, rows[0]);
    });
  }));
};