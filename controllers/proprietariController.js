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
    const filterTitle = req.query.title || '%';
    const filterGenre = req.query.genre || '%';

    // SQL INDEX QUERY
    let sqlIndex = `
    SELECT 
        movies.id,
        movies.title,
        movies.genre,
        movies.image,
        AVG(reviews.vote) AS vote_avg     
        FROM movies.movies
        LEFT JOIN movies.reviews
    ON movies.id = reviews.movie_id`;

    // FILTERS
    let filtersArray = [];
    let firstFilter = true;

    if (filterTitle) {
        sqlIndex += ` ${firstFilter ? `WHERE` : `AND`} movies.title LIKE ?`;
        filtersArray.push(`%${filterTitle}%`);
        firstFilter = false;
    }

    if (filterGenre) {
        sqlIndex += ` ${firstFilter ? `WHERE` : `AND`} movies.genre LIKE ?`;
        filtersArray.push(`%${filterGenre}%`);
        firstFilter = false;
    }

    // SQL INDEX QUERY - CLOSING LINES
    sqlIndex += `
    GROUP BY movies.id
    ORDER BY movies.title`;

    // CALL INDEX QUERY
    connection.query(sqlIndex, filtersArray, (err, results) => {

        // ERROR HANDLER
        if (err) {
            return errorHandler500(err, res);
        }

        // MOVIE MAPPING
        const movies = results.map(movie => ({
            ...movie,
            image: generateCompleteImagePath(movie.image),
            reviews: movie.reviews === null ? [] : movie.reviews || []
        }));

        // MOVIE MAPPING


        // POSITIVE RESPONSE
        res.json({
            status: 'OK',
            movies: movies
        });
    });
};


// SHOW
function show(req, res) {

    // URL PARAMETER
    const id = req.params.id;

    // SQL SHOW QUERY
    const sqlShow = `
    SELECT 
        movies.id,
        movies.title,
        movies.genre,
        movies.image,
        movies.abstract,
        AVG(reviews.vote) AS vote_avg 
        FROM movies.movies
        LEFT JOIN movies.reviews
        ON movies.id = reviews.movie_id
        WHERE movies.id = ?
    GROUP BY movies.id`;

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

        const [movie] = results;

        // ITEM IMAGE PATH MAPPING
        movie.image = generateCompleteImagePath(movie.image);

        // REVIEWS QUERY
        const sqlIndexReviews = `
            SELECT 
                id,
                name,
                vote,
                text
            FROM movies.reviews
            WHERE movie_id = ?`;

        // CALL INDEX REVIEWS QUERY
        connection.query(sqlIndexReviews, [id], (err, reviewResults) => {

            // ERROR HANDLER
            if (err) {
                return errorHandler500(err, res);
            }

            // PROPERTY ADDED TO THE ELEMENT
            movie.reviews = reviewResults;

            // POSITIVE RESPONSE
            res.json(movie);
        });
    });
};

// EXPORT CRUD
module.exports = { index, show };


/******************************************************************************
# UTILITY FUNCTIONS
******************************************************************************/

// IMAGE PATH MAPPING
const generateCompleteImagePath = (imageName) => {
    if (!imageName) {
        return `${config.APP_HOST}:${config.APP_PORT}/img/movies_cover/default.jpg`;
    }
    return `${config.APP_HOST}:${config.APP_PORT}/img/movies_cover/${imageName}`;
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
