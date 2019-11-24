const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");

// Load User model
const User = require("../../models/User");

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "Users works" }));

// @route   POST api/users/register
// @desc    Register user
// @access  Public
router.post("/register", (req, res) => {
    User.findOne({ username: req.body.username }).then(user => {
        if (user) {
            errors.email = "username already exists";
            res.status(400).json(errors);
        } else {
            const newUser = new User({
                username: req.body.username,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: req.body.password
            });

            bcrypt.genSalt(8, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) {
                        throw err;
                    } else {
                        newUser.password = hash;
                        newUser
                            .save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err));
                    }
                });
            });
        }
    });
});

// @route   POST api/users/login
// @desc    Login User / Return jwt token
// @access  Public
router.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ username }).then(user => {
        // Check for user
        if (!user) {
            errors.email = "User not found";
            res.status(404).json(errors);
        }

        // Check password
        bcrypt.compare(password, user.password).then(isMatch => {
            if (isMatch) {
                // User Matched
                const payload = {
                    id: user.id,
                    username: user.username
                }; // Create JWT Payload

                // Sign Token
                jwt.sign(
                    payload,
                    keys.secretOrKey,
                    { expiresIn: 3600 * 24 },
                    (err, token) => {
                        res.json({
                            success: true,
                            token: "Bearer " + token
                        });
                    }
                );
            } else {
                errors.password = "Incorrect password";
                res.status(400).json(errors);
            }
        });
    });
});

module.exports = router;
