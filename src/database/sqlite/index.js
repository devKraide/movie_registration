const sqlite3 = require("sqlite3");
//driver para sqlite = versão 
const sqlite = require("sqlite");
//sqlite.open = abre a conexão com o banco de dados
const path = require("path");


async function sqliteConnection(){
  const database = await sqlite.open({
    filename: path.resolve(__dirname,  "..", "database.db"),
    driver: sqlite3.Database
  });

  return database;
}

module.exports = sqliteConnection;