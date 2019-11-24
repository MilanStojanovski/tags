const express = require("express");
const router = express.Router();
const passport = require("passport");
const axios = require("axios");
var http = require("http");

// Load models
const Link = require("../../models/Link");

// @route   GET api/links
// @desc    Get links route
// @access  Public
router.get("/", (req, res) => {
    Link.find()
        .sort({ date: -1 })
        .then(links => res.json(links))
        .catch(err => res.status(404).json(err));
});

// @route   GET api/links/getResource
// @desc    Get links route
// @access  Public
router.get("/getResource", (req, res) => {
    const { query } = req;
    axios({
        method: "get",
        url: query.url,
        headers: { "x-Trigger": "CORS" }
    })
        .then(response => {
            res.status(200).json({ response: response.data });
        })
        .catch(err => res.status(404).json(err));
});

// @route   POST api/links
// @desc    Create links route
// @access  Private
router.post(
    "/",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const newLink = new Link({
            url: req.body.url,
            userId: req.user.id
        });

        newLink.save().then(link => res.json(link));
    }
);

module.exports = router;
