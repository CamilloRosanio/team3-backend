// DICHIARAZIONE INIT EXPRESS
const express = require("express");
const app = express();


// IMPORT ENV + DEFAULT
const { APP_HOST, APP_PORT, CORS_PORT } = process.env;

const config = {
    APP_HOST: APP_HOST || "http://localhost",
    APP_PORT: APP_PORT || "3000",
    CORS_PORT: CORS_PORT || "5173",
};


// REGISTERING CORS
const cors = require("cors");
const corsOptions = {
    origin: `${config.APP_HOST}:${config.CORS_PORT}`,
    optionSuccessStatus: 200,
};


// REGISTERING MIDDLEWARES
app.use(express.json());
app.use(express.static("public"));
app.use(cors(corsOptions));


// REGISTERING ROUTES
const immobiliRouter = require("./routers/immobiliRouter");
app.use("/api/immobili", immobiliRouter);
const recensioniRouter = require("./routers/recensioniRouter");
app.use("/api/recensioni", recensioniRouter);
const tipologieImmobileRouter = require("./routers/tipologieImmobileRouter");
app.use("/api/tipologie-immobile", tipologieImmobileRouter);


// ERROR HANDLERS
const errorsHandler = require("./middlewares/errorsHandler");
app.use(errorsHandler);
const notFound = require("./middlewares/notFound");
app.use(notFound);


// SERVER LISTENING
app.listen(config.APP_PORT, () => {
    console.log(`Server listening at: ${config.APP_HOST}:${config.APP_PORT}`);
});
