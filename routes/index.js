const express = require('express');
const router = express.Router();
// const User = require('./schemas/UserSchema');

router.get('/', (req, res) => {
    res.render('index')
})

module.exports = router;