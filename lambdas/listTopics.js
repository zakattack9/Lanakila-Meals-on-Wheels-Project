'use strict';

var AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';
var sns = new AWS.SNS();

module.exports.listTopics = (event, context, callback) => {
	var params = {};
	const response = {};
	sns.listTopics(params, function(err, data) {
		if (err){ 
			response = {
				statusCode: 200,
				body: JSON.stringify({
					message: (err, err.stack),
					input: event,
				}),
			};
		}
		else{
			response = {
				statusCode: 200,
				body: JSON.stringify({
					message: data,
					input: event,
				}),
			};
	    }
	})
  callback(null, response);
};
