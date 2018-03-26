'use strict';

var AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';
const Pool = require('pg-pool'); //require in pg-pool packages
const config = require('../config.json');
const {host, database, table, user, password, port, idleTimeoutMillis} = config; //object destructuring
const Client = new Pool ({ //creating template
  host,
  database,
  user,
  password,
  port,
  idleTimeoutMillis : 1000
});

module.exports.deleteSub = (event, context, callback) => {
  console.log("event", event.body)
  let id = JSON.parse(event.body)
  console.log('ID', id);
  let convertedArray = "(" + JSON.stringify(id).slice(1, -1) + ")";
  console.log('convertedArray', convertedArray);

  let getSubArns = "SELECT subscription_arn FROM " + table[2] + " WHERE subscriber_id IN " + convertedArray + ";";
  let deleteSubsGrps = "DELETE FROM " + table[2] + " WHERE subscriber_id IN " + convertedArray + ";"; //deletes from subs and groups table
  let deleteSubs = "DELETE FROM " + table[1] + " WHERE id IN " + convertedArray + ";"; //deletes sub from subs table
  
  Client.connect() //connect to database
    .then(client => {
      console.log('connected to DB ' + Client.options.database + ' ready to grab Subscriber ARNs')
      client.release();
      return client.query(getSubArns);
    })
    .then(res => {
    	console.log(res);
  		const sns = new AWS.SNS({apiVersion: '2010-03-31'});

			for (var i = 0; i < res.rows.length; i++) {
				var params = {
					SubscriptionArn: res.rows[i].subscription_arn
				};
				console.log("params topic", params.TopicArn);

				sns.unsubscribe(params, function(err, data) {
					if (err){ //error if couldn't unsubscribe users
						const response = {
			        statusCode: 500,
			        headers: {
			          "Access-Control-Allow-Origin": "*",
			          "Access-Control-Allow-Credentials": true,
			        },
			        body: JSON.stringify(err.stack)
			      }
			      callback(null, response);
					}
					else{
			      console.log(data);
				  }
				})
			}

			Client.connect() //removes items from DB
		    .then(client => {
		      console.log('connected to DB ' + Client.options.database + ' ready to delete subscribers from groups')
		      client.release();
		      return client.query(deleteSubsGrps);
		    })
		    .then(res => {
		      Client.connect() //removes items from DB
				    .then(client => {
				      console.log('connected to DB ' + Client.options.database + ' ready to remove subscriber from table')
				      client.release();
				      return client.query(deleteSubs);
				    })
				    .then(res => {
				    	const response = {
				        statusCode: 200,
				        headers: {
				          "Access-Control-Allow-Origin": "*",
				          "Access-Control-Allow-Credentials": true
				        },
				        body: JSON.stringify(res)
				      }
				      callback(null, response);
				    })
				    .catch(err => { //error if couldn't delete from subs
				      const response = {
				        statusCode: 500,
				        headers: {
				          "Access-Control-Allow-Origin": "*",
				          "Access-Control-Allow-Credentials": true
				        },
				        body: JSON.stringify(err.stack)
				      }
				      callback(null, response);
				    })
		    })
		    .catch(err => { //error if couldn't delete from groups and subscribers DB
		      console.log(err.stack);
		      const response = {
		        statusCode: 500,
		        headers: {
		          "Access-Control-Allow-Origin": "*",
		          "Access-Control-Allow-Credentials": true
		        },
		        body: JSON.stringify(err.stack)
		      }
		      callback(null, response);
		    })
    })
    .catch(err => { //error if couldn't grab subscription arns
      console.log(err.stack);
      const response = {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true
        },
        body: JSON.stringify(err.stack)
      }
      callback(null, response);
    })
};



