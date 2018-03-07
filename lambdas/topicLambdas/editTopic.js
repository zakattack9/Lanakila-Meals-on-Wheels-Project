'use strict';

var AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';
var sns = new AWS.SNS();

module.exports.listTopics = (event, context, callback) => {
	const htmlParams = JSON.parse(event.body);
	var params = {
		AttributeName: 'DisplayName',
	  	TopicArn: 'arn',
	  	AttributeValue: htmlParams.newTopicName
	};
	const response = {};
	sns.setTopicAttributes(params, function(err, data) {
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
