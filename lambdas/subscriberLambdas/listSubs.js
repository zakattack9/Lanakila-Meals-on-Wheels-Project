'use strict';

var AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';
var sns = new AWS.SNS();

module.exports.listSubs = (event, context, callback) => {
	var params = {};
	sns.listSubscriptions(params, function(err, data) {
		if (err){ 
			const response = {
				statusCode: 500,
				headers: {
			      "Access-Control-Allow-Origin":  "*",
			      "Access-Control-Allow-Credentials": true
			    },
				body: err, err.stack
			};
			callback(null, response);
		}
		else{
			const response = {
				statusCode: 200,
				headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
          "Access-Control-Allow-Methods" : "*"
        },
				body: data
			};
			callback(null, response);
	    }
	})
 
};
