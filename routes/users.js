const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken')
const config = require('../config/database')
const bcrypt = require("bcryptjs");

// model
const User = require('../models/user')

// Register
router.post('/register', (req, res) => {
    User.findOne({
        email: req.body.email
    }).then(user => {
        if (user) return res.json({
            msg: 'Email already exists!!'
        })
        let newUser = new User({
            name: req.body.name,
            email: req.body.email,
            username: req.body.username,
            password: req.body.password
        })
        bcrypt.genSalt(5, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash
                newUser.save().then(user => res.json({
                    success: true,
                    user
                })).catch(err => res.json({
                    success: false,
                    err
                }))
            })
        })
    })


})

//Profile
router.get('/profile', passport.authenticate('jwt', {
    session: false
}), (req, res, next) => {
    res.json({
        user: req.user
    })
})

//validate
router.post('/validate', (req, res, next) => {
    const username = req.body.username
    const password = req.body.password
    User.findOne({
        username
    }).then(user => {
        if (!user) return res.json({
            msg: "User not found!!!"
        })
        bcrypt.compare(password, user.password).then(match => {
            if (match) {
                const payload = {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
                jwt.sign(payload, config.secret, {
                    expiresIn: 604800 // 1 week
                }, (err, token) => {
                    if (err) throw err
                    res.json({
                        success: true,
                        token: `Bearer ${token}`
                    })
                })
            } else {
                return res.json({
                    msg: "password incorrect"
                })
            }
        })
    })
})

module.exports = router