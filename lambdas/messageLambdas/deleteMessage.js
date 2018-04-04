'use strict';

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-west-2'});
const Pool = require('pg-pool');
const config = require('../config.json');
const {host, database, table, user, password, port, idleTimeoutMillis} = config
const Client = new Pool ({
  host,
  database,
  user,
  password,
  port,
  idleTimeoutMillis : 1000
});

const s3 = new AWS.S3({apiVersion: '2006-03-01'});

module.exports.deleteMessage = (event, context, callback) => {
  let messageIDs = JSON.parse(event.body);
  let convertedArray = "(" + JSON.stringify(messageIDs).slice(1, -1) + ")";
  console.log(convertedArray);

  let deleteMsg = "DELETE FROM " + table[3] + " WHERE id IN " + convertedArray + ";"
  
  Client.connect() 
    .then(client => {
      client.release();
      return client.query(deleteMsg);
    })
    .then(res => {
      //converts id's to object array for s3 params
      let objectArray = [];
      messageIDs.map(currVal => {
        let objKey = {};
        objKey.Key = currVal + ".mp3";
        objectArray.push(objKey);
      })
      console.log(objectArray);
      
      var params = {
        Bucket: "audiofileslanakila", 
        Delete: {
          Objects: objectArray, 
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

      const response = {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true
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
          "Access-Control-Allow-Credentials": true
        },
        body: JSON.stringify(err.stack)
      }
      callback(null, response);
    })
};