'use strict';

var AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';
var sns = new AWS.SNS();

module.exports.createTopic = (event, context, callback) => {
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
