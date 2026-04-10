const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root', 
    password: 'senacrs',    
    database: 'gragas'
});

module.exports = pool;