const AWS = require('aws-sdk');
AWS.config.update({region: 'us-west-2'});
const short = require('short-uuid');
const translator = short();
 
// Generate a shortened v4 UUID 
let genID = translator.new();
console.log(genID);

module.exports.addSub = (event, context, callback) => {

}
	// let grpID; //generated ID
	// ( function () { grpID = Math.random().toString(36).substr(2, 5) }() ); //self-invoking function generates ID
	// console.log(grpID);

	// // Create the DynamoDB item
	// const dynamoDB = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-10-08'});

	// let params = {
	//   TableName: 'lanakilaGroups',
	//   Item: {
	//   	'id' : grpID,
	//     'topic_name' : 'Elderlies',
	//     'date_created' : 'March 7, 2018',
	//     'topic_arn' : 'Processing'
	//   }
	// };

	// // Call DynamoDB to add the item to the table
	// dynamoDB.put(params, function(err, data) {
	//   if (err) {
	//     console.log("Error", err);
	//   } else {
	//     console.log("Success", data);
	//   }
	// });
let eventID = 'm7ufTVcFvsT84tfwz3gw6N';

const dynamoDB = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-10-08'});
const sns = new AWS.SNS({apiVersion: '2010-03-31'});

var params = {
  Protocol: 'sms', /* required */
  TopicArn: 'arn:aws:sns:us-west-2:116598778905:phone_numbers', /* required */
  Endpoint: '18084222222'
};

sns.subscribe(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});

// dynamoDB.get({ 
//   TableName: 'lanakilaGroups',
//   Key: { 'id' : eventID }
// }, function(err, data) {
//   if (err) {
//     console.log("Error", err);
//   } else {
//     console.log("Success", data.Item);
//     console.log("Text to be converted: ", data.Item.topic_arn);

    
//   }
// })