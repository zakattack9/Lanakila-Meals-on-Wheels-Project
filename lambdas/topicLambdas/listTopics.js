'use strict';

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

module.exports.listTopics = (event, context, callback) => {
	let listGroups = "SELECT id, group_name, date_created FROM " + table[0] + " ORDER BY id ASC;";

  Client.connect() //connect to database
    .then(client => {
      console.log('connected to DB ' + Client.options.database + ' ready to GET')
      client.release();
      return client.query(listGroups);
    })
    .then(res => {
    	console.log(res)
      const response = {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
          "Access-Control-Allow-Methods" : "*"
        },
        body: JSON.stringify(res.rows)
      }
      callback(null, response);
    })
    .catch(err => {
      console.log("error", err.stack);
      const response = {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify(err.stack)
      }
      callback(null, response);
    })
};

	// var params = {};
	// sns.listTopics(params, function(err, data) {
	// 	if (err){ 
	// 		const response = {
	// 			statusCode: 500,
	// 			headers: {
	// 		      "Access-Control-Allow-Origin":  "*",
	// 		      "Access-Control-Allow-Credentials": true
	// 		    },
	// 			body: {
	// 				message: (err, err.stack),
	// 				input: event,
	// 			},
	// 		};
	// 		callback(null, response);
	// 	}
	// 	else{
	// 		const response = {
	// 			statusCode: 200,
	// 			headers: {
 //          "Access-Control-Allow-Origin": "*",
 //          "Access-Control-Allow-Credentials": true,
 //          "Access-Control-Allow-Methods" : "*"
 //        },
	// 			body: {
	// 				message: data.Topics,
	// 				input: event,
	// 			},
	// 		};
	// 		callback(null, response);
	//     }
	// })
