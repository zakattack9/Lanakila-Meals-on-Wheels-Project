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

const dynamoDB = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-10-08'});
const polly = new AWS.Polly({apiVersion: '2016-06-10'});
const s3 = new AWS.S3({apiVersion: '2006-03-01'});
const sns = new AWS.SNS({apiVersion: '2010-03-31'});

module.exports.convertToAudio = (event, context, callback) => {
	let eventValues = JSON.parse(event["Records"][0]["Sns"]["Message"]); //grabs message text from lambda
	let msgText = eventValues[1];
	let msgID = eventValues[0];
	console.log(msgText);
	console.log(msgID);

  let pollyParams = {
    Text: msgText,
    OutputFormat: 'mp3',
    VoiceId: 'Kimberly'
	};

	polly.synthesizeSpeech(pollyParams, (err, data) => { // Convert Text to Audio
    if (err) {
      console.log(err.code)
    } else if (data) {
    	let s3params = {
        Bucket: 'audiofileslanakila', 
        Body: data.AudioStream, 
        Key: msgID + ".mp3",
        ACL: "public-read"
      };

      s3.upload(s3params, function(err, data) { // Upload to S3 Bucket
        if (err) {
          console.log("Error", err.message);
        } else {    
          console.log("Upload Success", data.Location);

          let updateLink = "UPDATE " + table[3] + " SET converted_text_link = $1 WHERE id = $2;"
          Client.connect()
				    .then(client => { // updated table with link to stored converted text-to-audio file
				      client.release();
				      return client.query(updateLink, [data.Location, msgID]);
				    })
				    .then(res => {
				    	console.log("SUCCESS", res)

				    })
				    .catch(err => {
				      console.log(err.stack);

				    })
        }

      });
    }
	}) 
}