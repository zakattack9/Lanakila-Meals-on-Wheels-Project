// ENDPOINT FOR TOPIC LAMBDAS:
// https://97vxcrgnxh.execute-api.us-west-2.amazonaws.com/beta


// Gets all topics from DB
function loadGroups(){
  $('#grpTable tbody tr').remove(); //removes currently displayed topics
  $('.spinnerWrap')[0].style.display = "block";

  $.ajax({
    url: "https://siixxnppxa.execute-api.us-west-2.amazonaws.com/dev/get",
    method: 'GET',
    "Content-Type": "application/json",
  })
  .done((response) => {
    $('.spinnerWrap')[0].style.display = "none";
  	//console.log(response)
    response.map(currVal => { //adds groups to groups table
    	//console.log(currVal)
    	$('#grpTable tbody').append(`
  			<tr id="${currVal.id}" onclick="highlightTopic(this);">
  		  	<td>
  		  		<div class="customCheck">
                
            </div>
  		  	</td>
  		    <td class="groupName">${currVal.group_name}</td>
  		    <td class="memberCount">Loading...</td>
  		    <td class="groupDate">${currVal.date_created.substring(0, 10)}</td>
  		  </tr>
    	`)

      if(currVal.group_name === "Everyone"){
        return "Skipping this selection" //prevents this option from being added to dropdown
      }else{
        $('#groupSelect').append(`<option value="${currVal.id}">${currVal.group_name}</option>`) //adds items to select menu in subs tab
      }
    })


    $('#openGrp').empty();
    response.map(currVal => { //adds group columns in subscribers tab
      $('#openGrp').append(`
        <div class="colGroup">
          <div class="colTitle">
            <span style="font-weight:bold">${currVal.group_name}</span>
          </div>

          <div id="grp_${currVal.id}" class="subWrap" ondrop="drop(event, this)" ondragover="allowDrop(event)">

          </div>

        </div>

      `)

    })

    loadGrpSubs();

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

  $('#groupText').val(''); //resets input for group name
})

$('#closePopup').click(function(){
  $('#groupText').val('');
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

function loadGrpSubs() {
  $.ajax({
    url: "https://nsyvxbfzm5.execute-api.us-west-2.amazonaws.com/dev/get",
    method: 'GET',
    "Content-Type": "application/json",
  })
  .done((response) => {
    //console.log(response)
    //console.log($('.subWrap'));
    $('.subWrap').map((currVal, index) => { //empties out columns
      $(index).empty();
    })

    response.map(currVal => {
      let grpColumn = '#grp_' + currVal.id;
      //console.log(appendTo)
      $(grpColumn).append(`
        <div class="singleSub draggable" ondragstart="dragStart(event)" draggable="true" id="${currVal.id}${currVal.sub_id}">
          <span class="targetSubName">${currVal.subscription_name}</span>
          <br>
          <span class="subEndpoint">${currVal.subscription_endpoint.toUpperCase()}</span>
          <span class="targetSubContact" style="display:none">${currVal.subscription_contact}</span>
        </div>
      `)
    })

    $('.singleSub').on('mousedown', function(event){ //adds event handler to open clone feature
      $('#tempSide')[0].style.width = "220px";
    })

    $('.subWrap').map((currVal, index) => { //number of members to group table
      let grpCountID = "#" + index.id.slice(-2);
      let grpAmt = $(index).children().length;
      //console.log(grpAmt)
      $(grpCountID).find('.memberCount')[0].innerText = grpAmt
    })
  })
  .fail((err) => {
    console.log('error', err);
  })
}

function changeGrpSubs(subQueue) {
  $.ajax({
    url: "https://nsyvxbfzm5.execute-api.us-west-2.amazonaws.com/dev/post",
    method: 'POST',
    contentType: "application/json; charset=utf-8",
    dataType: 'JSON',
    data: JSON.stringify(subQueue)
  })
  .done((response) => {
    console.log(response)
    loadGrpSubs();
  })
  .fail((err) => {
    console.log(err);
  }) 
}

function loadSubscribers() {
  $('#subsTable tbody tr').remove(); //removes currently displayed topics
  $('.spinnerWrap')[1].style.display = "block";

  $.ajax({
    url: "https://tp2yeoirff.execute-api.us-west-2.amazonaws.com/dev/get",
    method: 'GET',
    "Content-Type": "application/json",
  })
  .done((response) => {
    $('.spinnerWrap')[1].style.display = "none";

    response.map(currVal => {
      //console.log(currVal)
      $('#subsTable tbody').append(`
        <tr id="${currVal.sub_id}" onclick="highlightSub(this);">
          <td>
            <div class="customCheckSub">
                
            </div>
          </td>
          <td class="subName">${currVal.subscription_name}</td>
          <td>${currVal.subscription_endpoint.toUpperCase()}</td>
          <td class="subContact">${currVal.subscription_contact}</td>
        </tr>
      `)
    })
  })
  .fail((err) => {
    console.log('error', err);
  })
}
loadSubscribers();

// Reloads groups when clicking refresh button
$('#reloadSub').click(function(){
  loadSubscribers();
})

function resetAddSubPop(){ //removes all unsubmited data from form
  $('#subText').val('');
  $('#contactInfo').val('');
  //resets circle option back to "text"
  $('#emailCircle')[0].style.backgroundColor = "#fcd8b6";
  $('#emailCircle').empty();
  $('#emailCircle').removeClass('isChecked');
  $('#emailProtText')[0].style.color = "gray";

  $('#textCircle').addClass('isChecked');
  $('#textCircle').empty();
  $('#textCircle').append(`<div class="innerCircle"></div>`);
  $('#textProtText')[0].style.color = "black";
  $('#contactTitle')[0].innerText = "Phone Number (With International Call Prefix):";
  $('#contactInfo').attr("placeholder", "Ex. 18081234567");
}

$('#createSub').click(function(){
  $('#addSubPop')[0].style.display = "none";

  let subName, subProtocol, subContact, groupID;
  subName = $('#subText').val();
  subProtocol;
  subContact = $('#contactInfo').val();
  groupID = $('#groupSelect').val();

  if($('#textCircle').hasClass('isChecked')){
    subProtocol = 'sms';
  }else {
    subProtocol = 'email';
  }

  $.ajax({
    url: "https://tp2yeoirff.execute-api.us-west-2.amazonaws.com/dev/post",
    method: 'POST',
    contentType: "application/json; charset=utf-8",
    dataType: 'JSON',
    data: JSON.stringify({
      "subName" : subName,
      "subProtocol" : subProtocol,
      "subContact" : subContact,
      "groupID" : groupID
    })
  })
  .done((response) => {
    //console.log(response)
    loadSubscribers();
    loadGrpSubs();
  })
  .fail((err) => {
    console.log(err);
  }) 
  resetAddSubPop();
})

$('#closeAddSub').click(function(){
  resetAddSubPop();
})

function deleteSubs(id) {
  //console.log(id);
  $.ajax({
    url: "https://tp2yeoirff.execute-api.us-west-2.amazonaws.com/dev/delete",
    method: 'DELETE',
    contentType: "application/json; charset=utf-8",
    dataType: 'JSON',
    data: JSON.stringify(id)
  })
  .done((response) => {
    console.log(response)
    loadSubscribers(); //reload groups
    loadGrpSubs();
  })
  .fail((err) => {
    console.log(err);
  }) 
}


