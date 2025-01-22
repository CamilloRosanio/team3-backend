// DICHIARAZIONE MYSQL2 PACK
const mysql = require('mysql2');


// IMPORT ENV + DEFAULT
const { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD } = process.env;

const configDB = {
    DB_HOST: DB_HOST || 'localhost',
    DB_NAME: DB_NAME || 'booldb',
    DB_USER: DB_USER || 'root',
    DB_PASSWORD: DB_PASSWORD || 'password',
};


// DICHIARAZIONE DB CONNECTION
const connection = mysql.createConnection({
    host: configDB.DB_HOST,
    database: configDB.DB_NAME,
    user: configDB.DB_USER,
    password: configDB.DB_PASSWORD
});


// CONNECTION ERROR HANDLER
connection.connect((err) => {
    if (err) throw err;
    console.log(`Connected to MySQL DB: [${configDB.DB_NAME}]`)
});


// EXPORT CONNECTION
module.exports = connection;