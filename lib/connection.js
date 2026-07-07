require("dotenv").config();
const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    ca: process.env.DB_CA_CERT,
  },
});

connection.connect((err) => {
  if (err) {
    console.error("error connecting to your database:", err.stack);
    return;
  }
  console.log("connection to database successful");
});

module.exports = connection;
