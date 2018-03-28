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

module.exports.deleteTopic = (event, context, callback) => {
  //console.log("event", event.body)
  let id = JSON.parse(event.body)
  //console.log('ID', id);
  let convertedArray = "(" + JSON.stringify(id).slice(1, -1) + ")";
  //console.log('convertedArray', convertedArray);

  let deleteTopics = "DELETE FROM " + table[0] + " WHERE id IN " + convertedArray + ";";
  let getTopicArns = "SELECT topic_arn FROM " + table[0] + " WHERE id IN " + convertedArray + ";";
  
  Client.connect() //connect to database
    .then(client => {
      console.log('connected to DB ' + Client.options.database + ' ready to grab Topic ARNs')
      client.release();
      return client.query(getTopicArns);
    })
    .then(res => {
  		const sns = new AWS.SNS({apiVersion: '2010-03-31'});

			for (var i = 0; i < res.rows.length; i++) {
				var params = {
					TopicArn: res.rows[i].topic_arn
				};
				console.log("params topic", params.TopicArn);

				sns.deleteTopic(params, function(err, data) {
					if (err){ 
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
			      const response = {
			        statusCode: 200,
			        headers: {
			          "Access-Control-Allow-Origin": "*",
			          "Access-Control-Allow-Credentials": true
			        },
			        body: JSON.stringify(data)
			      }
			      callback(null, response);
				  }
				})
			}

			Client.connect() //removes items from DB
		    .then(client => {
		      console.log('connected to DB ' + Client.options.database + ' ready to grab Topic ARNs')
		      client.release();
		      return client.query(deleteTopics);
		    })
    })
    .catch(err => {
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




