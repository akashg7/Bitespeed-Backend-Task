require('dotenv').config();

const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,       
  user: process.env.DB_USER,      
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME,  
  port: process.env.DB_PORT         
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database.');
});





// require('dotenv').config();
// const mysql = require('mysql2/promise');

// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT,
//   waitForConnections: true,
//   connectionLimit: 10, // Adjust as needed
//   queueLimit: 0,
// });

// module.exports = pool;
