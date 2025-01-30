const { use } = require('express/lib/router');
const path = require('path'); 

module.exports = {

  development: {
    client: 'sqlite3',
    connection: {
      filename: path.resolve(__dirname, 'src', 'database', 'sqlite', 'database.db')
    },
    useNullAsDefault: true
  },
};

