'use strict';

const AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';
const Pool = require('pg-pool'); //require in pg-pool packages
const config = require('../config.json');
const {host, database, table, user, password, port, idleTimeoutMillis} = config; //object destructuring
const Client = new Pool ({ //creating template
  host,
  database,
  user,
  password,
  port,
  idleTimeoutMillis : 1000
});

module.exports.createTopic = (event, context, callback) => {
  console.log("event", event.body);
  let groupName = JSON.parse(event.body);
  console.log("group name:", groupName);

	var sns = new AWS.SNS({apiVersion: '2010-03-31'});
	var params = {
  	Name: groupName.replace(/ /g, '_') //removes space from topic name and replaces them with underscores so SNS does not run into errors, however it is stored in the database with spaces
	};

	sns.createTopic(params, function(err, data) {
		if (err){ 
			console.log(err);
			const response = {
				statusCode: 100,
		    headers: {
		      "Access-Control-Allow-Origin":  "*",
		      "Access-Control-Allow-Credentials": true
		    },
				body: JSON.stringify(err),
			};
			callback(null, response);
		}else{
			console.log(data.TopicArn);

		  let createGroup = "INSERT INTO " + table[0] + " VALUES(default, $1, $2, current_timestamp);";

		  Client.connect() //connect to database
		    .then(client => {
		      console.log('connected to DB ' + Client.options.database + ' ready to POST')
		      client.release();
		      return client.query(createGroup, [data.TopicArn, groupName]);
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

		}
	});
};