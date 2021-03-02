//var currentlyOpenedDiv = "";
//var logoutPage = "";
//var timeoutPage = "";
//var resetTimeoutPage = "";
//var timeOutMiniSec = 14*60*1000;
//var waitingMiniSec = 1*60*1000;
//var nowKeepAliveValue;
//var startTimerId;
//var alertLanguage = "en";

//function keepAlive() {
//    nowKeepAliveValue = (new Date).valueOf();

//    if (alertLanguage == "en") {
//        alert('Your browser is idle for a period of time. For security, your connection will be terminated within 1 minute. Please click \"OK\" if you want to continue using this website. If there is no response, the system will be automatically logged out and the inputted data may be lost.');
//    } else {
//        //alert using local language here
//        alert('B?n ?a khong s? d?ng website qua lau. Vui long ch?n OK ?? ti?p t?c s? d?ng ho?c h? th?ng s? t? ??ng ??ng xu?t sau 1 phut.');
//    }
//    
//    var waitedValue = (new Date).valueOf();

//    if ((waitedValue - nowKeepAliveValue) > (waitingMiniSec)) {
//        window.location = timeoutPage;
//    } else {
//        resetTimeoutSession();
//        startTimerId = setTimeout("keepAlive()", timeOutMiniSec);
//    }
//}

//function resetTimeoutSession() {
//    var dummyImg = new Image();
//    dummyImg.src = resetTimeoutPage;
//}

//window.onbeforeunload = confirmExit;

var isLogined = false;
var logoutPage = "";

window.onbeforeunload = function (e) {
    // Ben - Temporarily disable the function as it has problem in IE10
    return;
    // --
    var e = (!e) ? window.event : e; //IE:Moz
    if (window.event.clientY < 0 && window.event.clientY < -80) {
        var xmlhttp;
        if (window.ActiveXObject) { // code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            xmlhttp.open("GET", logoutPage, false);
            xmlhttp.send();
        }
        if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
            xmlhttp.open("GET", logoutPage, false);
            xmlhttp.send();
        }
        if (isLogined) {
            winh = window.open(logoutPage);
        }
    }
}

startList = function() {
    if (document.all && document.getElementById) {
        navRoot = document.getElementById("nav");
        for (i = 0; i < navRoot.childNodes.length; i++) {
            node = navRoot.childNodes[i];
            if (node.nodeName == "LI") {
                node.onmouseover = function() {
                    this.className += " over";
                }
                node.onmouseout = function() {
                    this.className = this.className.replace(" over", "");
                }
            }
        }
    }
}
window.onload = startList;

function CollapseExpand(object) {
    var div = document.getElementById(object);
    if (currentlyOpenedDiv != "" && currentlyOpenedDiv != div) {
        // To keep it open.
        //currentlyOpenedDiv.style.display = "none";
    }
    if (div.style.display == "none") {
        div.style.display = "inline";
        currentlyOpenedDiv = div;
    }
    else {
        div.style.display = "none";
    }
}

function CollapseExpandAll(object, display) {
    var div = document.getElementById(object);
    div.style.display = display;
}

function ChangeAllToMinusText(plusMinusCellId) {
    try {
        var plusMinusCellObj = document.all(plusMinusCellId);
        if (plusMinusCellObj != null) {
            plusMinusCellObj.innerHTML = "<a>[-]</a>";
        }
    }
    catch (e) {
        alert("Error in ChangeAllToMinusText Method: " + e);
    }
}

function ChangeAllToPlusText(plusMinusCellId) {
    try {
        var plusMinusCellObj = document.all(plusMinusCellId);
        if (plusMinusCellObj != null) {
            plusMinusCellObj.innerHTML = "<a>[+]</a>";
        }
    }
    catch (e) {
        alert("Error in ChangeAllToMinusText Method: " + e);
    }
}

//This method will switch the plus to a minus and vice versa on the client side
function ChangePlusMinusText(plusMinusCellId) {
    try {
        var plusMinusCellObj = document.all(plusMinusCellId);
        if (plusMinusCellObj != null) {
            if (plusMinusCellObj.innerHTML.toLowerCase() == "<a>[+]</a>") {
                plusMinusCellObj.innerHTML = "<a>[-]</a>";
            }
            else {
                plusMinusCellObj.innerHTML = "<a>[+]</a>";
            }
        }
    }
    catch (e) {
        alert("Error in ChangePlusMinusText Method: " + e);
    }
}

function setLanguagePreferred(lang) {
    document.getElementById("language").value = lang;
}

var message = "对不起，禁止使用右键。";
// This method will disable the right click.
function click(e) {
    if (document.all) {
        if (event.button == 2) {
            alert(message);
            return false;
        }
    }
    if (document.layers) {
        if (e.which == 3) {
            alert(message);
            return false;
        }
    }
}
if (document.layers) {
    document.captureEvents(Event.MOUSEDOWN);
}
document.onmousedown = click;


function locatepopup(page) {
    w = 700;
    h = 600;
    l = (screen.availWidth - 10 - w) / 2;
    t = (screen.availHeight - 20 - h) / 2;
    mypopup = window.open(page, 'assist', 'resizable=yes, location=yes, scrollbars=yes,width=' + w + ', height=' + h + ',top=' + t + ',left=' + l);
    mypopup.focus();
}

function deleteRows(doc, tableId, deleteHeader) {
    var obj = doc.getElementById(tableId);
    if (obj == null)
        return;

    if (typeof deleteHeader == 'undefined')
        deleteHeader = false;
    var limit = (deleteHeader) ? 0 : 1;

    var rows = obj.rows;
    if (limit > rows.length)
        return;

    for (; rows.length > limit; ) {
        obj.deleteRow(limit);
    }
}

function postToUrl(path, params, method) {

    method = method || "post";     // Set method to post by default, if not specified.      

    // The rest of this code assumes you are not using a library.     
    // It can be made less wordy if you use one.     
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);

    for (var key in params) {
        if (params.hasOwnProperty(key)) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);
            form.appendChild(hiddenField);
        }
    }
    
    document.body.appendChild(form);
    form.submit();
}

function GetTimeDiff(date1, date2) {
    dt1 = new Date(date1);
    dt2 = new Date(date2);

    var diff;

    if (dt1 > dt2) {
        diff = dt1.getTime() - dt2.getTime();
    } else {
        diff = dt2.getTime() - dt1.getTime();
    }

    return diff;
}

function PadLeft(character, string, length) {
    var str = '' + string;
    while (str.length < length) {
        str = character + str;
    }
    return str;
}

function getFormatMonths(month, format) {
    var m_names = new Array("", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
    if (format == 'MMM') {
        relVal = m_names[month].substring(0, 3);
    }
    if (format == 'mm') {
        for (i = 0; i < m_names.length; i++) {
            if (m_names[i].indexOf(month, 0) != -1) {
                relVal = i - 1;
                break;
            }
        }
    }
    return relVal
}

function OpenDialog(dialogId, dialogTitle, widthSize, showCloseButton) {
    autoOpen:false,
			$("#" + dialogId).dialog({
			    autoOpen: false,
			    maxHeight: 400,
			    width: widthSize,
			    open: function () {
			        if (showCloseButton != undefined && !showCloseButton) {
			            $(this).parent().find(".ui-dialog-titlebar-close").hide();
			        }
			    },
			    modal: true
			});
    $("#" + dialogId).dialog("open");
}

function closeDialog(dialogId) {
    $("#" + dialogId).dialog("close");
}

function getDate(elementDateId) {
    var _result = null;
    var _isValidate = true;
    var _date = $("#" + elementDateId).val();
    _isValidate = _isValidate && validateDateString(_date, $("#" + elementDateId).datepicker('option', 'dateFormat'));
    if (_isValidate) {
        _result = $.datepicker.parseDate($("#" + elementDateId).datepicker('option', 'dateFormat'), _date);
    }
    else {
        _result = $("#" + elementDateId).val();
    }
    return _result;
}

//get datetime from jquery datepicker
//return dateTime object if the input is valid
//return org string value if the input is invalid
function getDateTime(elementDateId, elementTimeId, isAllDay) {
    var _result = null;
    var _isValidate = true;
    var _dateTime = $("#" + elementDateId).val();
    _isValidate = _isValidate && validateDateString(_dateTime, $("#" + elementDateId).datepicker('option', 'dateFormat'));
    if (!isAllDay) {
        _isValidate = _isValidate && validateTime($("#" + elementTimeId).val());
    }
    if (_isValidate) {
        _result = $.datepicker.parseDate($("#" + elementDateId).datepicker('option', 'dateFormat'), _dateTime);
        if (!isAllDay) {
            _result.setHours($("#" + elementTimeId).val().split(":")[0]);
            _result.setMinutes($("#" + elementTimeId).val().split(":")[1]);
        }
    }
    else {
        _result = $("#" + elementDateId).val() + $("#" + elementTimeId).val();
    }
    return _result;
}

//validate the date by input format
function validateDateString(input, format){
    try {
        if ($.datepicker.parseDate(format, input) == null) {
            return false;
        }
        return true; 
    }
    catch (e) {
        return false;
    }
}

//validate the time by format HH24:mm
function validateTime(input) {
    var _isValidate = true;
    var _hours = null;
    var _minutes = null;
    _isValidate = _isValidate && (input.split(':').length == 2);
    if (_isValidate) {
        _hours = input.split(':')[0];
        _minutes = input.split(':')[1];
        _isValidate = _isValidate && _hours.length==2 && !isNaN(_hours) && (parseInt(_hours) >= 0 && parseInt(_hours) <= 23);
        _isValidate = _isValidate && _minutes.length== 2 && !isNaN(_minutes) && (parseInt(_minutes) >= 0 && parseInt(_minutes) <= 59);
    }
    return _isValidate;
}

function isNullOrEmpty(str) {
    return (str == null || str == '');
}

function padZero(number, length) {
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }

    return str;
}

function showWaitingDialog() { 
    $("<div>").attr("id", "loadingScreen").addClass("LoadingScreen").html("<img src='../Content/images/icon_loading.gif'/>").dialog({
		autoOpen: false,	// set this to false so we can manually open it
		closeOnEscape: false,
		draggable: false,
		width: 100,
		minHeight: 120,
		modal: true,
		buttons: {},
		resizable: false,
		open: function() {
			// scrollbar fix for IE
            $(".ui-dialog-titlebar-close").hide();
			$('body').css('overflow','hidden');
		},
		close: function() {
			// reset overflow
			$('body').css('overflow','auto');
		}
	}); // end of dialog

    $("#loadingScreen").dialog('option', 'position', 'center'); 
    $("#loadingScreen").dialog('open');
}   

function hideWaitingDialog() {
	$("#loadingScreen").dialog('close').dialog("destroy").remove();
}

function parseDateWithISOFormat(s, trimTime) {
    //ISO_8601:yyyy-MM-ddThh:mm:ss
    if (!s || s == null) return null;
    var arr = s.split("T");
    var dateStr = arr[0];
    var timeStr = null;
    if (arr.length > 1) {
        timeStr = arr[1];
    }
    var _y = null,
        _m = null,
        _d = null,
        _hh = null,
        _mm = null,
        _ss = null;
    var dateArr = dateStr.split("-");
    if (dateArr.length == 3) {
        _y = parseInt(dateArr[0], 10);
        _m = parseInt(dateArr[1], 10) - 1;
        _d = parseInt(dateArr[2], 10);
        if (!timeStr) {
            return new Date(_y, _m, _d);
        }
    }

    if (timeStr && !trimTime) {
        var timeArr = timeStr.split(":");
        if (timeArr.length >= 3) {
            _hh = parseInt(timeArr[0], 10);
            _mm = parseInt(timeArr[1], 10);
            _ss = parseInt(timeArr[2], 10);
            return new Date(_y, _m, _d, _hh, _mm, _ss);
        }
    }
    else {
        return new Date(_y, _m, _d, 0, 0, 0);
    }

    return null;
};
