// DICHIARAZIONE INIT EXPRESS
const express = require('express');
const router = express.Router();


// IMPORT CONTROLLER
const { index } = require('../controllers/tipologieImmobileController');


// DICHIARAZIONE ROUTES
router.get('/', index);


// EXPORT ROUTER
module.exports = router;