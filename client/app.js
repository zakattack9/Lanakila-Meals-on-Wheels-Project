$(document).ready(function() {
	document.getElementById('broadcast').classList.add("visisble"); //if not in .ready, you will not be able to rmeove the class "visible" from this element
	$('.broadcast').addClass('active');
})

function switchWorkspace(el) {
	let elClass = el.classList[1];
	var children = $('#workspace')[0].children;
	for (var i = 0; i < children.length; i++) { //makes current workspace disappear
		children[i].classList.remove("visisble");
		children[i].classList.add("hidden");
	}
	document.getElementById(elClass).classList.remove("hidden");
	document.getElementById(elClass).classList.add("visisble");
}

$("#optionsGroup").on('click','.option', function(){ //keeps sidebar items white
  $(this).addClass('active');
  $(this).siblings().removeClass('active');
})

//BROADCAST JS START
var openOverlay;
$('#msgInput').on('click', function(){ //opens overlay for messages
	$('#groupInput').removeAttr('ondrop ondragover');
	$('#msgInput').attr({ondrop:'drop(event, this)', ondragover:'allowDrop(event)'});

	$('#groupOverlay')[0].style.width = "0";
	$('#msgOverlay')[0].style.width = "400px";
	openOverlay = 'msg';
})

$('#groupInput').on('click', function(){ //opens overlay for groups
	$('#msgInput').removeAttr('ondrop ondragover');
	$('#groupInput').attr({ondrop:'drop(event, this)', ondragover:'allowDrop(event)'});

	$('#msgOverlay')[0].style.width = "0";
	$('#groupOverlay')[0].style.width = "400px";
	openOverlay = 'group';
})

$('#closeMsg').on('click', function(){ //closes message overlay
	$('#msgOverlay')[0].style.width = "0";
})

$('#closeGroup').on('click', function(){ //closes group overlay
	$('#groupOverlay')[0].style.width = "0";
})

$('.option').on('click', function(){ //closes open overlay when switching workspace
	$('#msgOverlay')[0].style.width = "0";
	$('#groupOverlay')[0].style.width = "0";
})

function dragStart(event) {
  event.dataTransfer.setData("Text", event.target.id);
}

function allowDrop(event) {
  event.preventDefault();
}

function drop(event, element) {
	//element.parentElement.id
  event.preventDefault();
  var data = event.dataTransfer.getData("Text");
  
  if(element.id === 'msgInput' || element.id === 'groupInput'){ //expands message on drop
  	document.getElementById(data).classList.add('expand');
  }else if(element.id === 'msgOverlay' || element.id === 'groupOverlay'){
  	document.getElementById(data).classList.remove('expand');
  }
  
  //conditional must go before appending
  element.appendChild(document.getElementById(data));
}

$('.draggable').mousedown(function(){ //shows message in message input on hold
	if(openOverlay === 'msg'){
	  $('#msgWarning').text("Drop Your Message Here");	
	}else if(openOverlay == 'group'){
		$('#grpWarning').text("Drop Your Group Here");
	}
})

$('.draggable').mouseup(function(){ //shows message in group input on hold
	if(openOverlay === 'msg'){
	  $('#msgWarning').text("");	
	}else if(openOverlay == 'group'){
		$('#grpWarning').text("");
	}
})

$('.draggable').mouseover(function(){ //shows message in group input on hold
	if(openOverlay === 'msg'){
	  $('#msgWarning').text("");	
	}else if(openOverlay == 'group'){
		$('#grpWarning').text("");
	}
})
//BROADCAST JS END


//GROUPS JS START
$('.customBox span').click(function(){ //checks off boxes
  if($(this).hasClass('isChecked')){
  	$(this).removeClass('isChecked');
  }else{
  	$(this).addClass('isChecked');
  }
});

$('#checkAll span').click(function(){ //checks all boxes on/off
	if($(this).hasClass('isChecked')){
		$(this).removeClass('isChecked');
		$('.customBox span').map((currVal, index) => {
			$(index).removeClass('isChecked');
			index.parentElement.parentElement.parentElement.style.backgroundColor = "white";
		});
	}else{
		$(this).addClass('isChecked');
		$('.customBox span').map((currVal, index) => {
			$(index).addClass('isChecked');
			index.parentElement.parentElement.parentElement.style.backgroundColor = "#fcd8b6";
		});
	}
})

$('#reloadGrp').click(function(){ //runs refresh button animation
	if($('#reloadGrp img')[0].style.animationName == "reload"){
		$('#reloadGrp img')[0].style.animationName = "resetReload";
	}else{
		$('#reloadGrp img')[0].style.animationName = "reload"
		$('#reloadGrp img')[0].style.animationPlayState = "running";
	}
})

$('#grpTable tr td').click(function(){ //highlights whole row
	let row = this.parentElement;
	let currCheck = this.parentElement.firstElementChild.firstElementChild.lastElementChild;
	var editingGrp = false;
	if($(currCheck).hasClass('isChecked')){
		if(event.target.className === 'editBtn'){ //checks if clicking on edit button
			let ogGrpName = event.target.parentElement.firstChild.nodeValue;

			editingGrp = true;
			if(editingGrp){
				event.target.parentElement.firstChild.remove();
				let input = $('<input>').attr({type:'text', value: ogGrpName, class:'tempInp'})
				event.target.parentElement.prepend(input[0])
				
			}

			console.log(event.target.parentElement.firstChild.el)
		}else if(editingGrp === false){
  		$(currCheck).removeClass('isChecked');
  		row.style.backgroundColor = "white";

	  	row.getElementsByTagName('td')[1].lastElementChild.remove();
		}
  }else{
  	$(currCheck).addClass('isChecked');
		row.style.backgroundColor = "#fcd8b6";

  	let img = $('<img/>').attr({class:'editBtn', src:'./images/edit.png'}) //create edit images
  	row.getElementsByTagName('td')[1].append(img[0])
  }
})






//GROUPS JS END