'use strict';

var AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';
var sns = new AWS.SNS();

module.exports.createTopic = (event, context, callback) => {
	let msgID; //generated ID
	( function () { msgID = Math.random().toString(36).substr(2, 5) }() ); //self-invoking function generates ID
	console.log(msgID);

	// Create the DynamoDB item
	const dynamoDB = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-10-08'});


	const htmlParams = JSON.parse(event.body);
	var params = {
		Name: htmlParams.name
	};
	sns.createTopic(params, function(err, data) {
		if (err){ 
			const response = {
				statusCode: 100,
			    headers: {
			      "Access-Control-Allow-Origin":  "*",
			      "Access-Control-Allow-Credentials": true
			    },
				body: JSON.stringify({
					message: (err, err.stack),
					input: event,
				}),
			};
			callback(null, response);
		}
		else{
			let params = {
				  TableName: 'TopicList',
				  Item: {
				  	'id' : msgID,
				    'arn' : data.TopicArn,
				    'name' : htmlParams.name
				  }
				};

				// Call DynamoDB to add the item to the table
				dynamoDB.put(params, function(dberr, dbdata) {
				  if (err) {
				    console.log("Error", dberr);
				  } else {
				    console.log("Success", dbdata);
				  }
				});
			const response = {
				statusCode: 200,
				headers: {
			      "Access-Control-Allow-Origin":  "*",
			      "Access-Control-Allow-Credentials": true
			    },
				body: JSON.stringify({
					message: data,
					input: event,
				}),
			};
			callback(null, response);
	    }
	})
};
/*
var AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';
var sns = new AWS.SNS();
var params = {
		Name: "testingf"
	};
sns.createTopic(params, function(err, data) {
		if (err){ 
			console.log(err)
		}
		else{
			console.log(data.TopicArn)
		}
	});*/