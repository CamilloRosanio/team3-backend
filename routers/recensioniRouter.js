// DICHIARAZIONE INIT EXPRESS
const express = require("express");
const router = express.Router();

// IMPORT CONTROLLER
const { index } = require("../controllers/recensioniController");

// DICHIARAZIONE ROUTES
router.get("/", index);

// EXPORT ROUTER
module.exports = router;
