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

// INDEX
function index(req, res) {

    // URL QUERY (ARGUMENTS AS FILTERS)
    const filterCity = req.query.city || '%';
    const filterAddress = req.query.address || '%';
    const filterRooms = req.query.rooms || '1';
    const filterBeds = req.query.beds || '1';
    const filterType = req.query.type || '%';

    // SQL INDEX QUERY
    let sqlIndex = `
    SELECT 
        immobili.*,
        AVG(recensioni.voto) AS voto 
        FROM boolbnb.immobili
        LEFT JOIN boolbnb.recensioni
    ON immobili.id = recensioni.id_immobile`;

    // FILTERS
    let filtersArray = [];
    let firstFilter = true;

    if (filterCity) {
        sqlIndex += ` ${firstFilter ? `WHERE` : `AND`} immobili.città LIKE ?`;
        filtersArray.push(`%${filterCity}%`);
        firstFilter = false;
    }

    if (filterAddress) {
        sqlIndex += ` ${firstFilter ? `WHERE` : `AND`} immobili.indirizzo LIKE ?`;
        filtersArray.push(`%${filterAddress}%`);
        firstFilter = false;
    }

    if (filterRooms) {
        sqlIndex += ` ${firstFilter ? `WHERE` : `AND`} immobili.num_stanze >= ?`;
        filtersArray.push(filterRooms);
        firstFilter = false;
    }

    if (filterBeds) {
        sqlIndex += ` ${firstFilter ? `WHERE` : `AND`} immobili.num_letti >= ?`;
        filtersArray.push(filterBeds);
        firstFilter = false;
    }

    if (filterType) {
        sqlIndex += ` ${firstFilter ? `WHERE` : `AND`} immobili.tipologia LIKE ?`;
        filtersArray.push(`%${filterType}%`);
        firstFilter = false;
    }

    // SQL INDEX QUERY - CLOSING LINES
    sqlIndex += `
    GROUP BY immobili.id
    ORDER BY immobili.num_likes`;

    // CALL INDEX QUERY
    connection.query(sqlIndex, filtersArray, (err, results) => {

        // ERROR HANDLER
        if (err) {
            return errorHandler500(err, res);
        }

        // ITEM MAPPING
        const immobili = results.map(immobile => ({
            ...immobile,
            immagine: generateCompleteImagePath(immobile.immagine),
            voto: immobile.voto === null ? 0 : immobile.voto || 0
        }));


        // POSITIVE RESPONSE
        res.json({
            status: 'OK',
            immobili: immobili
        });
    });
};


// SHOW
function show(req, res) {

    // // URL PARAMETER
    // const id = req.params.id;

    // // SQL SHOW QUERY
    // const sqlShow = `
    // SELECT 
    //     movies.id,
    //     movies.title,
    //     movies.genre,
    //     movies.image,
    //     movies.abstract,
    //     AVG(reviews.vote) AS vote_avg 
    //     FROM movies.movies
    //     LEFT JOIN movies.reviews
    //     ON movies.id = reviews.movie_id
    //     WHERE movies.id = ?
    // GROUP BY movies.id`;

    // // CALL SHOW QUERY
    // connection.query(sqlShow, [id], (err, results) => {

    //     // ERROR HANDLER
    //     if (err) {
    //         return errorHandler500(err, res);
    //     }

    //     // ERROR HANDLER
    //     if (results.length === 0) {
    //         return errorHandler404(null, res);
    //     }

    //     const [movie] = results;

    //     // ITEM IMAGE PATH MAPPING
    //     movie.image = generateCompleteImagePath(movie.image);

    //     // REVIEWS QUERY
    //     const sqlIndexReviews = `
    //         SELECT 
    //             id,
    //             name,
    //             vote,
    //             text
    //         FROM movies.reviews
    //         WHERE movie_id = ?`;

    //     // CALL INDEX REVIEWS QUERY
    //     connection.query(sqlIndexReviews, [id], (err, reviewResults) => {

    //         // ERROR HANDLER
    //         if (err) {
    //             return errorHandler500(err, res);
    //         }

    //         // PROPERTY ADDED TO THE ELEMENT
    //         movie.reviews = reviewResults;

    //         // POSITIVE RESPONSE
    //         res.json(movie);
    //     });
    // });
};

// EXPORT CRUD
module.exports = { index, show };


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
