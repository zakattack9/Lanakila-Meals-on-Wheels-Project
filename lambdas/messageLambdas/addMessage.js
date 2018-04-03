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

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-west-2'});
const sns = new AWS.SNS({apiVersion: '2010-03-31'});

module.exports.addMessage = (event, context, callback) => {
  console.log("event", event.body);
  let messageText = JSON.parse(event.body);
  console.log("messageText:", messageText);

  let addMsg = "INSERT INTO " + table[3] + " VALUES(default, $1, current_timestamp) RETURNING id;"
  
  Client.connect()
    .then(client => {
      client.release();
      return client.query(addMsg, [messageText]);
    })
    .then(res => {
      console.log(res.rows)
      let msgID = res.rows[0].id;

      console.log(msgID);
      sns.publish({ // send notification to sns
        TopicArn: 'arn:aws:sns:us-west-2:116598778905:new_posts',
        Message: JSON.stringify([msgID, messageText]),
      }, function(err, data) {
        if (err) {
          console.log(err.stack);
        }else {
          console.log(data);
        }
      });

      const response = {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify(msgID)
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