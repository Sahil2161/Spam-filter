const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const mysql = require('mysql');
const { spawn } = require('child_process');


var db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'users'
  });

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

//get Dashboard and inbox
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    db.query("SELECT * FROM inbox WHERE `to` = '" + req.user.email + "'",(err,rows) => {
        if(err){
            console.error('inbox loading',err)
        } else if(rows.length === 0) {
            res.send("<script>alert(\"Inbox is empty\"); window.location = '/compose';</script>");
        } else {
            console.log("Number of rows returned from sql:", rows.length);
            res.render('dashboard', { name: req.user.name,email: req.user.email, rows: rows })
        }
    });
});


//get compose
router.get('/compose', ensureAuthenticated, (req, res) => res.render('compose', { name: req.user.name, email: req.user.email }));

//get spam
router.get('/spam', ensureAuthenticated, (req, res) => {
    db.query("SELECT * FROM spam WHERE `to` = '" + req.user.email + "'",(err,rows) => {
        if(err){
            console.error('inbox loading',err)
        } else if(rows.length === 0) {
        res.send("<script>alert(\"Spam is empty\"); window.location = '/compose';</script>");
        } else {
            console.log("Number of rows returned from sql:", rows.length);
            res.render('spam', { name: req.user.name,email: req.user.email, rows: rows })
        }
    });
});

//get drafts
router.get('/drafts', ensureAuthenticated, (req, res) => {
    // console.log("SELECT * FROM drafts WHERE `from` = '" + req.user.email + "'")
    db.query("SELECT * FROM drafts WHERE `from` = '" + req.user.email + "'",(err,rows) => {
        if(err){
            console.error('drafts loading ',err)
        } else if(rows.length === 0) {
            res.send("<script>alert(\"Drafts is empty\"); window.location = '/compose';</script>");
        } else {
            console.log("Number of rows returned from sql:", rows.length);
            res.render('drafts', { name: req.user.name,email: req.user.email, rows: rows })
        }
    });
});

// compose post request
router.post('/compose', ensureAuthenticated, (req, res) => {
    // sender mail address
    const from = req.user.email;
    // these felds contain data from compose form
    const { to, subject, body, send} = req.body;
    
    // if send: discard render the compose form
    if(send === "Discard"){
        console.log("User discarded new email");
        res.redirect('compose');
    } else
    if(send === "Save Draft"){
        // saved into draft
        console.log(`New email inserted into drafts from:${from} to: ${to}`);
        db.query('INSERT INTO drafts SET ? ',{from: from, to: to, subject: subject, body: body}, (err,results)=>{
            if(err){
                console.log("Error inserting new email into drafts",err);
                return res.send("<script>alert(\"There was an error\"); window.location = '/compose';</script>");
            } else {
                console.log("New mail was saved in drafts",results);
                return res.send("<script>alert(\"Email saved in drafts\"); window.location = '/compose';</script>");
            }
        });
    } else 
    if(send === "Send")
    {
        // TODO: save the current email into inbox or spam based on results from python script
        if(body === '')
            res.send("<script>alert(\"Body of the email cannot be empty.\"); window.location = '/compose';</script>")
        else
        {
            console.log(`New email sent from:${from} to: ${to}`);

            const childPython = spawn('python', ['./python/main.py', body]);
            
            childPython.stdout.on('data', (data) => {
                result = String(data);
                console.log(result);
                if(result.charCodeAt(0) == 72){
                    db.query('INSERT INTO inbox SET ? ',{from: from, to: to, subject: subject, body: body}, (err,results)=>{
                        if(err){
                            console.log("Error inserting new email into inbox",err);
                        } else {
                            console.log("New mail stored in inbox with results from database",results);
                        }
                    });
                } else {
                    db.query('INSERT INTO spam SET ? ',{from: from, to: to, subject: subject, body: body}, (err,results)=>{
                        if(err){
                            console.log("Error inserting new email into spam",err);
                        } else {
                            console.log("New mail stored in spam with results from database",results);
                        }
                    });
                }
            });

            res.send("<script>alert(\"Email was sent successfully\"); window.location = '/compose';</script>");
        }
    }
});

module.exports = router;
