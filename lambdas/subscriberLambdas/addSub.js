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

const sns = new AWS.SNS({apiVersion: '2010-03-31'});

module.exports.addSub = (event, context, callback) => {
	console.log("event", event.body);
	let {subName, subProtocol, subContact, groupID} = JSON.parse(event.body); //must parse
	console.log(subName, subProtocol, subContact, groupID);
	let subID;

	// adds subscriber into subscribers table
	let createSub = "INSERT INTO " + table[1] + " VALUES(default, $1, $2, $3) RETURNING sub_id;"; // returns id of newly inserted row
  Client.connect() 
    .then(client => {
      console.log('connected to DB ' + Client.options.database + ' ready to POST')
      client.release();
      return client.query(createSub, [subName, subProtocol, subContact]);
    })
    .then(res => {
    	subID = res.rows[0].sub_id; //sets subsID to id of newly created subscriber in table

    	const response = { // updates client
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify(res)
      }
      callback(null, response);
    })
    .catch(err => { // error if subscriber table is not updated
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


  // grabs topics arns of "Everyone" and group selected
  let getTopicARNs = "SELECT topic_arn FROM " + table[0] + " WHERE id IN (43, " + groupID + ");";
  Client.connect() //connect to database
    .then(client => {
      console.log('connected to DB ' + Client.options.database + ' ready to POST')
      client.release();
      return client.query(getTopicARNs);
    })
    .then(res => {
    	let insertSubGroup = "INSERT INTO " + table[2] + " VALUES($1, $2, $3);";

    	// subscribes user to "Everyone" group
			var everyoneParams = { 
			  Protocol: subProtocol,
			  TopicArn: res.rows[0].topic_arn, // rows[0] should always be "Everyone" topic ARN
			  Endpoint: subContact
			};

			sns.subscribe(everyoneParams, function(err, data) {
			  if(err) {
			  	console.log(err, err.stack);
			  }
			  else {
			  	console.log("Everyone SUB ARN", data.SubscriptionArn);

			  	Client.connect()
				    .then(client => {
				      console.log('connected to DB ' + Client.options.database + ' ready to POST')
				      client.release();
				      return client.query(insertSubGroup, [43, subID, data.SubscriptionArn]);
				    })
				    .then(res => {
				    	console.log(res)
				    })
				    .catch(err => { // error if could not be subscribed to "Everyone" group
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

			// subscribes user to selected group
			var groupParams = { // subscribes to selected group
			  Protocol: subProtocol,
			  TopicArn: res.rows[1].topic_arn, // rows[1] should always be the group passed in
			  Endpoint: subContact
			};

			sns.subscribe(groupParams, function(err, data) {
			  if(err) {
			  	console.log(err, err.stack);
			  }
			  else {
			  	Client.connect()
				    .then(client => {
				      console.log('connected to DB ' + Client.options.database + ' ready to POST')
				      client.release();
				      return client.query(insertSubGroup, [+groupID, subID, data.SubscriptionArn]);
				    })
				    .then(res => {
				    	console.log(res)
				    })
				    .catch(err => { // error if could not be subscribed to selected group
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

    })
    .catch(err => { // error if topic arns can't be retrieved
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

