/******************************************************************************
# SETUP
******************************************************************************/

// IMPORT DB CONNECTION
const connection = require('../db/connection_booldb');


// IMPORT ENV + DEFAULT
const { APP_HOST, APP_PORT } = process.env;

if (!APP_HOST || !APP_PORT) {
    console.log('Missing ENV variables');
}

const config = {
    APP_HOST: APP_HOST || 'http://localhost',
    APP_PORT: APP_PORT || '3000'
};


/******************************************************************************
# CRUD
******************************************************************************/

// SHOW
function show(req, res) {

    // URL PARAMETER
    const id = req.params.id;

    // SQL SHOW QUERY
    const sqlShow = `
    SELECT 
        proprietari.id,
        proprietari.nome,
        proprietari.cognome,
        proprietari.email,
        proprietari.telefono
        FROM boolbnb.proprietari
        WHERE proprietari.id = ?
    `;

    // CALL SHOW QUERY
    connection.query(sqlShow, [id], (err, results) => {

        // ERROR HANDLER
        if (err) {
            return errorHandler500(err, res);
        }

        // ERROR HANDLER
        if (results.length === 0) {
            return errorHandler404(null, res);
        }

        const [proprietario] = results;


        // POSITIVE RESPONSE
        res.json(proprietario);
    });
};

// EXPORT CRUD
module.exports = { show };


/******************************************************************************
# UTILITY FUNCTIONS
******************************************************************************/

// ERROR HANDLER (500)
const errorHandler500 = (err, res) => {
    if (err) {
        console.error(err);
        return res.status(500).json({
            status: 'KO',
            message: 'Database query failed'
        });
    }
};

// ERROR HANDLER (404)
const errorHandler404 = (item, res) => {
    if (!item) {
        return res.status(404).json({
            status: 'KO',
            message: 'Not found'
        });
    }
};
