const newTopic = {
	"name": "test2"
}
let createTopic = () => $.ajax({
   url: 'https://cwrqeln3k1.execute-api.us-east-1.amazonaws.com/dev/post',
    method: 'POST',
    contentType: 'application/json; charset=utf-8',
    dataType: 'json',
    data: JSON.stringify(newTopic)
});