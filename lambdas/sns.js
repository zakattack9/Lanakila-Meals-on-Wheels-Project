var AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';
var sns = new AWS.SNS();

var params = {
  Message: "I got SNS to work :D",
  MessageStructure: 'string',
  PhoneNumber: '+1808xxxxxxx'
};

sns.publish(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});