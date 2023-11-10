const express = require('express')
const router = express.Router()
const schemas = require('../models/schemas')
const mongoose = require('mongoose')
const UserController = require('../controllers/user');
const GroupController = require('../controllers/group');
//const ActivityController = require('../controllers/activity');

let bodyParser = require('body-parser')

let jsonParser = bodyParser.json()

/*
router.post('/', jsonParser, (req, res) => {
    console.log(req.body);

    res.send({
        //"data is": "HI THERE!!", "Group Code": "T34M1"
        "TESTING" : 123
    }
    
)});
*/
router.post("/", jsonParser, GroupController.createGroup)

module.exports = router;