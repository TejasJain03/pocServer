const express = require('express');

const { createEvent, getEvents } = require('../controllers/event.controller');

const router = express.Router();

router.get('/getevents', getEvents);
router.post('/createevent', createEvent);

module.exports = router;
