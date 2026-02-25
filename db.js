const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'data', // ← replace with your real MySQL password
  database: 'indiakart',
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool.promise();