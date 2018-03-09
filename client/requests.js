// ENDPOINT FOR TOPIC LAMBDAS:
// https://97vxcrgnxh.execute-api.us-west-2.amazonaws.com/beta

// $.ajax({
//   url: "https://97vxcrgnxh.execute-api.us-west-2.amazonaws.com/beta/get",
//   method: 'GET',
//   contentType: "application/json; charset=utf-8",
//   dataType: 'JSON',
//   data: JSON.stringify({
//     "name" : volunteers[0].name,
//     "job" : volunteers[0].job,
//     "date" : volunteers[0].date
//   })
// })


//  GET - https://8km337y1gi.execute-api.us-west-2.amazonaws.com/dev/listTopics
//  POST - https://8km337y1gi.execute-api.us-west-2.amazonaws.com/dev/createTopic
$.ajax({
  url: "https://8km337y1gi.execute-api.us-west-2.amazonaws.com/dev/listTopics",
  method: 'GET',
  "Content-Type": "application/json",
})
.done((response) => {
  console.log(response)
})
.fail((err) => {
  console.log('error', err);
})