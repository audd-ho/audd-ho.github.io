const express = require('express')
const router = express.Router()
const schemas = require('../models/schemas')
const mongoose = require('mongoose')
const UserController = require('../controllers/user');
const GroupController = require('../controllers/group');

var bodyParser = require('body-parser')

var jsonParser = bodyParser.json()

//router.post('/', jsonParser, UserController.getGroupUsers);
router.get('/RT:GroupID', jsonParser, GroupController.getRTGroupUsers_MDT);
router.post('/Selected', jsonParser, GroupController.setChosenDetails);
//router.post("/trySSE", jsonParser, UserController.tryOutSSE);

module.exports = router;