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

module.exports.listSubs = (event, context, callback) => {
	// sorting by descending id numbers will result in recently added subscribers at the top of the list
	let listSubscribers = "SELECT id, subscription_name, subscription_endpoint, subscription_contact FROM " + table[1] + " ORDER BY id DESC;";

  Client.connect() //connect to database
    .then(client => {
      console.log('connected to DB ' + Client.options.database + ' ready to GET')
      client.release();
      return client.query(listSubscribers);
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