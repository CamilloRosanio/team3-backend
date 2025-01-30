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
  // URL QUERY (ARGUMENTS AS FILTERS)
  const filterCity = req.query.city || "%";
  const filterAddress = req.query.address || "%";
  const filterRooms = req.query.rooms || "1";
  const filterBeds = req.query.beds || "1";
  const filterType = req.query.type || "%";

  console.log(filterCity, filterAddress, filterRooms, filterBeds, filterType);

  // SQL QUERY
  let sqlIndex = `
    SELECT 
        immobili.*,
        AVG(recensioni.voto) AS voto,
        tipologie_immobile.nome AS tipologia 
        FROM boolbnb.immobili
        LEFT JOIN boolbnb.recensioni
        ON immobili.id = recensioni.id_immobile
        JOIN boolbnb.tipologie_immobile
    ON immobili.id_tipologia_immobile = tipologie_immobile.id
    `;

  // FILTERS
  let filtersArray = [];
  let firstFilter = true;

  if (filterCity) {
    sqlIndex += ` ${firstFilter ? `WHERE` : `AND`} immobili.città LIKE ?`;
    filtersArray.push(`%${filterCity}%`);
    firstFilter = false;
  }

  if (filterAddress) {
    sqlIndex += ` ${firstFilter ? `WHERE` : `OR`} immobili.indirizzo LIKE ?`;
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
    sqlIndex += ` ${
      firstFilter ? `WHERE` : `AND`
    } tipologie_immobile.nome LIKE ?`;
    filtersArray.push(`%${filterType}%`);
    firstFilter = false;
  }

  // SQL QUERY - CLOSING LINES
  sqlIndex += `
    GROUP BY immobili.id
    ORDER BY immobili.num_likes DESC`;

  // CALL INDEX QUERY
  connection.query(sqlIndex, filtersArray, (err, results) => {
    console.log(sqlIndex, filtersArray);

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

// SHOW
function show(req, res) {
  // URL PARAMETER
  const id = req.params.id;

  // SQL QUERY
  const sqlShow = `
    SELECT 
        immobili.*,
        AVG(recensioni.voto) AS voto,
        proprietari.id AS id_proprietario,
        proprietari.nome AS nome_proprietario,
        proprietari.cognome AS cognome_proprietario,
        proprietari.email AS email_proprietario,
        proprietari.telefono AS telefono_proprietario,
        tipologie_immobile.nome AS tipologia
        FROM boolbnb.immobili
        LEFT JOIN boolbnb.recensioni
        ON immobili.id = recensioni.id_immobile
        JOIN boolbnb.proprietari
        ON immobili.id_proprietario = proprietari.id
        JOIN boolbnb.tipologie_immobile
        ON immobili.id_tipologia_immobile = tipologie_immobile.id
        WHERE immobili.id = ?
    GROUP BY immobili.id`;

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

    const [immobile] = results;

    // ITEM IMAGE PATH MAPPING
    immobile.immagine = generateCompleteImagePath(immobile.immagine);

    // REVIEWS QUERY
    const sqlIndexReviews = `
        SELECT
		    *
            FROM boolbnb.recensioni
        WHERE recensioni.id_immobile = ?`;

    // CALL INDEX REVIEWS QUERY
    connection.query(sqlIndexReviews, [id], (err, reviewResults) => {
      // ERROR HANDLER
      if (err) {
        return errorHandler500(err, res);
      }

      // PROPERTY ADDED TO THE ELEMENT
      immobile.recensioni = reviewResults;

      // POSITIVE RESPONSE
      res.json(immobile);
    });
  });
}

// STORE
function store(req, res) {
  // REQUEST BODY PARAMS
  const {
    id_proprietario,
    titolo,
    num_stanze,
    num_letti,
    num_bagni,
    città,
    indirizzo,
    id_tipologia_immobile,
    mq,
  } = req.body;

  // ERROR HANDLER
  const validationError = paramsValidationImmobile({
    id_proprietario: parseInt(id_proprietario),
    titolo,
    num_stanze: parseInt(num_stanze),
    num_letti: parseInt(num_letti),
    num_bagni: parseInt(num_bagni),
    città,
    indirizzo,
    id_tipologia_immobile: parseInt(id_tipologia_immobile),
    mq: parseInt(mq),
  });
  if (validationError) {
    return res.status(400).json(validationError);
  }

  // QUERY PARAMS ARRAY
  const sqlParams = [
    id_proprietario,
    titolo,
    num_stanze,
    num_letti,
    num_bagni,
    città,
    indirizzo,
    id_tipologia_immobile,
    mq,
  ];

  // SQL QUERY
  let sqlStore = `
    INSERT INTO boolbnb.immobili (
        id_proprietario,
        titolo,
        num_stanze,
        num_letti,
        num_bagni,
        città,
        indirizzo,
        id_tipologia_immobile,
        mq
      )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`;

  // CALL STORE QUERY
  connection.query(sqlStore, sqlParams, (err, results) => {
    // ERROR HANDLER
    if (err) {
      return errorHandler500(err, res);
    }

    // POSITIVE RESPONSE
    res.status(201).json({
      message: "Immobile successfully posted",
      id_immobile: results.insertId,
    });
  });
}

// MODIFY
function modify(req, res) {
  // URL PARAMETER
  const id = req.params.id;

  // SQL QUERY
  const sqlModify = `
    UPDATE boolbnb.immobili
        SET immobili.num_likes = (immobili.num_likes + 1)
    WHERE immobili.id = ?`;

  // CALL MODIFY QUERY
  connection.query(sqlModify, [id], (err, results) => {
    // ERROR HANDLER
    if (err) {
      return errorHandler500(err, res);
    }

    // POSITIVE RESPONSE
    res.status(201).json({
      message: "Add Like successful: +1 Like",
      id_immobile: id,
    });
  });
}

// EXPORT CRUD
module.exports = { index, show, store, modify };

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

// PARAMS VALIDATION - STORE
function paramsValidationImmobile({
  id_proprietario,
  titolo,
  num_stanze,
  num_letti,
  num_bagni,
  città,
  indirizzo,
  id_tipologia_immobile,
  mq,
}) {
  // WORDS BLACKLIST
  const forbiddenWords = ["parolaccia", "insulto"];

  // VALIDATION - ID_PROPRIETARIO
  if (!id_proprietario) {
    return {
      status: "KO",
      message: "Invalid field: id_proprietario",
      validation_details:
        'id_proprietario is required and must be of "int" type.',
    };
  }

  // VALIDATION - TITOLO
  if (!titolo || typeof titolo !== "string" || titolo.length > 150) {
    return {
      status: "KO",
      message: "Invalid field: titolo",
      validation_details:
        "titolo is required and must be a string of 150 characters max.",
    };
  }

  for (let word of forbiddenWords) {
    if (titolo.toLowerCase().includes(word.toLowerCase())) {
      return {
        status: "KO",
        message: "Invalid field: titolo",
        validation_details: `titolo cannot contain blacklisted words like '${word}'.`,
      };
    }
  }

  // VALIDATION - NUM_STANZE
  if (
    !num_stanze ||
    num_stanze == null ||
    typeof num_stanze !== "number" ||
    num_stanze < 1 ||
    num_stanze > 100
  ) {
    return {
      status: "KO",
      message: "Invalid field: num_stanze",
      validation_details: "num_stanze must be a number between 1 and 100.",
    };
  }

  // VALIDATION - NUM_LETTI
  if (
    !num_letti ||
    num_letti == null ||
    typeof num_letti !== "number" ||
    num_letti < 1 ||
    num_letti > 100
  ) {
    return {
      status: "KO",
      message: "Invalid field: num_letti",
      validation_details: "num_letti must be a number between 1 and 100.",
    };
  }

  // VALIDATION - NUM_BAGNI
  if (
    !num_bagni ||
    num_bagni == null ||
    typeof num_bagni !== "number" ||
    num_bagni < 1 ||
    num_bagni > 100
  ) {
    return {
      status: "KO",
      message: "Invalid field: num_bagni",
      validation_details: "num_bagni must be a number between 1 and 100.",
    };
  }

  // VALIDATION - CITTÀ
  if (!città || typeof città !== "string" || città.length > 60) {
    return {
      status: "KO",
      message: "Invalid field: titolo",
      validation_details:
        "titolo is required and must be a string of 60 characters max.",
    };
  }

  for (let word of forbiddenWords) {
    if (città.toLowerCase().includes(word.toLowerCase())) {
      return {
        status: "KO",
        message: "Invalid field: città",
        validation_details: `città cannot contain blacklisted words like '${word}'.`,
      };
    }
  }

  // VALIDATION - INDIRIZZO
  if (!indirizzo || typeof indirizzo !== "string" || indirizzo.length > 150) {
    return {
      status: "KO",
      message: "Invalid field: indirizzo",
      validation_details:
        "indirizzo is required and must be a string of 150 characters max.",
    };
  }

  for (let word of forbiddenWords) {
    if (indirizzo.toLowerCase().includes(word.toLowerCase())) {
      return {
        status: "KO",
        message: "Invalid field: indirizzo",
        validation_details: `indirizzo cannot contain blacklisted words like '${word}'.`,
      };
    }
  }

  // VALIDATION - TIPOLOGIA
  if (
    !id_tipologia_immobile ||
    id_tipologia_immobile == null ||
    typeof id_tipologia_immobile !== "number" ||
    id_tipologia_immobile < 1 ||
    id_tipologia_immobile > 100
  ) {
    return {
      status: "KO",
      message: "Invalid field: id_tipologia_immobile",
      validation_details: "id_tipologia_immobile must be a number.",
    };
  }

  // VALIDATION - MQ
  if (!mq || mq == null || typeof mq !== "number" || mq < 1 || mq > 50000) {
    return {
      status: "KO",
      message: "Invalid field: mq",
      validation_details: "mq must be a number between 1 and 50000.",
    };
  }

  // END OF VALIDATION
  return null;
}
