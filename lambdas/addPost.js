const AWS = require('aws-sdk');
//npm install uuid
const uuid = require('uuid'); //used for unique user ID (replace current ID generator with this)
AWS.config.update({region: 'us-west-2'});

module.exports.hello = (event, context, callback) => {
	let msgID; //generated ID
	( function () { msgID = Math.random().toString(36).substr(2, 5) }() ); //self-invoking function generates ID
	console.log(msgID);

	// Create the DynamoDB item
	const dynamoDB = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-10-08'});

	let params = {
	  TableName: 'lanakilaPosts',
	  Item: {
	  	'id' : msgID,
	    'msg_date' : '5',
	    'msg_text' : 'I am text converted by Polly!',
	    'msg_link' : 'Processing'
	  }
	};

	// Call DynamoDB to add the item to the table
	dynamoDB.put(params, function(err, data) {
	  if (err) {
	    console.log("Error", err);
	  } else {
	    console.log("Success", data);
	  }
	});

	const sns = new AWS.SNS({apiVersion: '2010-03-31'});

	sns.publish({ // send notification to sns
    TopicArn: 'put topic arn that trigers to conversion lambda',
    Message: msgID,
  }, function(err, data) {
    if (err) {
      console.log(err.stack);
    }
  });
}