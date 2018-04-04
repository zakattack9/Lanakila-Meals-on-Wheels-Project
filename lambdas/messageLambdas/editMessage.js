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
module.exports.editMessage = (event, context, callback) => {
  console.log("event", event.body);
  let messageText = JSON.parse(event.body);
  let newMsgText = messageText[0];
  let oldMsgText = messageText[1];
  console.log("messageText:", messageText);
  console.log(newMsgText, oldMsgText)

  let editMsg = "UPDATE " + table[3] + " SET message_text = $1 WHERE message_text = $2;"; //replace old message with new message

  Client.connect() //connect to database
    .then(client => {
      client.release();
      return client.query(editMsg, [newMsgText, oldMsgText]);
    })
    .then(res => {
      const response = {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify(res)
      }
      callback(null, response);
    })
    .catch(err => {
      console.log(err.stack);
      const response = {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify(err.stack)
      }
      callback(null, response);
    })
};