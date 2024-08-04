const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host     : process.env.DB_URL,
  user     : process.env.DB_USER,
  password : process.env.DB_PASSWORD,
  database : process.env.DB
});

module.exports = connection;