// SHOW
function show(req, res) {
  // URL PARAMETER
  const id = req.params.id;

  // SQL SHOW QUERY
  const sqlShow = `
    SELECT * FROM boolbnb.proprietari
    WHERE id = 1
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
}

// EXPORT CRUD
module.exports = { show };
