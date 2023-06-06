const express = require('express');
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const bcrypt = require('bcrypt'),
SALT_WORK_FACTOR = 10;

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true}
})

// Hash the password before saving the user object
UserSchema.pre('save', async function(next) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(this.password, salt);
      this.password = hash;
      next();
    } catch (err) {
      next(err);
    }
  });
  
  // Compare the candidate password with the hashed password
  UserSchema.methods.comparePassword = async function(candidatePassword) {
    try {
      const isMatch = await bcrypt.compare(candidatePassword, this.password);
      return isMatch;
    } catch (err) {
      throw new Error(err);
    }
  };


// Export Model
UserSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', UserSchema);

//ADMIN JE VEC KREIRAN PA JE ZAKOMENTARISANO, DA SE NE BI PONAVLJAO 
//TJ DOLAZI DO KOLFIKTA JER POSTOJE VEC USER SA ISTIM USERNAME-om

//Add a new user to the database
// const admin = new User({
//   username: 'admin',
//   password: 'admin',
//   isAdmin: true
// })

// admin.save()
// .then(function() {
//   console.log('Admin user added to database');
// })
// .catch(function(err) {
//   console.log(err);
// });

module.exports = User;