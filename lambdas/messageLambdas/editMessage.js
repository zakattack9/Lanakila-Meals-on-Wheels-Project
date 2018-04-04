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

const s3 = new AWS.S3({apiVersion: '2006-03-01'});
const sns = new AWS.SNS({apiVersion: '2010-03-31'});

module.exports.editMessage = (event, context, callback) => {
  console.log("event", event.body);
  let messageText = JSON.parse(event.body);
  let newMsgText = messageText[0];
  let oldMsgText = messageText[1];
  let editedMsgID = messageText[2];
  console.log(newMsgText, oldMsgText, editedMsgID)

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

      let msgIDobj = {};
      msgIDobj.Key = editedMsgID + ".mp3";
      var params = {
        Bucket: "audiofileslanakila", 
        Delete: {
          Objects: [msgIDobj], 
          Quiet: false
        }
      };
      s3.deleteObjects(params, function(err, data) {
        if (err) {
          console.log(err, err.stack);
        }else {
          console.log(data);
        }
      });

      sns.publish({ // send notification to get new edited message converted
        TopicArn: 'arn:aws:sns:us-west-2:116598778905:new_posts',
        Message: JSON.stringify([editedMsgID, newMsgText]),
      }, function(err, data) {
        if (err) {
          console.log(err.stack);
        }else {
          console.log(data);
        }
      });

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