const AWS = require('aws-sdk');
AWS.config.update({region: 'us-west-2'});

module.exports.hello = (event, context, callback) => {
	let msgID = event["Records"][0]["Sns"]["Message"]; //grabs message ID from lambda

	const dynamoDB = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-10-08'});

	// Call DynamoDB to read the item from the table
	dynamoDB.get({ 
	  TableName: 'lanakilaPosts',
	  Key: { 'id' : msgID }
	}, function(err, data) {
	  if (err) {
	    console.log("Error", err);
	  } else {
	    console.log("Success", data.Item);
	  }
	});

	// Create an Polly client
	const polly = new AWS.Polly({apiVersion: '2016-06-10'});
	const s3 = new AWS.S3({apiVersion: '2006-03-01'}); // s3 client

	let params = {
    Text: 'I am text converted by Polly',
    OutputFormat: 'mp3',
    VoiceId: 'Kimberly'
	};

	polly.synthesizeSpeech(params, (err, data) => { // Convert Text
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
        }
      });
    }
	})



}