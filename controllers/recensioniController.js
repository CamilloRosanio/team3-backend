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

// STORE
function store(req, res) {

  // REQUEST BODY PARAMS
  const { nome, id_immobile, titolo, testo, voto, num_giorni_di_permanenza } = req.body;

  // ERROR HANDLER
  const validationError = paramsValidation({ nome, id_immobile, titolo, testo, voto, num_giorni_di_permanenza });
  if (validationError) {
    return res.status(400).json(validationError);
  };

  // QUERY PARAMS ARRAY
  const sqlParams = [nome, id_immobile, titolo, testo, voto, num_giorni_di_permanenza];

  // SQL STORE QUERY
  let sqlStore = `
  INSERT INTO boolbnb.recensioni (
      nome,
      id_immobile,
      titolo,
      testo,
      voto,
      num_giorni_di_permanenza)
  VALUES (?, ?, ?, ?, ?, ?);`;

  // CALL STORE QUERY
  connection.query(sqlStore, sqlParams, (err, results) => {

    // ERROR HANDLER
    if (err) {
      return errorHandler500(err, res);
    }

    // POSITIVE RESPONSE
    res.status(201).json({
      message: 'Review successfully posted',
      id_recensione: results.insertId
    });
  });
};


// EXPORT CRUD
module.exports = { store };


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


// PARAMS VALIDATION
function paramsValidation({ nome, id_immobile, titolo, testo, voto, num_giorni_di_permanenza }) {

  // WORDS BLACKLIST
  const forbiddenWords = ['parolaccia', 'insulto'];

  // VALIDATION - NOME
  if (!nome || typeof nome !== 'string' || nome.length > 45) {
    return {
      status: 'KO',
      message: 'Invalid field: nome',
      validation_details: 'nome is required and must be a string of 45 characters max.'
    };
  }

  for (let word of forbiddenWords) {
    if (nome.toLowerCase().includes(word.toLowerCase())) {
      return {
        status: 'KO',
        message: 'Invalid field: nome',
        validation_details: `nome cannot contain blacklisted words like '${word}'.`
      };
    }
  }

  // VALIDATION - ID_IMMOBILE
  if (!id_immobile) {
    return {
      status: 'KO',
      message: 'Invalid field: id_immobile',
      validation_details: 'id_immobile is required and must be of "int" type.'
    };
  }

  // VALIDATION - TITOLO
  if (!titolo || typeof titolo !== 'string' || titolo.length > 60) {
    return {
      status: 'KO',
      message: 'Invalid field: titolo',
      validation_details: 'titolo is required and must be a string of 60 characters max.'
    };
  }

  for (let word of forbiddenWords) {
    if (titolo.toLowerCase().includes(word.toLowerCase())) {
      return {
        status: 'KO',
        message: 'Invalid field: titolo',
        validation_details: `titolo cannot contain blacklisted words like '${word}'.`
      };
    }
  }

  // VALIDATION - TESTO
  if (!testo || typeof testo !== 'string') {
    return {
      status: 'KO',
      message: 'Invalid field: testo',
      validation_details: 'testo is required and must be a string.'
    };
  }

  for (let word of forbiddenWords) {
    if (testo.toLowerCase().includes(word.toLowerCase())) {
      return {
        status: 'KO',
        message: 'Invalid field: testo',
        validation_details: `testo cannot contain blacklisted words like '${word}'.`
      };
    }
  }

  // VALIDATION - VOTO
  if (!voto || typeof voto !== 'number' || voto < 1 || voto > 5) {
    return {
      status: 'KO',
      message: 'Invalid field: voto',
      validation_details: 'voto is required and must be a number between 1 and 5.'
    };
  }

  // VALIDATION - NUM_GIORNI_DI_PERMANENZA
  if (!num_giorni_di_permanenza || num_giorni_di_permanenza == null || typeof num_giorni_di_permanenza !== 'number' || num_giorni_di_permanenza < 1 || num_giorni_di_permanenza > 365) {
    return {
      status: 'KO',
      message: 'Invalid field: num_giorni_di_permanenza',
      validation_details: 'num_giorni_di_permanenza must be a number between 1 and 365.'
    };
  };

  // END OF VALIDATION
  return null;
};