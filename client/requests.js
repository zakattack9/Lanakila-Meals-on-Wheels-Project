// ENDPOINT FOR TOPIC LAMBDAS:
// https://siixxnppxa.execute-api.us-west-2.amazonaws.com/dev/

function startGrpLoadAnimation() { //runs loading animation for displaying groups
  $('#grpTable tbody tr').remove(); //removes currently displayed topics
  $('.spinnerWrap')[1].style.display = "block";
}

// Gets all topics from DB
function loadGroups(){
  startGrpLoadAnimation();
   enableDelete(); //removes highlight for trash

  $.ajax({
    url: "https://siixxnppxa.execute-api.us-west-2.amazonaws.com/dev/get",
    method: 'GET',
    "Content-Type": "application/json",
  })
  .done((response) => {
    $('.spinnerWrap')[1].style.display = "none";
    //console.log(response)
    $('#groupSelect').empty(); //clears options from dropdown in "add subscriber"
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
            <span style="font-weight:bold" class="colTitleSpan">${currVal.group_name}</span>
          </div>
          <div id="grp_${currVal.id}" class="subWrap" ondrop="drop(event, this)" ondragover="allowDrop(event)">
          </div>
        </div>
      `)
    })

    loadGrpSubs();

    $('#groupOverlayWrap').empty();
    response.map(currVal => { //adds group columns in subscribers tab
      $('#groupOverlayWrap').append(`
        <div class="draggableGrp" ondragstart="dragStart(event)" draggable="true" id="dragGroup${currVal.id}">
          ${currVal.group_name}
          <br>
          <br>
          Members: <span class="dragGrpCount">Loading...</span>
        </div>
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
  if($('#groupText').val().search(/^[a-zA-Z0-9-_ ]+$/) == -1) { //checks whether input has valid values
    $('#validNameWarning')[0].innerText = "Must contain only alphanumeric characters, hyphens (-), or underscores ( _ )";
  }else {
    $('#addPopup')[0].style.display = "none"; //auto closes the create group popup
    startGrpLoadAnimation();

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
  }  
})

// Deletes groups from DB and SNS
function deleteTopics(id) {
  startGrpLoadAnimation();
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



// ENDPOINT FOR MANAGING SUBSCRIBER'S GROUPS:
// https://nsyvxbfzm5.execute-api.us-west-2.amazonaws.com/dev/

//Loads columns with all the subs in their respective groups
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
        <div class="singleSub draggableSub" ondragstart="dragStart(event)" draggable="true" id="${currVal.id}${currVal.sub_id}">
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

    $('.subWrap').map((currVal, index) => { //adds number of members to group table
      //console.log(index)
      let grpCountID = "#" + index.id.slice(-2);
      let grpAmt = $(index).children().length;
      //console.log(grpAmt)
      $(grpCountID).find('.memberCount')[0].innerText = grpAmt

      let dragGrp = "#dragGroup" + index.id.slice(-2);
      $(dragGrp).find('.dragGrpCount')[0].innerText = grpAmt
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



// ENDPOINT FOR SUBSCRIBER LAMBDAS
// https://tp2yeoirff.execute-api.us-west-2.amazonaws.com/dev/

//Start load animation for subscriber's table
function startSubLoadAnimation() {
  $('#subsTable tbody tr').remove(); //removes currently displayed subs
  $('.spinnerWrap')[2].style.display = "block";
}

//Managing subscriber requests
let allSubContacts = [];
function loadSubscribers() {
  startSubLoadAnimation();
  allSubContacts = [];
  enableDeleteSubs(); //removes highlight for trash

  $.ajax({
    url: "https://tp2yeoirff.execute-api.us-west-2.amazonaws.com/dev/get",
    method: 'GET',
    "Content-Type": "application/json",
  })
  .done((response) => {
    $('.spinnerWrap')[2].style.display = "none";

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

      allSubContacts.push(currVal.subscription_contact);
    })
    //console.log(allSubContacts);

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

function resetAddSubPop() { //removes all unsubmited data from form in subs tab
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

  $('#addSubWarning')[0].innerText = ""; //removes warning message
  $('#addSubNameWarning')[0].innerText = "";
}

$('#createSub').click(function(){
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

  if($('#subText').val().length === 0 || allSubContacts.includes(subContact) || $('#contactInfo').val().length === 0) { //adds warning if any fields are left blank or the contact typed in already exists in the DB

    if($('#subText').val().length === 0) { //adds warning if no name is typed in
      $('#addSubNameWarning')[0].innerText = "Field is empty, please type in a name"; 
    }else {
      $('#addSubNameWarning')[0].innerText = "";
    }

    if($('#contactInfo').val().length === 0) {
      $('#addSubWarning')[0].innerText = "Field is empty, please type in a phone number or email contact";
    }else {
      if(allSubContacts.includes(subContact)) {
        $('#addSubWarning')[0].innerText = "The phone number or email inputted already exists in the system";
      }else {
        $('#addSubWarning')[0].innerText = "";
      }
    }
    
  }else {

    $('#addSubPop')[0].style.display = "none";
    startSubLoadAnimation();

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

    resetAddSubPop(); //resets values in "add subscriber" popup
    
  }
})

$('#closeAddSub').click(function(){ //closes "add subscriber" popup when pressing the X
  resetAddSubPop();
})

function deleteSubs(id) {
  startSubLoadAnimation();
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



// ENDPOINT FOR MESSAGE LAMBDAS:
// https://c7ujder64c.execute-api.us-west-2.amazonaws.com/dev/

//Start load animation for messages workspace
function startMsgLoadAnimation() {
  $('#msgCol').empty(); //removes currently displayed subs
  $('.scrolls').empty(); //removes currently displayed sub
  $('.scrolls')[0].style.display = "none"
  $('.spinnerWrap')[3].style.display = "block";
  $('.spinnerWrap')[0].style.display = "block";
}

function getMessages() {
  startMsgLoadAnimation();

  $.ajax({
    url: "https://c7ujder64c.execute-api.us-west-2.amazonaws.com/dev/get",
    method: 'GET',
    "Content-Type": "application/json",
  })
  .done((response) => {
    $('.spinnerWrap')[3].style.display = "none";
    $('.spinnerWrap')[0].style.display = "none";
    $('.scrolls')[0].style.display = "block"
    $('#msgOverlayWrap').empty();
    //console.log(response);

    response.map(currVal => {
      $('#msgCol').prepend(`
        <div class="msgGradient" id="msg000${currVal.id}" onclick="checkMsg(this)">
          <div class="msgAndDate">
            <p class="message">${currVal.message_text}</p>
            <span class="date">${currVal.last_edited.substring(0, 10)}</span>
          </div>
          <div class="modeContainer">
            <div class="msgCheck"></div>
            <button class="msgEdit" onclick="editMsgText(this)"><img src="./images/edit.png"></button>
          </div>
        </div>
      `);

      $('#msgOverlayWrap').prepend(`
        <div class="draggableMsg" ondragstart="dragStart(event)" draggable="true" id="msgDrag0${currVal.id}">${currVal.message_text}</div>
      `)
    
    })

    //for recent messages
    let reversedMsgs = response.slice(0).reverse();
    for(let i = 0; i < 5; i++){ //change second statement to determine how many messages show up in recent messages
      //console.log(reversedMsgs[i]);
      $('.scrolls').append(`
        <div class="recentText">
          ${reversedMsgs[i].message_text}
          <br>
          <br>
          <span>Created On: ${reversedMsgs[i].last_edited.substring(0, 10)} at ${reversedMsgs[i].last_edited.substring(10, 16)}</span>
        </div>
      `)
    }

  })
  .fail((err) => {
    console.log('error', err);
  })
}
getMessages();

$('#reloadMsg').click(function(){
  getMessages();
})

$('#createMsg').click(function(){
  $('#addMsgPopup')[0].style.display = "none";
  startMsgLoadAnimation();

  $.ajax({
    url: "https://c7ujder64c.execute-api.us-west-2.amazonaws.com/dev/post",
    method: 'POST',
    contentType: "application/json; charset=utf-8",
    dataType: 'JSON',
    data: JSON.stringify($('#typeMsg').val())
  })
  .done((response) => {
    //console.log(response)
    getMessages();
  })
  .fail((err) => {
    console.log(err);
  })

  $('#typeMsg').val('');
});

function deleteMessage(id) {
  startMsgLoadAnimation();

  $.ajax({
    url: "https://c7ujder64c.execute-api.us-west-2.amazonaws.com/dev/delete",
    method: 'DELETE',
    contentType: "application/json; charset=utf-8",
    dataType: 'JSON',
    data: JSON.stringify(id)
  })
  .done((response) => {
    console.log(response)
    getMessages();
  })
  .fail((err) => {
    console.log(err);
  }) 
  
}

$('#saveMessage').click(function(){
  let newMsgText = $('#editMsgHere').val();
  startMsgLoadAnimation();

  $.ajax({
    url: "https://c7ujder64c.execute-api.us-west-2.amazonaws.com/dev/put",
    method: 'PUT',
    contentType: "application/json; charset=utf-8",
    dataType: 'JSON',
    data: JSON.stringify([newMsgText, oldMsgText, +editedMsgID])
  })
  .done((response) => {
    console.log(response)
    getMessages();
  })
  .fail((err) => {
    console.log(err);
  }) 
})

//BROADCAST
$('#sendButton').click(function(){ //broadcasts message to groups
  let msgData = $('#msgInput').find('.draggableMsg')[0].innerText;
  let grpID = $('#groupInput').find('.draggableGrp')[0].id.slice(-2);
  let msgID = $('#msgInput').find('.draggableMsg')[0].id.slice(-2);

  $.ajax({
    url: "https://c7ujder64c.execute-api.us-west-2.amazonaws.com/dev/broadcast",
    method: 'POST',
    contentType: "application/json; charset=utf-8",
    dataType: 'JSON',
    data: JSON.stringify([grpID, msgData, msgID])
  })
  .done((response) => {
    console.log(response)

  })
  .fail((err) => {
    console.log(err);
  }) 
})



//QUICK SEND
var qsTypeData = [];
var qsTextData = [];
var loaded = false;
function loadQuickSend() {
  $('.spinnerWrap')[4].style.display = "block";
  $.ajax({
    url: "https://1j9grmyxgj.execute-api.us-west-2.amazonaws.com/dev/get",
    method: 'GET',
    "Content-Type": "application/json",
  })
  .done((response) => {
    console.log(response);
    $('.spinnerWrap')[4].style.display = "none";
    $('.scroll').empty();
    $('#msgContainer span').empty();
    response.map(currVal => {
      var newCurrVal = currVal.message_text;
      var regex = /{\s*(.*?)\s*}/g;
        while (m = regex.exec(newCurrVal)) {
          newCurrVal = newCurrVal.replace("{"+m[1]+"}",'<input type="textbox" placeholder="'+m[1]+'">');
        }
        qsTypeData[currVal.id]=currVal.message_type;
        qsTextData[currVal.id]=currVal.message_text;
        loaded=true;
        $('.scroll').append(`<div class="msgType" id="${currVal.id}" onclick="switchType(this.id)" onclick="exitMsg(this.id)"><h3>${currVal.message_type}</h3></div>`)
        $('#msgContainer').append(`<div id="${currVal.id}-msg" class="msgPre">${newCurrVal}</div>`)
    })
  })
  .fail((err) => {
    console.log('error', err);
  })
}
loadQuickSend();

var concatedMessage ="";
function sendToAll(){
  var arr = document.getElementById(currentType+"-msg").querySelectorAll("input");
  concatedMessage = document.getElementById(currentType+"-msg").innerHTML;
  var filled = true;
    var regex = /placeholder="\s*(.*?)\s*">/g;
    concatedMessage = concatedMessage.replace("<p>","");
    concatedMessage = concatedMessage.replace("</p>","");
    var counter = 0;
    console.log(concatedMessage)
    while (m = regex.exec(concatedMessage)) {
      if (arr[counter].value!=="" ){
        console.log("here: " + m[0])
        concatedMessage = concatedMessage.replace('<input type="textbox" '+m[0],arr[counter].value);
        console.log(concatedMessage)
      counter +=1;
      }
      else{
        filled=false;
        alert("please fill in all fields");
        break;
      }
    }

  if(filled==true){
    console.log("test", currentType, concatedMessage)
    $.ajax({
     url: 'https://1j9grmyxgj.execute-api.us-west-2.amazonaws.com/dev/send',
      method: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'JSON',
      data: JSON.stringify([43, concatedMessage, qsTypeData[currentType]])
    });
  }
}

function editQS(){
  if (typeFirst == false){
    newContent.type = document.getElementById('editTypeBox').value
  }
  if( textFirst == false){
    newContent.text = document.getElementById("editBox").value
  }
  console.log(newContent,oldContent)
  $.ajax({
    url: "https://1j9grmyxgj.execute-api.us-west-2.amazonaws.com/dev/put",
    method: 'PUT',
    contentType: "application/json; charset=utf-8",
    dataType: 'JSON',
    data: JSON.stringify([newContent, oldContent])
  })
}
