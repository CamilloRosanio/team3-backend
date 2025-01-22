// DICHIARAZIONE
function notFound(req, res, next) {
    res.status(404);
    res.json({
        status: 'KO',
        error: 'Not found'
    });
};


// EXPORT
module.exports = notFound;