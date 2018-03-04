//const dragula = require('dragula');

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

var openOverlay;
$('#msgInput').on('click', function(){
	$('#groupInput').removeAttr('ondrop ondragover');
	$('#msgInput').attr({ondrop:'drop(event, this)', ondragover:'allowDrop(event)'});

	$('#groupOverlay')[0].style.width = "0";
	$('#msgOverlay')[0].style.width = "400px";
	openOverlay = 'msg';
})

$('#groupInput').on('click', function(){
	$('#msgInput').removeAttr('ondrop ondragover');
	$('#groupInput').attr({ondrop:'drop(event, this)', ondragover:'allowDrop(event)'});

	$('#msgOverlay')[0].style.width = "0";
	$('#groupOverlay')[0].style.width = "400px";
	openOverlay = 'group';
})

$('#closeMsg').on('click', function(){
	$('#msgOverlay')[0].style.width = "0";
})

$('#closeGroup').on('click', function(){
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

$('.draggable').mousedown(function(){
	if(openOverlay === 'msg'){
	  $('#msgWarning').text("Drop Your Message Here");	
	}else if(openOverlay == 'group'){
		$('#grpWarning').text("Drop Your Group Here");
	}
})

$('.draggable').mouseup(function(){
	if(openOverlay === 'msg'){
	  $('#msgWarning').text("");	
	}else if(openOverlay == 'group'){
		$('#grpWarning').text("");
	}
})
