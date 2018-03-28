'use strict';

const AWS = require('aws-sdk');
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

const sns = new AWS.SNS({apiVersion: '2010-03-31'});

module.exports.changeSubsGroup = (event, context, callback) => {
  console.log("Event Body",  event.body);
  let parseData = JSON.parse(event.body);

  //console.log(parseData);
  for(var i = 0; i < parseData.length; i++){
    console.log(parseData[i]);
    let oldGroup = parseData[i].oldGroup_id;
    let subID = parseData[i].sub_id;
    let newGroup = parseData[i].newGroup_id;
    let subProtocol = parseData[i].subInfo[2];
    let subEndpoint = parseData[i].subInfo[1];

    //unsubscribers users to new group and deletes item from groups_subscribers table
    let getSubARN = "SELECT subscription_arn FROM " + table[2] + " WHERE group_id = $1 AND subscriber_id = $2;";

    Client.connect() //connect to database
      .then(client => {
        console.log('connected to DB ' + Client.options.database + ' ready to GET')
        client.release();
        return client.query(getSubARN, [oldGroup, subID]);
      })
      .then(res => {
        console.log("SUB ARN FROM QUERY", res.rows[0].subscription_arn)
        var unsubParams = {
          SubscriptionArn: res.rows[0].subscription_arn
        };
        sns.unsubscribe(unsubParams, function(err, data) {
          if(err) {
            console.log("COULD NOT UNSUBSCRIBE USER")
            console.log(err, err.stack);
          }
          else {
            let deleteSubGrp = "DELETE FROM " + table[2] + " WHERE group_id = $1 AND subscriber_id = $2;";

            Client.connect() //connect to database
              .then(client => {
                console.log('connected to DB ' + Client.options.database + ' ready to GET')
                client.release();
                return client.query(deleteSubGrp, [oldGroup, subID]);
              })
              .then(res => {
                console.log("RESULT AFTER DELETE FROM TABLE", res)
              })
          }
        });
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


    //subscribers users to new group and updates groups_subscribers table
    let getTopicARN = "SELECT topic_arn FROM " + table[0] + " WHERE id = $1;";

    Client.connect()
      .then(client => {
        console.log('connected to DB ' + Client.options.database + ' ready to GET')
        client.release();
        return client.query(getTopicARN, [newGroup]);
      })
      .then(res => {
        console.log(res.rows)

        var subParams = {
          Protocol: subProtocol,
          TopicArn: res.rows[0].topic_arn,
          Endpoint: subEndpoint
        };

        sns.subscribe(subParams, function(err, data) {
          if(err) {
            console.log(err, err.stack);
          }
          else {
            let addSubGrp = "INSERT INTO " + table[2] + " VALUES($1, $2, $3);";
            
            Client.connect() //connect to database
              .then(client => {
                console.log('connected to DB ' + Client.options.database + ' ready to UPDATE GROUPS_SUBSCRIBERS')
                client.release();
                return client.query(addSubGrp, [newGroup, subID, data.SubscriptionArn]);
              })
              .then(res => {
                const response = { // updates client
                  statusCode: 200,
                  headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": true,
                  },
                  body: JSON.stringify(res)
                }
                callback(null, response);
              })
          }
        });
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
  }
};