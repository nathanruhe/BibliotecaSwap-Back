const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: process.env.DB_HOST || "bibliotecaswap.cpay0ae8mv8r.eu-west-3.rds.amazonaws.com",
    user: process.env.DB_USER || "swap",
    password: process.env.DB_PASSWORD || "C0d3n0tc#", 
    database: process.env.DB_NAME || "bibliotecaswap", 
    port: process.env.DB_PORT || 3306,
    connectionLimit: 10,
});

console.log("Conexión con la BBDD Creada");

module.exports = {pool};
