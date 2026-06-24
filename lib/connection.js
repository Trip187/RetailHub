const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "127.0.0.1",
  port: 3306,
  user: "root",
  password: "Chelsea728887",
  database: "mydb",
});

connection.connect((err) => {
  if (err) {
    console.error("error connecting to your database:", err.stack);
  }
  console.log("connection to database successful");
});
module.exports = connection;