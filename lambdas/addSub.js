var AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';
var sns = new AWS.SNS();

var params = {
  Protocol: 'sms',
  TopicArn: 'arn:aws:sns:us-west-2:110504385597:lanakila-messages', 
  Endpoint: '+18085417092'
};
sns.subscribe(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});