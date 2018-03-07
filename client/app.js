let listTopics = () => $.ajax({
  	url: 'https://125lscvwqe.execute-api.us-west-2.amazonaws.com/dev/listTopics',
  	method: 'GET',
  	success: (data) => console.log(data),
 });

const newTopic = {
	"name": "test2"
}
let createTopic = () => $.ajax({
   url: 'https://125lscvwqe.execute-api.us-west-2.amazonaws.com/dev/createTopic',
    method: 'POST',
    contentType: 'application/json; charset=utf-8',
    dataType: 'json',
    data: JSON.stringify(newTopic)
});