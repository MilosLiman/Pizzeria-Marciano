const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser')
const logger = require('morgan');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const PORT = 3000;

const passport = require('passport');
const session = require('express-session');
const connectEnsureLogin = require('connect-ensure-login'); //authorization

const LocalStrategy = require('passport-local').Strategy;

const User = require('./schemas/UserSchema');
const IndexRouter = require('./routes/index');
const AuthRouter = require('./routes/auth');


const { MongoClient, Admin } = require('mongodb');

const app = express();

// View Engine Setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//The root argument specifies the root directory from which to serve static assets
//express.static(root, [options])
app.use(express.static(path.join(__dirname, 'public')));


app.use(logger('dev'));

// Body-parser middleware
// Allowing app to use body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'tajna',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 100} //1 sat
}))

app.use(passport.initialize());
app.use(passport.session());


// To use with sessions
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());


mongoose.connect('mongodb://127.0.0.1:27017/pizzeria', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})


const connection = mongoose.connection;
connection.once('open', () => {
    console.log('Successfully connected to MongoDB');
})


// Set up passport strategy
passport.use(new LocalStrategy(
    async function(username, password, done) {

        try{
            const user = await User.findOne({ username: username});

            if(!user){
                return done(null, false, { message: 'Incorrect username.' })
            }

            const isMatch = await user.comparePassword(password);

            if(isMatch){
                return done(null, user);
            }else{
                return done(null, false, { message: 'Incorrect password.'})
            }

        }catch(err){
            return done(err);
        }
    }
  ));

  passport.use(new LocalStrategy(
    async function(username, password, done){
        try{

            const admin = await User.findOne({username: username});

            if(!admin){
                return done(null, false, {message: 'Incorrect Admin username.'})
            }

            const isMatch = await admin.comparePassword(password);

            if(isMatch){
                return done(null, admin)
            }else{
                return done(null, false, { message: 'Incorrect Admin password.'})
            }
            
        }catch(err){
            return done(err)
        }
    }
  ))
  
  // Set up passport serialization and deserialization
  passport.serializeUser(function(user, done) {
    done(null, user.username);
  });
  
  passport.deserializeUser(function(username, done) {
    done(null, { username: username });
  });


app.use('/', IndexRouter);
app.use('/', AuthRouter);


app.listen(PORT, (err) => {
    if (err) console.log("Error in server setup")
    console.log("Server listening on Port", PORT);
})