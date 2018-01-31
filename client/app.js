
// how to make tabs on a single page
function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = $('.tabcontent');
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = $(".tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

function openMsgBox(evt, boxName) {
    var i, tabcontent, tablinks;
    tabcontent = $('.MsgTextbox');
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("quickMsgBox");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(boxName).style.display = "block";
    evt.currentTarget.className += " active";
}