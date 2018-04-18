'use strict';

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-west-2'});
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

const sns = new AWS.SNS({apiVersion: '2010-03-31'});

module.exports.editQuickSend = (event, context, callback) => {
  console.log("event", event.body);
  let messageText = JSON.parse(event.body);
  let newMsgText = messageText[0];
  let oldMsgText = messageText[1];

  let newMsgType = newMsgText.type;
  let newMsg = newMsgText.text;
  let oldMsg = oldMsgText.text;
  console.log(newMsgType, newMsg, oldMsg)

  let editMsg = "UPDATE " + table[4] + " SET message_type = $1, message_text= $2 WHERE message_text = $3;"; //replace old message with new message

  Client.connect() //connect to database
    .then(client => {
      client.release();
      return client.query(editMsg, [newMsgType, newMsg, oldMsg]);
    })
    .then(res => {
      console.log(res);
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