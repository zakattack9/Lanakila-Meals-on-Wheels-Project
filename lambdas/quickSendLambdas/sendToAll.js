'use strict';
var AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';
var sns = new AWS.SNS();

const Pool = require('pg-pool'); //require in pg-pool packages
const config = require('./config.json');
const {host, database, table, user, password, port, idleTimeoutMillis} = config; //object destructuring
const Client = new Pool ({ //creating template
  host,
  database,
  user,
  password,
  port,
  idleTimeoutMillis : 1000
});

module.exports.sendToAll = (event, context, callback) => {
  	let grabArnRow = "SELECT * FROM ${table} WHERE group_name = 'Everyone';";
	Client.connect() //connect to database
    .then(client => {
      	client.release();
   		return client.query(grabArnRow);
    })
    .then(res => {
    	var params = {
		  	Message: event, /* required */
		  	TopicArn: res.topic_arn
		};
		sns.publish(params, function(err, data) {
		  	if (err) console.log(err, err.stack); // an error occurred
		  	else     console.log(data);           // successful response
		});
    })
};