const express = require('express');
const router = express.Router();

const User = require('../schemas/UserSchema');

const passport = require('passport');


router.get('/login', (req, res, next) => {
    res.render('login')
})

router.post('/login', passport.authenticate('local', {successRedirect: '/dashboard', failureRedirect: '/'}))

router.get('/dashboard', function(req, res) {
  const username = req.user.username

    if (req.isAuthenticated()) {
      res.render('dashboard', {
        name: username,
        isLogin: true
      })

    } else {
      res.redirect('/');
    }
  });


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