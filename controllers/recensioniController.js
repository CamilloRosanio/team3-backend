/******************************************************************************
# SETUP
******************************************************************************/

// IMPORT DB CONNECTION
const connection = require("../db/connection_booldb");

// IMPORT ENV + DEFAULT
const { APP_HOST, APP_PORT } = process.env;

if (!APP_HOST || !APP_PORT) {
  console.log("Missing ENV variables");
}

const config = {
  APP_HOST: APP_HOST || "http://localhost",
  APP_PORT: APP_PORT || "3000",
};

/******************************************************************************
# CRUD
******************************************************************************/

// INDEX
function index(req, res) {
  // SQL INDEX QUERY
  let sqlIndex = `
    SELECT * FROM boolbnb.recensioni`;

  // CALL INDEX QUERY
  connection.query(sqlIndex, (err, results) => {
    // ERROR HANDLER
    if (err) {
      return errorHandler500(err, res);
    }

    // ITEM MAPPING
    const immobili = results.map((immobile) => ({
      ...immobile,
      immagine: generateCompleteImagePath(immobile.immagine),
      voto: immobile.voto === null ? 0 : immobile.voto || 0,
    }));

    // POSITIVE RESPONSE
    res.json({
      status: "OK",
      immobili: immobili,
    });
  });
}

// EXPORT CRUD
module.exports = { index };

/******************************************************************************
# UTILITY FUNCTIONS
******************************************************************************/

// IMAGE PATH MAPPING
const generateCompleteImagePath = (imageName) => {
  if (!imageName) {
    return `${config.APP_HOST}:${config.APP_PORT}/img/immobili/immobili-default.jpg`;
  }
  return `${config.APP_HOST}:${config.APP_PORT}/img/immobili/${imageName}`;
};

// ERROR HANDLER (500)
const errorHandler500 = (err, res) => {
  if (err) {
    console.error(err);
    return res.status(500).json({
      status: "KO",
      message: "Database query failed",
    });
  }
};

// ERROR HANDLER (404)
const errorHandler404 = (item, res) => {
  if (!item) {
    return res.status(404).json({
      status: "KO",
      message: "Not found",
    });
  }
};
