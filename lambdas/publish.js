var AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';
var sns = new AWS.SNS();
var config = require('./config.json');

var params = {
  Message: "enter Message here",
  MessageStructure: 'string',
  TopicArn: config.arn
};

sns.publish(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});
