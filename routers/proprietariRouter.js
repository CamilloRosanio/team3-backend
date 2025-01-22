// DICHIARAZIONE INIT EXPRESS
const express = require('express');
const router = express.Router();


// IMPORT CONTROLLER
const { show } = require('../controllers/proprietariController');


// DICHIARAZIONE ROUTES
router.get('/:id', show);


// EXPORT ROUTER
module.exports = router;