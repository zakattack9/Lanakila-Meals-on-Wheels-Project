'use strict';

var AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';
const sns = new AWS.SNS({apiVersion: '2010-03-31'});
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

module.exports.broadcast = (event, context, callback) => {
	let parseEvent = JSON.parse(event.body);
	let grpID = parseEvent[0];
	let msgText = parseEvent[1];
	let msgID = parseEvent[2];

	console.log(parseEvent, grpID, msgText, msgID);

	let getTopicARN = "SELECT topic_arn FROM " + table[0] + " WHERE id = $1;";

	Client.connect()
    .then(client => {
      client.release();
      return client.query(getTopicARN, [grpID]);
    })
    .then(res => {
      //console.log(res.rows);
      let topicARN = res.rows[0].topic_arn;
      console.log(topicARN);

      let fileLink = "SELECT converted_text_link FROM " + table[3] + " WHERE id = $1;";

      Client.connect()
		    .then(client => {
		      client.release();
		      return client.query(fileLink, [msgID]);
		    })
		    .then(res => {
		    	console.log(res.rows)
		    	let audioFileLink = res.rows[0].converted_text_link
		    	console.log(audioFileLink);

		    	// Send Notification out with SNS
					let snsparams = {
					  Message: msgText + "\n" + "Here is a link to an audio version of this message: " + audioFileLink,
					  MessageStructure: 'string',
					  TopicArn: topicARN
					};

					sns.publish(snsparams, function(err, data) {
					  if (err) {
					  	console.log("Error", err.stack); 
					  } else {
					  	console.log("Success", data);
				      
				      const response = {
				        statusCode: 200,
				        headers: {
				          "Access-Control-Allow-Origin": "*",
				          "Access-Control-Allow-Credentials": true,
				        },
				        body: JSON.stringify(data)
				      }
				      callback(null, response);
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
}