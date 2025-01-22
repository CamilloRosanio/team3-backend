// DICHIARAZIONE INIT EXPRESS
const express = require('express');
const router = express.Router();


// IMPORT CONTROLLER
const { index, show } = require('../controllers/immobiliController');


// DICHIARAZIONE ROUTES
router.get('/', index);
router.get('/:id', show);


// EXPORT ROUTER
module.exports = router;