// DICHIARAZIONE INIT EXPRESS
const express = require('express');
const router = express.Router();


// IMPORT CONTROLLER
const { index, show, store, modify } = require('../controllers/immobiliController');


// DICHIARAZIONE ROUTES
router.get('/', index);
router.get('/:id', show);
router.post('/', store);
router.patch('/:id', modify);


// EXPORT ROUTER
module.exports = router;