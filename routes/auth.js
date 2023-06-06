const express = require('express');
const router = express.Router();

const User = require('../schemas/UserSchema');

var LocalStrategy = require('passport-local').Strategy;
var crypto = require('crypto');
const connectEnsureLogin = require('connect-ensure-login');// authorization
const passport = require('passport');

//midleware funkcija koja proverava da li je korisnik autentikovan
// function isAuthenticated(req, res, next){

//   // if(req.isAuthenticated()){
//   //   req.body.username = 'user';
//   //   req.body.password = 'user';
//   //   next()
//   // }else{
//   //   res.redirect('/admin/login');
//   // }
// }


router.get('/login', (req, res, next) => {
    res.render('login')
})

router.post('/login', passport.authenticate('local', {successRedirect: '/dashboard', failureRedirect: '/'}))

router.get('/dashboard', function(req, res) {
  const username = req.user.username

    if (req.isAuthenticated()) {
      // res.send(`Welcome, ${req.user.username}!`);

      res.render('dashboard', {
        name: username,
        isLogin: true
      })

    // res.send(`Hello ${req.user.username}. 
    // Your session ID is ${req.sessionID} 
    // and your session expires 
    // in ${req.session.cookie.maxAge}`)

    } else {
      res.redirect('/');
    }
  });

// router.get('/dashboard', isAuthenticated, function(req, res){
//   res.render('dashboard');
// })

router.get('/signup', (req, res) => {
    res.render('signup')
})

router.post('/signup', async (req, res, next) => {
    const { username, password } = req.body;

    const newUser = new User({
        username: username,
        password: password
    });

    await newUser.save();
    console.log("saved successfully");

})

function ensureLoggedIn(redirectUrl) {
  return function(req, res, next) {

    if(req.isAuthenticated()){
      return next();
    }else {
      res.redirect(redirectUrl);
    }
  }
}


router.get('/admin/login', (req, res) => {
  res.render('admin-login');
})

router.post('/admin/login', passport.authenticate('local', {failureRedirect: '/admin/login'}), (req, res) => {
  res.redirect('/admin');
});

router.get('/admin', ensureLoggedIn('/admin/login'), async (req, res) => {

  const users = await User.find()

  res.render('admin', {
    isLogin: true,
    username: req.user.username,
    sessionID: req.sessionID,
    users: users
  });

})



module.exports = router;