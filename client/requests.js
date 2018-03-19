// ENDPOINT FOR TOPIC LAMBDAS:
// https://97vxcrgnxh.execute-api.us-west-2.amazonaws.com/beta


// Gets all topics from DB
function loadGroups(){
  $('#grpTable tbody tr').remove(); //removes currently displayed topics
  $('#spinnerWrap')[0].style.display = "block";

  $.ajax({
    url: "https://siixxnppxa.execute-api.us-west-2.amazonaws.com/dev/get",
    method: 'GET',
    "Content-Type": "application/json",
  })
  .done((response) => {
    $('#spinnerWrap')[0].style.display = "none";
  	//console.log(response)
    response.map(currVal => {
    	//console.log(currVal)
    	$('#grpTable tbody').append(`
  			<tr id="${currVal.id}" onclick="highlightTopic(this);">
  		  	<td>
  		  		<div class="customCheck">
                
            </div>
  		  	</td>
  		    <td class="groupName">${currVal.group_name}</td>
  		    <td>1000</td>
  		    <td class="groupDate">${currVal.date_created.substring(0, 10)}</td>
  		  </tr>
    	`)
    })
  })
  .fail((err) => {
    console.log('error', err);
  })
}
loadGroups();

// Reloads groups when clicking refresh button
$('#reloadGrp').click(function(){
  loadGroups();
})

// Creates and adds new topic to DB
$('#createGrp').click(function(){
  $('#addPopup')[0].style.display = "none";

  $.ajax({
    url: "https://siixxnppxa.execute-api.us-west-2.amazonaws.com/dev/post",
    method: 'POST',
    contentType: "application/json; charset=utf-8",
    dataType: 'JSON',
    data: JSON.stringify($('#groupText').val())
  })
  .done((response) => {
    //console.log(response)
    loadGroups(); //reload groups
  })
  .fail((err) => {
    console.log(err.responseText);
  }) 

  $('#groupText').val(''); //resets inputboc
})

// Deletes groups from DB and SNS
function deleteTopics(id) {
  //console.log(id);
  $.ajax({
    url: "https://siixxnppxa.execute-api.us-west-2.amazonaws.com/dev/delete",
    method: 'DELETE',
    contentType: "application/json; charset=utf-8",
    dataType: 'JSON',
    data: JSON.stringify(id)
  })
  .done((response) => {
    //console.log(response)
    loadGroups(); //reload groups
  })
  .fail((err) => {
    console.log(err.responseText);
  }) 
}


// ENDPOINT FOR SUBSCRIBER LAMBDAS:
// https://rdv9z24zqe.execute-api.us-west-2.amazonaws.com/beta

// $.ajax({
//   url: "https://rdv9z24zqe.execute-api.us-west-2.amazonaws.com/beta/get",
//   method: 'GET',
//   "Content-Type": "application/json",
// })
// .done((response) => {
//   console.log(response.body)
// })
// .fail((err) => {
//   console.log('error', err);
// })