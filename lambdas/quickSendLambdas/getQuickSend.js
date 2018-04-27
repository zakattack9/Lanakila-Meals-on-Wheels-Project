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

module.exports.getQuickSend = (event, context, callback) => {
  let getQSmsgs = "SELECT * FROM " + table[4] + " ORDER BY id;";
  Client.connect() 
    .then(client => {
      client.release();
      return client.query(getQSmsgs);
    })
    .then(res => {
      console.log(res)
      const response = {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
          "Access-Control-Allow-Methods" : "*"
        },
        body: JSON.stringify(res.rows)
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