'use strict';

const Pool = require('pg-pool');
const config = require('./config.json');
const {host, database, table, user, password, port, idleTimeoutMillis} = config;
const Client = new Pool ({
  host,
  database,
  user,
  password,
  port,
  idleTimeoutMillis : 1000
});

module.exports.editQuickSend = (event, context, callback) => {
  let parseBody = JSON.parse(event.body)
  let {oldContent, newContent} = parseBody;
  let updateText = `UPDATE quicksend SET message_text = '${newContent.text}' WHERE message_text = '${oldContent.text}';`
  let updateType = `UPDATE quicksend SET message_type = '${newContent.type}' WHERE message_type = '${oldContent.type}';`

  Client.connect() //connect to database
    .then(client => {
      console.log('connected to DB ' + Client.options.database + ' ready to UPDATE')
      client.release();
      return client.query(updateMovies, [title, year, genre, id]);
    })
};