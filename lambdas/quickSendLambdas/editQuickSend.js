'use strict';

const Pool = require('pg-pool');
const config = require('../config.json');
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
  let updateText = "UPDATE " + table[4] + " SET message_text = $1 WHERE id = $2;";
  let updateType = "UPDATE " + table[4] + " SET message_type = $1, message_text = $2 WHERE id = $3;";

  Client.connect() //connect to database
    .then(client => {
      client.release();
      return client.query(updateText);
    })
  Client.connect() //connect to database
    .then(client => {
      client.release();
      return client.query(updateType);
    })
};