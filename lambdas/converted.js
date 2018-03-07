const AWS = require('aws-sdk');
AWS.config.update({region: 'us-west-2'});

module.exports.triggered = (event, context, callback) => {
	let msgID = event["Records"][0]["Sns"]["Message"]; //grabs message ID from lambda

	const dynamoDB = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-10-08'});
	const polly = new AWS.Polly({apiVersion: '2016-06-10'});
	const s3 = new AWS.S3({apiVersion: '2006-03-01'});
	const sns = new AWS.SNS({apiVersion: '2010-03-31'});

	// Call DynamoDB to read the item from the table
	dynamoDB.get({ 
	  TableName: 'lanakilaPosts',
	  Key: { 'id' : msgID }
	}, function(err, data) {
	  if (err) {
	    console.log("Error", err);
	  } else {
	    console.log("Success", data.Item);
	    console.log("Text to be converted: ", data.Item.msg_text);

    	let pollyparams = {
		    Text: data.Item.msg_text,
		    OutputFormat: 'mp3',
		    VoiceId: 'Kimberly'
			};

			polly.synthesizeSpeech(pollyparams, (err, data) => { // Convert Text
		    if (err) {
		      console.log(err.code)
		    } else if (data) {
		    	let s3params = {
		        Bucket: 'audiofileslanakila', 
		        Body: data.AudioStream, 
		        Key: msgID + ".mp3",
		        ACL: "public-read"
		      };

		      s3.upload(s3params, function(err, data) { // Upload to S3 Bucket
		        if (err) {
		          console.log("Error", err.message);
		        } else {    
		          console.log("Upload Success", data.Location);
		          // Update DynamoDB with new link from s3
							let dynamoDBparams = {
							  TableName: 'lanakilaPosts',
							  Key: { 'id' : msgID },
							  UpdateExpression: 'SET msg_link = :s',
							  ExpressionAttributeValues: { // prevents SQL injection
							    ':s' : data.Location
							  }
							};

							dynamoDB.update(dynamoDBparams, function(err, data) {
							  if (err) {
							    console.log("Error", err);
							  } else {
							    console.log("Successfully updated DB", data);
							  }
							});

							// Send Notification out with SNS
							let snsparams = {
							  Message: "Here is a link to an audio file " + data.Location,
							  MessageStructure: 'string',
							  TopicArn: 'insert ARN here'
							};

							sns.publish(snsparams, function(err, data) {
							  if (err) {
							  	console.log("Error", err.stack); 
							  } else {
							  	console.log("Success", data);
							  } 
							});
		        }
		      });
		    }
			})    
	  }
	});
}