const { use } = require('express/lib/router');
const path = require('path'); 

module.exports = {

  development: {
    client: 'sqlite3',
    connection: {
      filename: path.resolve(__dirname, 'src', 'database', 'database.db')
    },
    pool: { 
      afterCreate: (conn, cb) => conn.run('PRAGMA foreign_keys = ON', cb)}, // enable the foreign key = enable the exclusion in cascades
    migrations: {
      directory: path.resolve(__dirname, 'src', 'database', 'knex', 'migrations')
    },
    useNullAsDefault: true
  },
};

