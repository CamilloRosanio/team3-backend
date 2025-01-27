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

    // SQL QUERY
    let sqlIndex = `
    SELECT *
    FROM boolbnb.tipologie_immobile
    `;

    // CALL INDEX QUERY
    connection.query(sqlIndex, (err, results) => {
        // ERROR HANDLER
        if (err) {
            return errorHandler500(err, res);
        }

        // POSITIVE RESPONSE
        res.json({
            status: "OK",
            tipologieImmobile: results,
        });
    });
}


// EXPORT CRUD
module.exports = { index };

/******************************************************************************
# UTILITY FUNCTIONS
******************************************************************************/

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