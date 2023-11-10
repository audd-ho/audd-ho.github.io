const express = require('express')
const router = express.Router()
const schemas = require('../models/schemas')
const mongoose = require('mongoose')
const UserController = require('../controllers/user');
const GroupController = require('../controllers/group');

var bodyParser = require('body-parser')

var jsonParser = bodyParser.json()

/*
router.post('/', jsonParser ,(req, res) => {
    // console.log(req)
    console.log(req.body)
    res.send({"response": "SUCCESS"})
});
*/
router.post('/', jsonParser, UserController.createUser);
/*
router.post('/', jsonParser, (req, res) => {
    console.log(req.body)
    res.send({"a":"b"})
});
*/

module.exports = router;